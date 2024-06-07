import { Station } from "@/gen/proto/stationapi_pb";

// ２路線の接続駅は前の路線の最後の駅データを捨てる
const dropEitherJunctionStation = (stations: Station[]): Station[] =>
  stations.filter((s, i, arr): boolean => {
    const station = arr[i - 1];
    return station?.groupId !== s.groupId;
  });
export default dropEitherJunctionStation;
