import { PREFECTURES } from "@/constants/prefecture";
import { LineType, Station } from "@/gen/proto/stationapi_pb";

export const groupStations = (stations: Station[]): Station[] => {
  return stations
    .filter(
      (sta, idx, arr) => arr.findIndex((s) => s.groupId === sta.groupId) === idx
    )
    .map((sta, idx, arr) => {
      const suffix = sta.line?.lineType === LineType.Tram ? "停留所" : "駅";
      // 駅名が同じだが都道府県は違う場合は都道府県名を付与する
      if (
        arr.some(
          (s) => s.prefectureId !== sta.prefectureId && s.name === sta.name
        )
      ) {
        return {
          ...sta,
          name: `${sta.name}${suffix}(${PREFECTURES[sta.prefectureId - 1]})`,
        };
      }
      // 駅名が同じだが運営会社は違う場合は事業者名を付与する
      if (
        arr.some(
          (s) =>
            s.line?.company?.id !== sta.line?.company?.id && s.name === sta.name
        )
      ) {
        return {
          ...sta,
          name: `${sta.name}${suffix}(${sta.line?.company?.nameShort})`,
        };
      }

      return { ...sta, name: `${sta.name}${suffix}` };
    })
    .map((s) => new Station(s));
};
