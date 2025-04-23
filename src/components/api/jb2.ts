/*
This contains all of the API calling code for the JB2 API.
It includes the authentication, fetching bin locations, and exporting to CSV.
*/

const JB2_AUTH = {
  clientId:     import.meta.env.VITE_JB2_CLIENT_ID ,
  clientSecret: import.meta.env.VITE_JB2_CLIENT_SECRET
};

function exportToCSV(data: BinLocation[], filename: string) {
  if (!data.length) return alert("No data to export!");

  const header = Object.keys(data[0]);
  const rows = data.map(obj =>
    header.map(field => JSON.stringify((obj as any)[field] ?? "")).join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


const AUTH_BASE = 'https://api-user.integrations.ecimanufacturing.com';
const API_BASE  = 'https://api-jb2.integrations.ecimanufacturing.com';

let jb2Token  = '';
let jb2Expiry = 0;

async function getJB2Token() {
  console.log('[getJB2Token] Called.');

  const now = Math.floor(Date.now() / 1000);
  // If token is still valid, reuse it
  if (jb2Token && now < jb2Expiry - 60) {
    console.log('[getJB2Token] Reusing cached token.');
    return jb2Token;
  }

  // Token endpoint at AUTH_BASE
  const url = `${AUTH_BASE}/oauth2/api-user/token`;
  console.log('[getJB2Token] Request token from:', url);

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     JB2_AUTH.clientId,
    client_secret: JB2_AUTH.clientSecret,
    scope:         'jb2-api offline_access'
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[getJB2Token] Token fetch failed:', res.status, res.statusText, errorText);
    throw new Error(`OAuth ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  jb2Token  = json.access_token;
  jb2Expiry = now + json.expires_in;

  console.log('[getJB2Token] Got token:', jb2Token ? '***' : 'NO TOKEN', 'Expires in:', json.expires_in);

  return jb2Token;
}


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

async function fetchBinLocationsByPart(partNumber: string): Promise<BinLocation[]> {
  const token = await getJB2Token();
  console.log("Using token:", token);

  // Construct the URL for the bin locations endpoint.
  const url = new URL("/api/v1/bin-locations", API_BASE);
  // Use filter expression for the part number.
  url.searchParams.set("partNumber[eq]", partNumber);
  // Specify only the desired fields.
  url.searchParams.set(
    "fields",
    "binLocation,cost,datePosted,deliveryTicketNumber,lastModDate,lastModUser,lotNumber,partNumber,POItemNumber,quantityOnHand,receiverNumber,uniqueID,vendorCode"
  );
  // Set paging parameters.
  url.searchParams.set("take", "50");
  url.searchParams.set("skip", "0");
  // Optionally, add a sort expression.
  url.searchParams.set("sort", "-lastModDate");

  console.log("BinLocations endpoint:", url.toString());

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(
      `Bin locations fetch failed ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  console.log("Got response:", json);
  // Return the Data array (which should be an array of BinLocation objects).
  return json.Data;
}

function collapseDetailsContainer(container: HTMLElement): void {
  const currentHeight = container.offsetHeight;
  container.style.height = currentHeight + 'px';
  container.style.transition = 'height 0.4s ease-in-out, opacity 0.4s ease-in-out';

  // Trigger reflow to lock height before collapsing
  void container.offsetWidth;

  requestAnimationFrame(() => {
    container.style.height = '0px';
    container.style.opacity = '0';
  });

  container.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'height') {
      container.innerHTML = '<i>Select a part to see bin details.</i>'; // optional: clear content
      container.style.height = 'auto';
      container.style.opacity = '1';
      container.removeEventListener('transitionend', handler);
    }
  });
}

function binLocationHtml(b: BinLocation | null | undefined): string {
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

export {
  fetchBinLocationsByPart,
  exportToCSV,
  collapseDetailsContainer,
  binLocationHtml,
  BinLocation
};
