// Small HTTP backend so the Anthropic API key never ships inside the app.
// POST /v1/recognize-meal  { image: { data, mediaType } }
// POST /v1/pantry-dishes   { image: { data, mediaType }, context: PantryContext }
import { createServer, IncomingMessage, ServerResponse } from 'node:http';

import { dishesFromIngredients, ImageInput, PantryContext, recognizeMeal } from './vision';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 8 * 1024 * 1024;
const MEDIA = new Set(['image/jpeg', 'image/png', 'image/webp']);

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': process.env.ALLOW_ORIGIN ?? '*',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Image is too large (max 8 MB).'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function image(body: any): ImageInput {
  const img = body?.image;
  if (!img || typeof img.data !== 'string' || !MEDIA.has(img.mediaType)) {
    throw Object.assign(new Error('Send image.data (base64) and image.mediaType (jpeg, png or webp).'), { status: 400 });
  }
  return { data: img.data, mediaType: img.mediaType };
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  try {
    if (req.method === 'POST' && req.url === '/v1/recognize-meal') {
      return send(res, 200, await recognizeMeal(image(await readJson(req))));
    }
    if (req.method === 'POST' && req.url === '/v1/pantry-dishes') {
      const body = await readJson(req);
      return send(res, 200, await dishesFromIngredients(image(body), body.context as PantryContext));
    }
    send(res, 404, { error: 'Not found' });
  } catch (err: any) {
    console.error(err);
    send(res, err?.status && err.status < 500 ? err.status : 500, { error: err?.message ?? 'Something went wrong' });
  }
});

server.listen(PORT, () => console.log(`NutriWork API listening on http://localhost:${PORT}`));
