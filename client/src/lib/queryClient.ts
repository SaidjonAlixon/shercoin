import { QueryClient, QueryFunction } from "@tanstack/react-query";

// userId ni localStorage'dan o'qish
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}

// userId ni localStorage'ga saqlash
export function setUserId(userId: number | string | null) {
  if (typeof window === 'undefined') return;
  if (userId === null) {
    localStorage.removeItem('userId');
  } else {
    localStorage.setItem('userId', String(userId));
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          errorMessage = json.message || json.error || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // Ignore
    }
    const error: any = new Error(`${res.status}: ${errorMessage}`);
    error.status = res.status;
    error.response = { data: { message: errorMessage, error: errorMessage } };
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const headers: Record<string, string> = {};
  
  // Content-Type qo'shamiz
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // userId header'ni qo'shamiz (agar mavjud bo'lsa)
  const userId = getUserId();
  if (userId) {
    headers["x-user-id"] = userId;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // JSON response qaytarish
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // userId header'ni qo'shamiz (agar mavjud bo'lsa)
    const userId = getUserId();
    if (userId) {
      headers["x-user-id"] = userId;
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
