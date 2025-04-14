interface BinLocation {
    binLocation: string;
    cost: number;
    datePosted: string;
    deliveryTicketNumber: string;
    lastModDate: string | number | null;
    lastModUser: string;
    lotNumber: string;
    partNumber: string;
    POItemNumber: number;
    quantityOnHand: number;
    receiverNumber: string;
    uniqueID: number;
    vendorCode: string;
  }

export function binLocationHtml(b: BinLocation | null | undefined): string {
    if (!b) return '<i>bin location not found</i>';
  
    const cost  = b.cost != null ? b.cost.toFixed(2) : '—';
    const qty   = b.quantityOnHand ?? '—';
    const last  = b.lastModDate ? new Date(b.lastModDate).toLocaleDateString() : '—';
    const bin   = b.binLocation ?? '—';
    const uid   = b.uniqueID ?? '—';
    const part  = b.partNumber ?? '—';
  
    const rawHtml = `
      <div class="bin-location-card">
        <div class="bin-partnumber">${part}</div>
        <div class="bin-details">
          <div><strong>Bin:</strong> ${bin}</div>
          <div><strong>Cost:</strong> $${cost}</div>
          <div><strong>Qty On Hand:</strong> ${qty}</div>
          <div><strong>Last Modified:</strong> ${last}</div>
          <div style="font-size:0.8em;"><small>ID: ${uid}</small></div>
        </div>
      </div>
    `;
  
    return rawHtml.replace(/\s\s+/g, ' ').trim();
  }
  