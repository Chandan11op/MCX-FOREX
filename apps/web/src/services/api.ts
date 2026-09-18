export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mcx-forex.onrender.com' : '');

export async function fetchApi<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}/api${endpoint}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json() as T;
  } catch {
    // Fallback to local demo dataset when backend endpoint is unavailable
    return fallbackData;
  }
}
