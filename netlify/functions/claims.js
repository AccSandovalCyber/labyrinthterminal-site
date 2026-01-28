import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('labyrinth-registry');
  const claimed = [];

  let cursor;
  do {
    const result = await store.list({ cursor });
    for (const key of result.keys) {
      if (key.startsWith('grid:')) {
        claimed.push(key.replace('grid:', ''));
      }
    }
    cursor = result.cursor;
  } while (cursor);

  return new Response(
    JSON.stringify({ claimed }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
