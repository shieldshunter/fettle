// src/components/api/jb2.ts
/* ----------------------------------------------------------------
   Tiny front-end helper that fetches an OAuth token and then
   calls the JB² REST endpoints directly.  No server-side code.
-----------------------------------------------------------------*/
const JB2_AUTH = {
  clientId:     import.meta.env.VITE_JB2_CLIENT_ID!,
  clientSecret: import.meta.env.VITE_JB2_CLIENT_SECRET!
};

const AUTH_BASE = 'https://api-user.integrations.ecimanufacturing.com';
const API_BASE  = 'https://api-jb2.integrations.ecimanufacturing.com';

let token = '';
let exp   = 0;                 // unix-seconds

async function getToken(): Promise<string> {
  const now = Date.now() / 1000 | 0;
  if (token && now < exp - 60) return token;          // reuse

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     JB2_AUTH.clientId,
    client_secret: JB2_AUTH.clientSecret,
    scope:         'jb2-api offline_access'
  });

  const r = await fetch(`${AUTH_BASE}/oauth2/api-user/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!r.ok) throw new Error(`OAuth ${r.status}`);

  const json = await r.json();           // { access_token, expires_in, … }
  token = json.access_token;
  exp   = now + json.expires_in;
  return token;
}

/* ----------------------------------------------------------------
   A *single* helper you can call with the logical “tool name”
   and its args.  Add more cases as you wire up new endpoints.
-----------------------------------------------------------------*/
export async function callJobbossFn(name: string, args: any): Promise<any> {
  const bearer = await getToken();

  switch (name) {

    /* ---------- GET bin locations by part number ---------- */
    case 'getBins': {
      const { partNumber, take = 50, skip = 0 } = args;
      const url = new URL('/api/v1/bin-locations', API_BASE);
      url.searchParams.set('partNumber[eq]', partNumber);
      url.searchParams.set('take',  String(take));
      url.searchParams.set('skip',  String(skip));
      url.searchParams.set(
        'fields',
        'binLocation,cost,datePosted,deliveryTicketNumber,lastModDate,lastModUser,' +
        'lotNumber,partNumber,POItemNumber,quantityOnHand,receiverNumber,uniqueID,vendorCode'
      );

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${bearer}` }
      });
      if (!r.ok) throw new Error(`getBins ${r.status}`);
      return (await r.json()).Data;      // ← actual payload
    }

    /* ---------- PATCH a single bin location ---------- */
    case 'patchBin': {
      const { uniqueID, ...rest } = args;
      const r = await fetch(
        `${API_BASE}/api/v1/bin-locations/${encodeURIComponent(uniqueID)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${bearer}`
          },
          body: JSON.stringify(rest)
        }
      );
      if (!r.ok) throw new Error(`patchBin ${r.status}`);
      return await r.json();
    }

    /* ---------- add more cases here ---------- */

    default:
      throw new Error(`🚫 Unknown JobBoss function “${name}”`);
  }
}
