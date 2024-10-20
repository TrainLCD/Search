import { grpcClient } from "@/api/client";
import { GetStationByGroupIdRequest } from "@/gen/proto/stationapi_pb";
import { generateSWRKey } from "@/utils/generateSWRKey";
import { groupStations } from "@/utils/groupStations";
import useSWR from "swr";

export const useFetchStationsByGroupId = (groupId: number) => {
  const req = new GetStationByGroupIdRequest({
    groupId,
  });

  const swrKey = generateSWRKey("getStationsByGroupId", req);

  const {
    data: stations,
    error,
    isLoading,
  } = useSWR(swrKey, async () => {
    if (!req.groupId) {
      return [];
    }

    const res = await grpcClient.getStationsByGroupId(req);
    return res.stations;
  });

  return { stations: groupStations(stations ?? []), error, isLoading };
};
