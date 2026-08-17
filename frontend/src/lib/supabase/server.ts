import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Supabase түлхүүрүүд тавигдсан эсэх. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function realClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server component-оос дуудагдвал cookie бичихийг Next хориглоно.
            // Сешнийг middleware сэргээдэг тул үүнийг алгасаж болно.
          }
        },
      },
    },
  );
}

type ServerClient = Awaited<ReturnType<typeof realClient>>;

/** Server component / server action client — сешнийг cookie-гоор дамжуулна. */
export async function createClient(): Promise<ServerClient> {
  // Тохируулаагүй үед сайт нэвтрэлтгүйгээр ажиллана (proxy мөн шалгалтыг
  // алгасдаг). Ингэснээр дизайныг Supabase-гүйгээр үзэж болно.
  if (!isSupabaseConfigured()) {
    // Хуудсууд cookie уншсанаараа dynamic хэвээр байх ёстой — эс тэгвэл Next
    // build дээр prerender хийхийг оролдоно.
    await cookies();
    return offlineClient();
  }
  return realClient();
}

/**
 * Хоосон хариу буцаадаг stub. Query builder-ийн бүх метод өөрийгөө буцаах ба
 * await хийхэд `{ data: null }` гарна — хуудсууд аль хэдийн энэ тохиолдлыг
 * зөв зурдаг тул нэмэлт шалгалт хэрэггүй.
 */
function offlineClient(): ServerClient {
  const empty = { data: null, error: null, count: 0 };

  const target: Record<string, unknown> = {
    then: (resolve: (value: typeof empty) => unknown) => resolve(empty),
  };
  const chain: unknown = new Proxy(target, {
    get: (obj, prop) => (prop in obj ? obj[prop as string] : () => chain),
  });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => chain,
    storage: { from: () => chain },
  } as unknown as ServerClient;
}
