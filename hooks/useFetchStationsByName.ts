import { grpcClient } from "@/api/client";
import { GetStationsByNameRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import { groupStations } from "@/utils/groupStations";
import useSWR from "swr";

export const useFetchStationsByName = (stationName: string) => {
  const req = new GetStationsByNameRequest({ stationName, limit: 10 });

  const swrKey = generateSWRKey("getStationsByName", req);

  const {
    data: stations,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (!req.stationName.length) {
      return [];
    }

    const res = await grpcClient.getStationsByName(req);
    return groupStations(res.stations);
  });

  const uniqueStations = Array.from(
    new Map(stations?.map((sta) => [sta.groupId, sta])).values()
  );

  return { stations: uniqueStations, error, isLoading };
};
