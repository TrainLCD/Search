import { grpcClient } from "@/api/client";
import { GetStationByLineIdRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import { groupStations } from "@/utils/groupStations";
import useSWR from "swr";

export const useFetchStationsByLineId = (lineId: number) => {
  const req = new GetStationByLineIdRequest({
    lineId,
  });

  const swrKey = generateSWRKey("getStationsByLineId", req);

  const {
    data: stations,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (!req.lineId) {
      return [];
    }

    const res = await grpcClient.getStationsByLineId(req);
    return res.stations;
  });

  return { stations: groupStations(stations ?? []), error, isLoading };
};
