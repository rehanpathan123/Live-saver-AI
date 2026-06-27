import { useAuthStore } from "@/store/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    // On 401 — clear token and redirect to login
    if (response.status === 401) {
      useAuthStore.getState().setToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Parse the error detail from FastAPI response
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // fallback to status text
      message = response.statusText || message;
    }

    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}
