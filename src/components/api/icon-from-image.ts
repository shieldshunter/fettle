/*
  icon-helper.ts – Rev 5 (“image” param fix)
  ---------------------------------------------------------------------------
  **Bug:** OpenAI returned `400 BadRequest – Missing required parameter: image`.
  Cause: the SDK requires the binary be a *File/Blob/Buffer that also carries a
  **name** property ending with “.png”* so that it can build multipart form‑data
  correctly.  Our Blobs/Buffers had no `name`, so the `image` field was skipped.

  **Fix:**
    • In the **browser** path we now wrap both blobs in `File` objects:
        new File([blob], 'image.png', { type: 'image/png' })
      Same for the mask.

    • In the **Node** path we attach a `.name` property to each Buffer.

  No other changes—public API stays:
      const dataUrl = await generateSilhouetteIcon(file, { size: 512 });
*/

import OpenAI from 'openai';

export interface SilhouetteOptions {
  size?: 256 | 512 | 1024;
  prompt?: string;
}

const DEFAULT_PROMPT =
  'a solid white silhouette icon of the object in side profile, centred on a completely transparent background, no shading, no outline, no text';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// ---------------------------------------------------------------------------
// Public helper -------------------------------------------------------------
// ---------------------------------------------------------------------------
export async function generateSilhouetteIcon(
  file: File | Blob | ArrayBuffer | Uint8Array,
  opts: SilhouetteOptions = {},
): Promise<string> {
  const side = opts.size ?? 1024;
  const prompt = opts.prompt ?? DEFAULT_PROMPT;

  let imageData: File | Buffer;
  let maskData: File | Buffer;

  if (isBrowser) {
    ({ imageFile: imageData, maskFile: maskData } = await browserPreprocess(file, side));
  } else {
    ({ imageBuf: imageData, maskBuf: maskData } = await nodePreprocess(file, side));
  }

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const resp = await openai.images.edit({
    model: 'dall-e-2',
    image: imageData as any,
    mask: maskData as any,
    prompt,
    size: `${side}x${side}` as const,
    response_format: 'b64_json',
  } as any);

  const b64 = resp.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI returned no image');

  return `data:image/png;base64,${b64}`;
}

// ---------------------------------------------------------------------------
// Canvas helper (works in all browsers) ------------------------------------
// ---------------------------------------------------------------------------
function makeCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const off = new OffscreenCanvas(w, h);
      if (off.getContext('2d') && typeof off.convertToBlob === 'function') return off;
    } catch {}
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// ---------------------------------------------------------------------------
// Browser pre‑processing ----------------------------------------------------
// ---------------------------------------------------------------------------
async function browserPreprocess(input: File | Blob | ArrayBuffer | Uint8Array, side: number) {
  const blobInput =
    input instanceof Blob
      ? input
      : new Blob([input instanceof ArrayBuffer || ArrayBuffer.isView(input) ? input : (input as any).buffer]);

  const bmp = await createImageBitmap(blobInput);
  const canvas = makeCanvas(side, side);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const scale = Math.max(side / bmp.width, side / bmp.height);
  const dw = bmp.width * scale;
  const dh = bmp.height * scale;
  ctx.drawImage(bmp, (side - dw) / 2, (side - dh) / 2, dw, dh);

  const toPngBlob = async (c: any) =>
    typeof c.convertToBlob === 'function'
      ? c.convertToBlob({ type: 'image/png' })
      : await new Promise<Blob>((res) => (c as HTMLCanvasElement).toBlob((b) => res(b!), 'image/png'));

  // wrap in File so SDK recognises the field
  const imageFile = new File([await toPngBlob(canvas)], 'image.png', { type: 'image/png' });
  const maskFile = new File([await toPngBlob(makeCanvas(side, side))], 'mask.png', { type: 'image/png' });

  return { imageFile, maskFile } as const;
}

// ---------------------------------------------------------------------------
// Node pre‑processing (sharp) ----------------------------------------------
// ---------------------------------------------------------------------------
async function nodePreprocess(input: File | Blob | ArrayBuffer | Uint8Array, side: number) {
  const { default: sharp } = await import('sharp');

  const buf: Buffer = Buffer.isBuffer(input)
    ? (input as Buffer)
    : Buffer.from(
        input instanceof ArrayBuffer || ArrayBuffer.isView(input)
          ? (input as ArrayBufferLike)
          : await (input as Blob).arrayBuffer(),
      );

  const imageBuf = await sharp(buf).resize(side, side, { fit: 'cover' }).png().toBuffer();
  const maskBuf = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();

  (imageBuf as any).name = 'image.png';
  (maskBuf as any).name = 'mask.png';

  return { imageBuf, maskBuf } as const;
}
