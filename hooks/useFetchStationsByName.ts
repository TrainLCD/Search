import { grpcClient } from "@/api/client";
import { GetStationsByNameRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import { groupStations } from "@/utils/groupStations";
import useSWR from "swr";

export const useFetchStationsByName = (
  stationName: string,
  fromStationGroupId?: number
) => {
  const req = new GetStationsByNameRequest({
    stationName,
    limit: 10,
    fromStationGroupId,
  });

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
    return res.stations;
  });

  return { stations: groupStations(stations ?? []), error, isLoading };
};
