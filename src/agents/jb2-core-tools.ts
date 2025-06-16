/*
 * jb2-core-tools.ts  (rev. standalone‑helpers)
 * --------------------------------------------------
 * ➊  Primitive network helpers (NOT agentic) that wrap
 *     jb2Fetch.  These are reused by every composite tool so
 *     no tool ever calls another tool’s .execute method.
 * ➋  Zod‑typed agent tools created via `tool()`.
 * --------------------------------------------------
 */
import { tool, Tool } from '@openai/agents';
import { jb2Fetch }   from './jb2tools.generated';   // auth‑aware fetch
import { z }          from 'zod';

/* --------------------------------------------------
 * Reusable utility
 * ------------------------------------------------*/
function todayPlus(days = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().substring(0, 10);
}

function qs(opts: {
  filter: { field: string; value: string | number; op?: 'eq'|'gt'|'lt'|'in' };
  fields?: string; aggregate?: string;
  take?: number; skip?: number; sort?: string;
}): string {
  const p = new URLSearchParams();

  // always nest under filters[…]
  const op = opts.filter.op ?? 'eq';
  const key = op === 'eq'
    ? `filters[${opts.filter.field}]`
    : `filters[${opts.filter.field}][${op}]`;
  p.append(key, String(opts.filter.value));

  if (opts.fields)    p.append('fields',    opts.fields);
  if (opts.aggregate) p.append('aggregate', opts.aggregate);
  if (opts.take!=null)p.append('take',      String(opts.take));
  if (opts.skip!=null)p.append('skip',      String(opts.skip));
  if (opts.sort)      p.append('sort',      opts.sort);

  return '?' + p.toString();
}



/* =========================================================
 * ➊ PRIMITIVE NETWORK HELPERS (non‑agentic)
 * ========================================================*/
const fetchOrderLines = (orderNumber: string) => {
  const fields = 'orderNumber,partNumber,quantityOrdered';
  return jb2Fetch(
    'get',
    `/api/v1/order-line-items` +
      `?fields=${encodeURIComponent(fields)}` +
      `&orderNumber=${encodeURIComponent(orderNumber)}`,
  );
};

const fetchBinLocations = (partNumber: string) =>
  jb2Fetch(
    'get',
    '/api/v1/bin-locations' +
      qs({
        filter: { field: 'partNumber', value: partNumber },
        fields: 'partNumber,bin,quantityOnHand',
      }),
  );

const fetchOnHandQty = async (partNumber: string) => {
  const res = await jb2Fetch(
    'get',
    `/api/v1/bin-locations?fields=quantityOnHand&partNumber=${encodeURIComponent(
      partNumber,
    )}`,
  );

  // JobBOSS² returns one row per bin; add them up
  const rows   = res.items ?? res.Data ?? [];
  const total  = rows.reduce(
    (sum: number, r: { quantityOnHand?: number }) => sum + (r.quantityOnHand ?? 0),
    0,
  );

  return { quantityOnHand: total };
};

const createPOHeader = (supplier: string, requiredDate: string = todayPlus(14)) =>
  jb2Fetch('post', '/api/v1/purchase-orders', { supplier, requiredDate });

const addPOLineItem = (
  poNumber: string,
  partNumber: string,
  quantity: number,
  dueDate: string = todayPlus(14),
) =>
  jb2Fetch('post', '/api/v1/purchase-order-line-items', {
    poNumber,
    partNumber,
    quantity,
    dueDate,
  });

const finalizePOHeader = (
  poNumber: string,
  status = 'Approved',
  promisedDate?: string,
) =>
  jb2Fetch('patch', `/api/v1/purchase-orders/${encodeURIComponent(poNumber)}`, {
    status,
    promisedDate,
  });

const fetchVendorsForPart = (partNumber: string) =>
  jb2Fetch(
    'get',
    '/api/v1/approved-vendors' +
      qs({ filter: { field: 'partNumber', value: partNumber } }),
  );

const fetchSafetyStock = () => jb2Fetch('get', '/api/v1/safety-stock');

const fetchOpenOrders = (horizon = 7) =>
  jb2Fetch(
    'get',
    '/api/v1/orders' +
      qs({
        filter: {
          field: 'status',
          value: '("Open","Picked")', // JobBOSS² “in” list
          op: 'in',
        },
      }) +
      `&horizonDays=${horizon}`,
  );

const fetchOrderHeader = (orderNumber: string, fields = 'customerNumber,requiredDate,status') =>
  jb2Fetch(
    'get',
    `/api/v1/orders/${encodeURIComponent(orderNumber)}/?fields=${encodeURIComponent(
      fields,
    )}`,
  );



/* =========================================================
 * ➋  AGENT TOOLS (each uses helpers – never other tools)
 * ========================================================*/

/* 1. allocateInventoryToOrder */
async function allocateInventoryCore(orderNumber:string){
  const lines = await fetchOrderLines(orderNumber);
  const allocation:any[]=[]; const shortages:any[]=[];
  for(const l of lines.items){
    const stock = await fetchOnHandQty(l.partNumber);
    const qtyAlloc=Math.min(stock.quantityOnHand,l.quantityOrdered);
    allocation.push({line:l.line,partNumber:l.partNumber,quantityAllocated:qtyAlloc});
    const deficit=l.quantityOrdered-qtyAlloc;
    if(deficit>0)shortages.push({partNumber:l.partNumber,shortageQty:deficit});
    if(qtyAlloc>0){
      await jb2Fetch('patch',`/api/v1/order-line-items/${l.id}`,{quantityAllocated:qtyAlloc});
    }
  }
  return {allocation,shortages};
}
export const allocateInventoryToOrder = tool({
  name:'allocateInventoryToOrder',
  description:'Allocate on‑hand inventory to every line of an order.',
  parameters: z.object({orderNumber:z.string()}),
  execute: ({orderNumber})=>allocateInventoryCore(orderNumber)
});

/* 2. createPickList */
export const createPickList = tool({
  name:'createPickList',
  description:'Generate a bin‑sorted pick list and lock inventory.',
  parameters:z.object({orderNumber:z.string()}),
  execute: async ({orderNumber})=>{
    const {allocation}=await allocateInventoryCore(orderNumber);
    const pickRows:any[]=[];
    for(const a of allocation){
      if(a.quantityAllocated===0)continue;
      const bins=await fetchBinLocations(a.partNumber);
      let remaining=a.quantityAllocated;
      for(const b of bins.items.sort((x:any,y:any)=>x.bin.localeCompare(y.bin))){
        if(remaining<=0)break;
        const qty=Math.min(remaining,b.quantityOnHand);
        remaining-=qty;
        pickRows.push({bin:b.bin,partNumber:a.partNumber,qty});
        await jb2Fetch('post','/api/v1/inventory-reservations',{orderNumber,partNumber:a.partNumber,bin:b.bin,qty});
      }
    }
    const res=await jb2Fetch('post','/api/v1/pick-lists',{orderNumber,created:todayPlus(),lines:pickRows});
    return {pickListId:res.id,lines:pickRows};
  }
});

/* 3. recordPickCompletion */
export const recordPickCompletion = tool({
  name:'recordPickCompletion',
  description:'Finalize a pick list and mark order Picked.',
  parameters:z.object({pickListId:z.string()}),
  execute: async ({pickListId})=>{
    await jb2Fetch('patch',`/api/v1/pick-lists/${pickListId}`,{status:'Completed'});
    const pl=await jb2Fetch('get',`/api/v1/pick-lists/${pickListId}`);
    await jb2Fetch('patch',`/api/v1/orders/${pl.orderNumber}`,{status:'Picked'});
    return {message:'Pick completed',orderNumber:pl.orderNumber};
  }
});

/* 4. scheduleShipment */
export const scheduleShipment = tool({
  name:'scheduleShipment',
  description:'Book carrier pickup and mark order Shipped.',
    parameters: z.object({
    orderNumber: z.string(),
    trackingNumber: z.string() // now required – optional removed
  }),
  execute: async ({orderNumber,trackingNumber})=>{
    await jb2Fetch('post','/api/v1/shipments',{orderNumber,trackingNumber,shipDate:todayPlus()});
    await jb2Fetch('patch',`/api/v1/orders/${orderNumber}`,{status:'Shipped',trackingNumber});
    return {message:'Shipment scheduled',orderNumber,trackingNumber};
  }
});

/* 5. suggestVendorByLeadTime */
export const suggestVendorByLeadTime = tool({
  name:'suggestVendorByLeadTime',
  description:'Return vendor that meets due‑date at lowest cost.',
  parameters:z.object({partNumber:z.string(),needBy:z.string()}),
  execute: async ({partNumber,needBy=todayPlus(21)})=>{
    const vendors=await fetchVendorsForPart(partNumber);
    const pick=vendors.items.filter((v:any)=>todayPlus(v.leadTimeDays)<=needBy).sort((a:any,b:any)=>a.unitCost-b.unitCost)[0];
    return pick||{message:'No vendor can meet date'};
  }
});

/* 6. rollupDailyMRP */
export const rollupDailyMRP = tool({
  name:'rollupDailyMRP',
  description:'Consolidate shortages across open orders + safety stock.',
  parameters:z.object({horizonDays:z.number().default(7)}),
  execute: async ({horizonDays})=>{
    const orders=await fetchOpenOrders(horizonDays);
    const shortageMap:Record<string,number>={};
    for(const o of orders.items){
      const {shortages}=await allocateInventoryCore(o.orderNumber);
      for(const s of shortages){
        shortageMap[s.partNumber]=(shortageMap[s.partNumber]||0)+s.shortageQty;
      }
    }
    const safety=await fetchSafetyStock();
    for(const row of safety.items){
      const stock=await fetchOnHandQty(row.partNumber);
      const need=Math.max(0,row.minQty-stock.quantityOnHand);
      if(need)shortageMap[row.partNumber]=(shortageMap[row.partNumber]||0)+need;
    }
    return {shortages:Object.entries(shortageMap).map(([partNumber,qty])=>({partNumber,qty}))};
  }
});

/* 7. bulkCreatePOs */
export const bulkCreatePOs=tool({
  name:'bulkCreatePOs',
  description:'Split shortage list by vendor & open POs in bulk.',
  parameters:z.object({shortages:z.array(z.object({partNumber:z.string(),qty:z.number()}))}),
  execute:async({shortages})=>{
    const groups:Record<string,{partNumber:string,qty:number}[]>={};
    for(const s of shortages){
      // determine vendor WITHOUT calling another tool
      let vendor='DEFAULT';
      const v=await fetchVendorsForPart(s.partNumber);
      if(v.items?.length){vendor=v.items.sort((a:any,b:any)=>a.unitCost-b.unitCost)[0].supplier||'DEFAULT';}
      (groups[vendor]=groups[vendor]||[]).push(s);
    }
    const results:any[]=[];
    for(const [vendor,list] of Object.entries(groups)){
      const po=await createPOHeader(vendor);
      for(const l of list)await addPOLineItem(po.poNumber,l.partNumber,l.qty);
      await finalizePOHeader(po.poNumber);
      results.push({vendor,poNumber:po.poNumber});
    }
    return{purchaseOrders:results};
  }
});



export const issuePOsForShortages = tool({
  name: 'issuePOsForShortages',
  description: `Scan an order for shortages, choose the best vendor per
                part, open purchase orders, and return the PO numbers.`,
  parameters: z.object({
    orderNumber: z.string(),
    needBy: z.string().default(todayPlus(21)),     // req’d date for all parts
  }),
  execute: async ({ orderNumber, needBy }) => {
    /* 1 ▸ get order lines + build shortage list */
    const lines = await fetchOrderLines(orderNumber);
    const shortages: { partNumber: string; qty: number }[] = [];

    for (const l of lines.items ?? lines.Data ?? []) {
      const stock = await fetchOnHandQty(l.partNumber);
      const deficit = l.quantityOrdered - (stock.quantityOnHand ?? 0);
      if (deficit > 0) shortages.push({ partNumber: l.partNumber, qty: deficit });
    }
    if (!shortages.length) return { message: 'No shortages — nothing to buy 🎉' };

    /* 2 ▸ pick vendor for each part (cheapest that meets lead-time) */
    type Short = { partNumber: string; qty: number };
    const grouped: Record<string, Short[]> = {};

    for (const s of shortages) {
      const vRes = await fetchVendorsForPart(s.partNumber);
      const vendor =
        (vRes.items ?? [])
          .filter(
            (v: any) => todayPlus(v.leadTimeDays) <= needBy,
          )
          .sort((a: any, b: any) => a.unitCost - b.unitCost)[0]?.supplier || 'DEFAULT';

      (grouped[vendor] = grouped[vendor] || []).push(s);
    }

    /* 3 ▸ create & finalise a PO per vendor */
    const purchaseOrders: any[] = [];

    for (const [vendor, list] of Object.entries(grouped)) {
      const poHdr = await createPOHeader(vendor, needBy);
      for (const l of list)
        await addPOLineItem(poHdr.poNumber, l.partNumber, l.qty, needBy);

      await finalizePOHeader(poHdr.poNumber); // status = Approved
      purchaseOrders.push({ vendor, poNumber: poHdr.poNumber, lines: list });
    }

    return { orderNumber, purchaseOrders };
  },
});

/* --- primitives that were already stand‑alone (no changes) ---- */
export const findOrders = tool({
  name: 'findOrders',
  description: 'Retrieve a single order header by its orderNumber.',
  parameters: z.object({
    orderNumber: z.string(),
    fields: z.string().nullable().default('dueDate,customerCode,status'),
  }),
  execute: ({ orderNumber, fields }) => fetchOrderHeader(orderNumber, fields ?? undefined),
});

export const getOrderLines = tool({
  name:'getOrderLines',
  description:'Return every line‑item for an order.',
  parameters:z.object({orderNumber:z.string()}),
  execute: ({orderNumber})=>fetchOrderLines(orderNumber)
});

export const getBinLocations = tool({
  name:'getBinLocations',
  description:'List every bin that holds a part.',
  parameters:z.object({partNumber:z.string()}),
  execute: ({partNumber})=>fetchBinLocations(partNumber)
});

export const getOnHandQty = tool({
  name:'getOnHandQty',
  description:'Return total on‑hand qty for a part.',
  parameters:z.object({partNumber:z.string()}),
  execute: ({partNumber})=>fetchOnHandQty(partNumber)
});

export const createPurchaseOrder = tool({
  name:'createPurchaseOrder',
  description:'Create purchase order header',
  parameters:z.object({supplier:z.string(),requiredDate:z.string()}),
  execute: ({supplier,requiredDate})=>createPOHeader(supplier,requiredDate)
});

export const addPOLine = tool({
  name:'addPOLine',
  description:'Add line to PO',
  parameters:z.object({poNumber:z.string(),partNumber:z.string(),quantity:z.number(),dueDate:z.string()}),
  execute: ({poNumber,partNumber,quantity,dueDate})=>addPOLineItem(poNumber,partNumber,quantity,dueDate)
});

export const finalizePO = tool({
  name:'finalizePO',
  description:'Finalize PO',
  parameters:z.object({poNumber:z.string(),status:z.string().default('Approved'),promisedDate:z.string()}),
  execute: ({poNumber,status,promisedDate})=>finalizePOHeader(poNumber,status,promisedDate)
});

export const checkOrderOnHandQty = tool({
  name: 'checkOrderOnHandQty',
  description: 'For every order line, compare qty ordered vs on-hand total.',
  parameters: z.object({ orderNumber: z.string() }),
  execute: async ({ orderNumber }) => {
    const lines = await fetchOrderLines(orderNumber);        // 200 OK
    const report: any[] = [];

    for (const l of lines.items ?? lines.Data ?? []) {        // handle either shape
      const stock = await fetchOnHandQty(l.partNumber);      // 200 OK now
      report.push({
        line:        l.line,
        partNumber:  l.partNumber,
        qtyOrdered:  l.quantityOrdered,
        qtyOnHand:   stock.quantityOnHand ?? 0,
        shortage:    Math.max(0, l.quantityOrdered - (stock.quantityOnHand ?? 0)),
      });
    }

    return { orderNumber, lines: report };
  },
});

/* --------------------------------------------------
 * Export bundle
 * ------------------------------------------------*/
export const jb2CoreTools:{[k:string]:Tool<unknown>}={
  allocateInventoryToOrder,
  createPickList,
  recordPickCompletion,
  scheduleShipment,
  suggestVendorByLeadTime,
  rollupDailyMRP,
  bulkCreatePOs,
  findOrders,
  getOrderLines,
  getBinLocations,
  getOnHandQty,
  issuePOsForShortages,
  createPurchaseOrder,
  addPOLine,
  finalizePO,
  checkOrderOnHandQty
};
