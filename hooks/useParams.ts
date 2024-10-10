import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const update = useCallback(
    (paramMap: Record<string, string>) => {
      const queryStrings = Object.entries(paramMap)
        .flatMap(([key, value]) => createQueryString(key, value))
        .join("&");
      router.replace(pathname + "?" + queryStrings);
    },
    [createQueryString, pathname, router]
  );

  const get = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  const clear = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { update, get, clear };
};
