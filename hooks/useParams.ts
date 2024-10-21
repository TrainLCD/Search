import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (paramMap: Record<string, string>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const entries = Object.entries(paramMap);
      entries.forEach(([key, value]) => current.set(key, value));
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [pathname, router, searchParams]
  );

  const get = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  const remove = useCallback(
    (key: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.delete(key);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.replace(`${pathname}${query}`);
    },
    [pathname, router, searchParams]
  );

  const clear = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  return { update, get, remove, clear };
};
