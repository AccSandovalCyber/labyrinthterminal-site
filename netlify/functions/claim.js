import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('labyrinth-registry');
  const claimed = [];

  let cursor;
  do {
    const result = await store.list({ cursor });

    if (Array.isArray(result.blobs)) {
      for (const item of result.blobs) {
        if (item.key && item.key.startsWith('grid:')) {
          claimed.push(item.key.replace('grid:', ''));
        }
      }
    }

    cursor = result.cursor;
  } while (cursor);

  return new Response(
    JSON.stringify({ claimed }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};