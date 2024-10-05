import { grpcClient } from "@/api/client";
import { GetLinesByNameRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import useSWR from "swr";

export const useFetchLinesByName = (lineIdOrName: string, limit = 10) => {
  const req = new GetLinesByNameRequest({
    lineName: lineIdOrName,
    limit,
  });

  const swrKey = generateSWRKey("getLinesByNameRequest", req);

  const {
    data: lines,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (typeof lineIdOrName === "number" || !lineIdOrName.length) {
      return [];
    }

    const res = await grpcClient.getLinesByName(req);
    return res.lines;
  });

  return { lines, error, isLoading };
};
