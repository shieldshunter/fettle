/**********************************************************************
 * 1· Shared HTTP helpers
 *********************************************************************/
const JB2_AUTH = {
  clientId    : import.meta.env.VITE_JB2_CLIENT_ID  ?? '',
  clientSecret: import.meta.env.VITE_JB2_CLIENT_SECRET ?? '',
};

const AUTH_BASE = 'https://api-user.integrations.ecimanufacturing.com';
const API_BASE  = 'https://api-jb2.integrations.ecimanufacturing.com';

let tokenCache: { token: string; exp: number } = { token: '', exp: 0 };

async function getToken(): Promise<string> {
  const now = Date.now() / 1e3;
  if (tokenCache.token && tokenCache.exp - 60 > now) return tokenCache.token;

  const form = new URLSearchParams({
    grant_type   : 'client_credentials',
    client_id    : JB2_AUTH.clientId,
    client_secret: JB2_AUTH.clientSecret,
    scope        : 'jb2-api offline_access',
  });

  const res = await fetch(`${AUTH_BASE}/oauth2/api-user/token`, {
    method : 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body   : form,
  });

  if (!res.ok)
    throw new Error(`OAuth ${res.status} ${res.statusText}`);

  const json = await res.json() as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, exp: now + json.expires_in };
  return tokenCache.token;
}

/** Generic authenticated request */
export async function jb2Fetch(
  method: 'get' | 'post' | 'patch',
  path  : string,
  body? : Record<string, unknown>,
) {
  const token = await getToken();
  const url   = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method : method.toUpperCase(),
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: method === 'get' ? undefined : JSON.stringify(body ?? {}),
  });

  if (!res.ok)
    throw new Error(`${method.toUpperCase()} ${url} → ${res.status}`);

  return res.json();
}

/**********************************************************************
 * 2· Tool factory
 *********************************************************************/
import { tool } from '@openai/agents';
import { z }    from 'zod';
import { RAW_DEFS } from '../constants/jb2raw_defs';

/* ---------- helpers ---------- */
type JSONSchema = {
  type?: string;
  description?: string;
  items?: JSONSchema;
  properties?: Record<string, JSONSchema>;
  required?: string[];
};


type ParamSchema = {
  type: string;
  description?: string;
  items?: ParamSchema;
  properties?: Record<string, ParamSchema>;
  required?: string[];                 // ← keep this!
};

function jsonSchemaToZod(js: ParamSchema): z.ZodTypeAny {
  switch (js.type) {
    case 'string':  return z.string();
    case 'number':  return z.number();
    case 'integer': return z.number().int();
    case 'boolean': return z.boolean();
    case 'array':   return z.array(jsonSchemaToZod(js.items!));
    case 'object': {
      const req = new Set(js.required ?? []);
      const shape: Record<string, z.ZodTypeAny> = {};

      for (const [k, v] of Object.entries(js.properties ?? {})) {
        const zod = jsonSchemaToZod(v);
        shape[k]  = req.has(k) ? zod              // required → as-is
                               : zod.nullable();  // not-required → nullable
      }
      return z.object(shape);
    }
    default: return z.any();
  }
}

/* ---------- actual tools ---------- */
type RawDef = {
  name       : string;
  description: string;
  method     : 'get' | 'post' | 'patch';
  path       : string;                    // e.g. "/api/v1/orders/{orderNumber}"
  parameters : JSONSchema;
};

export const JB2_TOOLS = (RAW_DEFS as unknown as Array<RawDef & { method: 'get' | 'post' | 'patch' }>).map((def) => {
  const paramSchema = jsonSchemaToZod(def.parameters as ParamSchema)
  paramSchema instanceof z.ZodObject ? paramSchema.strict() : paramSchema // strict by default

  // only object roots can be partial/strict

  return tool({
    name       : def.name,
    description: def.description,
    parameters : paramSchema instanceof z.ZodObject ? paramSchema : undefined,
    async execute(args: Record<string, unknown>) {
      /** Replace `{param}` path templates with values from `args` */
      let path = def.path.replace(/\{(\w+)}/g, (_, key) => {
        const val = args[key];
        delete args[key];                 // do not send twice
        return encodeURIComponent(String(val));
      });

      if (def.method === 'get') {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(args))
          if (v !== undefined) qs.set(k, String(v));
        if (qs.size) path += `?${qs.toString()}`;
        return jb2Fetch('get', path);
      }

      return jb2Fetch(def.method, path, args);
    },
  });
});

