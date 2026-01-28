import { getStore } from '@netlify/blobs';

export default async (request) => {
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ ok: false }),
        { headers: { 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { code } = body || {};
    if (!code) {
      return new Response(
        JSON.stringify({ ok: false }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // AUTHORITATIVE CODE → GRID ID MAP
    const CODE_MAP = {
      'VOID-001': 'A-001',
      'VOID-002': 'A-002'
    };

    const id = CODE_MAP[code];
    if (!id) {
      return new Response(
        JSON.stringify({ ok: false }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const store = getStore('labyrinth-registry');
    const key = `grid:${id}`;

    const existing = await store.get(key);
    if (existing === 'claimed') {
      return new Response(
        JSON.stringify({ ok: false, alreadyClaimed: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // WRITE PERMANENT GLOBAL STATE
    await store.set(key, 'claimed');

    return new Response(
      JSON.stringify({ ok: true, id }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    // CRITICAL: never allow an empty lambda response
    return new Response(
      JSON.stringify({ ok: false }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};