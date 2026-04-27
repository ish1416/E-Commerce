const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export async function gql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
