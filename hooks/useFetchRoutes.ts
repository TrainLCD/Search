import { grpcClient } from "@/api/client";
import { GetRouteRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import useSWR from "swr";

export const useFetchRoutes = (
  fromStationGroupId: number,
  toStationGroupId: number
) => {
  const req = new GetRouteRequest({ fromStationGroupId, toStationGroupId });

  const swrKey = generateSWRKey("getRoutes", req);

  const {
    data: routes,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (isNaN(fromStationGroupId) || isNaN(toStationGroupId)) {
      return [];
    }

    const res = await grpcClient.getRoutes(req);
    return res.routes;
  });

  return { routes, error, isLoading };
};
