const JB2_AUTH = {
    clientId:     import.meta.env.VITE_JB2_CLIENT_ID ,
    clientSecret: import.meta.env.VITE_JB2_CLIENT_SECRET
};

const AUTH_BASE = 'https://api-user.integrations.ecimanufacturing.com';

let jb2Token  = '';
let jb2Expiry = 0;
  

export async function getJB2Token() {
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