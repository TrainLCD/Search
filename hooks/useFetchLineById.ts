import { grpcClient } from "@/api/client";
import { GetLineByIdRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import useSWR from "swr";

export const useFetchLineById = (lineId: number | undefined) => {
  const req = new GetLineByIdRequest({
    lineId,
  });

  const swrKey = generateSWRKey("getLineById", req);

  const {
    data: line,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (!lineId) {
      return;
    }

    const res = await grpcClient.getLineById(req);
    return res.line;
  });

  return { line, error, isLoading };
};
