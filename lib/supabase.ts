import { createClient } from "@supabase/supabase-js"

const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  return fetch(url, {
    ...init,
    cache: 'no-store',
  })
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: customFetch,
    },
  }
)

