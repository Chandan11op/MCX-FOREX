export async function fetchApi<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(`/api${endpoint}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json() as T;
  } catch {
    // Fallback to local demo dataset when backend endpoint is unavailable
    return fallbackData;
  }
}
