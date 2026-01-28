import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('labyrinth-registry');
  const claimed = [];

  for await (const key of store.list()) {
    if (key.startsWith('grid:')) {
      claimed.push(key.replace('grid:', ''));
    }
  }

  return new Response(
    JSON.stringify({ claimed }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
