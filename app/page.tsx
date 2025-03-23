"use client";
import { Line, Route, Station } from "@/gen/proto/stationapi_pb";
import { useFetchLineById } from "@/hooks/useFetchLineById";
import { useFetchLinesByName } from "@/hooks/useFetchLinesByName";
import { useFetchRoutes } from "@/hooks/useFetchRoutes";
import { useFetchStationsByGroupId } from "@/hooks/useFetchStationsByGroupId";
import { useFetchStationsByLineId } from "@/hooks/useFetchStationsByLineId";
import { useFetchStationsByName } from "@/hooks/useFetchStationsByName";
import { useParams } from "@/hooks/useParams";
import { ChevronRightIcon } from "@/components/icons/ChevronRight";
import { MenuIcon } from "@/components/icons/Menu";
import { removeBrackets } from "@/utils/removeBracket";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { useDisclosure } from "@nextui-org/modal";
import { Button, Input, Selection, Skeleton } from "@nextui-org/react";
import { animated, useSpring } from "@react-spring/web";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { MenuModal } from "@/components/MenuModal";
import { RouteInfoModal } from "@/components/RouteInfoModal";

type Inputs = {
  fromStationName: string;
  selectedFromStationId: string;
  toStationName: string;
  lineIdOrName: string;
  selectedToStationId: string;
  selectedRouteId: string;
  selectedLineId: string;
};

const STOP_CONDITIONS = [
  { id: 0, text: "停車", color: "black" },
  { id: 1, text: "通過", color: "gray-400" },
  { id: 2, text: "一部通過", color: "yellow-400" },
  { id: 5, text: "一部停車", color: "yellow-400" },
  { id: 3, text: "平日停車", color: "blue-400" },
  { id: 4, text: "休日停車", color: "red-400" },
] as const;

const SelectStationListBox = ({
  loading,
  value,
  stations,
  isDirty,
  selectedFromStation,
  onSelectionChange,
}: {
  loading: boolean;
  value: string;
  stations: Station[];
  isDirty: boolean;
  selectedFromStation?: Station;
  onSelectionChange: (keys: Selection) => void;
}) => {
  const springs = useSpring({
    from: { opacity: 0, marginTop: "-8px" },
    to: { opacity: 1, marginTop: "0px" },
  });

  return (
    <animated.div
      style={springs}
      className="flex flex-col flex-shrink-0 min-h-dvh w-11/12 mx-auto pt-4 pb-24"
    >
      <Listbox
        aria-label="検索する駅名を入力してください"
        className="w-full rounded-xl shadow bg-white overflow-y-scroll px-4"
        selectionMode="single"
        disallowEmptySelection
        emptyContent={
          loading ? (
            <div className="w-full p-2 pt-4 flex">
              <div className="flex-1">
                <Skeleton className="max-w-[200px] w-full h-4 rounded-md" />
                <div className="flex items-center mt-1 h-4">
                  <Skeleton className="w-2 h-2 rounded-full ml-0  " />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                </div>
              </div>
              <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
            </div>
          ) : (
            <div className="w-full h-[60px] flex justify-center items-center px-2">
              <p className="font-medium text-center">
                {isDirty
                  ? "指定された駅が見つからないか、経路情報が登録されていません。"
                  : "検索する駅名を入力してください"}
              </p>
            </div>
          )
        }
        onSelectionChange={onSelectionChange}
      >
        {stations.map((sta) => (
          <ListboxItem
            key={sta.groupId}
            className="p-4"
            hideSelectedIcon
            endContent={
              <ChevronRightIcon
                className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                  value === sta.groupId.toString()
                    ? "text-green-500"
                    : "text-default-400"
                }`}
              />
            }
            textValue={value}
          >
            <p className="font-medium opacity-90">{sta.name}</p>
            <div className="flex items-center mt-1 h-4">
              {sta.lines.map((line) => (
                <div
                  key={line.id}
                  className="w-2 h-2 rounded-full ml-1 first:ml-0"
                  style={{ background: line.color }}
                />
              ))}
            </div>
          </ListboxItem>
        ))}
      </Listbox>
      <p className="font-medium mt-2 text-xs opacity-50">
        {selectedFromStation ? (
          <>
            <p className="font-bold">
              始点駅として &nbsp;{selectedFromStation.name}
              &nbsp;が選択されています。
            </p>
            <p>始点駅と接続していない駅と</p>
          </>
        ) : null}
        10駅以上の検索結果は表示されません。
      </p>
    </animated.div>
  );
};

const LineListBox = ({
  loading,
  value,
  lines,
  isDirty,
  onSelectionChange,
}: {
  loading: boolean;
  value: string;
  lines: Line[];
  isDirty: boolean;
  onSelectionChange: (keys: Selection) => void;
}) => {
  const springs = useSpring({
    from: { opacity: 0, marginTop: "-8px" },
    to: { opacity: 1, marginTop: "0px" },
  });

  return (
    <animated.div
      style={springs}
      className="flex flex-col flex-shrink-0 min-h-dvh w-11/12 mx-auto pt-4 pb-24"
    >
      <Listbox
        aria-label="検索する路線名を入力してください"
        className="w-full rounded-xl shadow bg-white overflow-y-scroll px-4"
        selectionMode="single"
        disallowEmptySelection
        emptyContent={
          loading ? (
            <div className="w-full p-2 pt-4 flex">
              <div className="flex-1">
                <Skeleton className="max-w-[200px] w-full h-4 rounded-md" />
                <div className="flex items-center mt-1 h-4">
                  <Skeleton className="w-2 h-2 rounded-full ml-0  " />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                  <Skeleton className="w-2 h-2 rounded-full ml-1" />
                </div>
              </div>
              <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
            </div>
          ) : (
            <div className="w-full h-[60px] flex justify-center items-center px-2">
              <p className="font-medium text-center">
                {isDirty
                  ? "指定された路線は見つかりませんでした。"
                  : "検索する路線名を入力してください"}
              </p>
            </div>
          )
        }
        onSelectionChange={onSelectionChange}
      >
        {lines.map((l) => (
          <ListboxItem
            key={l.id}
            className="p-4"
            hideSelectedIcon
            endContent={
              <ChevronRightIcon
                className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                  Number(value) === l.id ? "text-green-500" : "text-default-400"
                }`}
              />
            }
            textValue={value}
          >
            <p className="font-medium opacity-90">{l.nameShort}</p>
            <div className="flex items-center mt-1 h-4">
              <div
                key={l.id}
                className="w-2 h-2 rounded-full ml-1 first:ml-0"
                style={{ background: l.color }}
              />
            </div>
          </ListboxItem>
        ))}
      </Listbox>
      <p className="font-medium mt-2 text-xs opacity-50">
        10路線以上の検索結果は表示されません。
      </p>
    </animated.div>
  );
};

const RoutesListBox = ({
  isLoading,
  fromStationId,
  routes,
  onStationClick,
  error,
}: {
  isLoading: boolean;
  fromStationId: number;
  routes: Route[];
  onStationClick: (routeId: number) => () => void;
  error: Error;
}) => {
  const isHasTypeChange = useCallback(
    (routeId: number) => {
      const targetRoute = routes?.find((r) => r.id === routeId);
      const typeIds = targetRoute?.stops.map((s) => s.trainType?.typeId);
      return Array.from(new Set(typeIds)).length > 1;
    },
    [routes]
  );

  return (
    <Listbox
      className="w-full rounded-xl shadow bg-white overflow-y-scroll px-4"
      emptyContent={
        isLoading ? (
          <div className="w-full p-2 pt-4 flex">
            <div className="flex-1">
              <Skeleton className="max-w-[200px] w-full h-4 rounded-md" />
              <div className="flex items-center mt-1 h-4">
                <Skeleton className="w-2 h-2 rounded-full ml-0  " />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
              </div>
            </div>
            <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
          </div>
        ) : (
          error && (
            <div className="w-full h-[60px] flex justify-center items-center px-2">
              <p className="font-medium text-center">
                経路の取得に失敗しました
              </p>
            </div>
          )
        )
      }
    >
      {(routes ?? []).map((route) => (
        <ListboxItem
          className="p-4"
          key={route.id}
          onClick={onStationClick(route.id)}
          endContent={
            <div className="flex items-center">
              <ChevronRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            </div>
          }
          textValue={fromStationId.toString()}
        >
          <p className="font-medium opacity-90">
            {route.stops.find((stop) => stop.groupId === fromStationId)?.line
              ?.nameShort ?? ""}
            &nbsp;
            {removeBrackets(
              route.stops.find((stop) => stop.groupId === fromStationId)
                ?.trainType?.name ?? ""
            )}
          </p>
          <div className="mt-1">
            <div className="flex">
              {Array.from(
                new Map(
                  route.stops.map((stop) => [
                    `${stop.line?.id}:${stop.line?.color}`,
                    stop,
                  ])
                ).values()
              )
                .filter((stop, idx, arr) => {
                  const lineColors = arr.map((s) => s.line?.color);
                  if (lineColors.length === 1) {
                    return true;
                  }
                  return lineColors.includes(stop.line?.color);
                })
                .map((stop) => (
                  <div
                    key={`${stop.line?.id}:${stop.line?.color}`}
                    className="w-2 h-2 rounded-full ml-1"
                    style={{ background: stop.line?.color }}
                  />
                ))}
            </div>
            <p className="text-xs opacity-50 mt-1">
              {isHasTypeChange(route.id) ? "種別変更あり " : ""}
              {route.stops[0]?.name}駅から
              {route.stops[route.stops.length - 1]?.name}駅まで
            </p>
          </div>
        </ListboxItem>
      ))}
    </Listbox>
  );
};

const StationListBox = ({
  isLoading,
  stations,
  onTrainTypeClick,
  error,
}: {
  isLoading: boolean;
  stations: Station[];
  onTrainTypeClick: (routeId: number, typeId: number | undefined) => () => void;
  error: Error;
}) => {
  return (
    <Listbox
      className="w-full rounded-xl shadow bg-white overflow-y-scroll px-4"
      emptyContent={
        isLoading ? (
          <div className="w-full p-2 pt-4 flex">
            <div className="flex-1">
              <Skeleton className="max-w-[200px] w-full h-4 rounded-md" />
              <div className="flex items-center mt-1 h-4">
                <Skeleton className="w-2 h-2 rounded-full ml-0  " />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
                <Skeleton className="w-2 h-2 rounded-full ml-1" />
              </div>
            </div>
            <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
          </div>
        ) : (
          error && (
            <div className="w-full h-[60px] flex justify-center items-center px-2">
              <p className="font-medium text-center">
                路線の取得に失敗しました
              </p>
            </div>
          )
        )
      }
    >
      {(stations ?? []).map((sta) => (
        <ListboxItem
          className="p-4"
          key={sta.id}
          onClick={onTrainTypeClick(sta.id, sta?.trainType?.typeId)}
          endContent={
            <div className="flex items-center">
              <ChevronRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            </div>
          }
          textValue={sta.id.toString()}
        >
          <p className="font-medium opacity-90">{sta.name ?? ""}</p>
          <div className="mt-1 flex">
            {sta.lines
              .filter((stop, idx, arr) => {
                const lineColors = arr.map((l) => l?.color);
                if (lineColors.length === 1) {
                  return true;
                }
                return lineColors.includes(sta.line?.color ?? "");
              })
              .map((l) => (
                <div
                  key={`${l.id}:${l.color}`}
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ background: l.color }}
                />
              ))}
          </div>
        </ListboxItem>
      ))}
    </Listbox>
  );
};

const DEBOUNCE_DELAY = 1000;

export default function Home() {
  const methods = useForm<Inputs>();
  const {
    register,
    setValue,
    control,
    formState: { dirtyFields },
  } = methods;
  const {
    isOpen: isRouteInfoOpen,
    onOpenChange: onRouteInfoOpenChange,
    onOpen: onRouteInfoOpen,
  } = useDisclosure();
  const { isOpen: isMenuOpen, onOpenChange: onMenuOpenChange } =
    useDisclosure();

  const params = useParams();

  const routeId = useMemo(() => params.get("rid"), [params]);

  const screenMode = useMemo(() => {
    const fromStationId = params.get("fsid");
    const toStationId = params.get("tsid");
    const lineId = params.get("lid");

    if ((fromStationId && toStationId) || lineId) {
      return "res";
    }

    if (fromStationId && !toStationId) {
      return "dst";
    }

    return "src";
  }, [params]);

  const searchMode = useMemo(() => {
    const mode = params.get("mode");
    const lineId = params.get("lid");

    if (mode === "line" && !lineId) {
      return "line";
    }
    return "station";
  }, [params]);

  const devMode = useMemo(() => params.get("dev") === "true", [params]);

  const selectedFromStationId = useWatch({
    control,
    name: "selectedFromStationId",
    defaultValue: params.get("fsid") ?? "",
  });
  const selectedToStationId = useWatch({
    control,
    name: "selectedToStationId",
    defaultValue: params.get("tsid") ?? "",
  });
  const fromStationName = useWatch({ control, name: "fromStationName" });
  const toStationName = useWatch({ control, name: "toStationName" });
  const selectedRouteId = useWatch({
    control,
    name: "selectedRouteId",
    defaultValue: params.get("rid") ?? "",
  });
  const lineIdOrName = useWatch({
    control,
    name: "lineIdOrName",
    defaultValue: params.get("lid") ?? "",
  });
  const selectedLineId = useWatch({
    control,
    name: "selectedLineId",
    defaultValue: params.get("lid") ?? "",
  });

  const debouncedFromStationName = useDebounce(fromStationName, DEBOUNCE_DELAY);
  const {
    stations: fromStations = [],
    error: fetchFromStationsError,
    isLoading: isFromStationsLoading,
  } = useFetchStationsByName(
    debouncedFromStationName?.replace(/駅$/, "")?.trim()
  );

  const {
    stations: fromStationsByGroupId = [],
    error: fetchFromStationsByGroupIdError,
    isLoading: isFromStationsByGroupIdLoading,
  } = useFetchStationsByGroupId(Number(params.get("fsid")));
  const {
    stations: toStationsByGroupId = [],
    error: fetchToStationsByGroupIdError,
    isLoading: isToStationsByGroupIdLoading,
  } = useFetchStationsByGroupId(Number(params.get("tsid")));

  const debouncedToStationName = useDebounce(toStationName, DEBOUNCE_DELAY);
  const {
    stations: toStations = [],
    error: fetchToStationsError,
    isLoading: isToStationsLoading,
  } = useFetchStationsByName(
    debouncedToStationName?.replace(/駅$/, "")?.trim(),
    Number(selectedFromStationId)
  );

  const debouncedLineIdOrName = useDebounce(lineIdOrName, DEBOUNCE_DELAY);

  const requestedLineId = useMemo(() => {
    const lineId =
      (!Number.isNaN(params.get("lid")) && Number(params.get("lid"))) ||
      Number(debouncedLineIdOrName);
    if (
      // NOTE: 新幹線の路線IDは4桁
      lineId?.toString().length === 4 ||
      // NOTE: 新幹線以外の路線IDは5桁
      lineId?.toString().length === 5
    ) {
      return lineId;
    }
  }, [debouncedLineIdOrName, params]);

  const {
    line: singleLine,
    error: fetchSingleLineError,
    isLoading: isSingleLineLoading,
  } = useFetchLineById(requestedLineId);

  const {
    lines,
    error: fetchLinesError,
    isLoading: isLinesLoading,
  } = useFetchLinesByName(debouncedLineIdOrName);

  const {
    routes,
    isLoading: isRoutesLoading,
    error: routesLoadingError,
  } = useFetchRoutes(
    Number(selectedFromStationId),
    Number(selectedToStationId)
  );

  const {
    stations: stationsByLineId,
    isLoading: isStationsLoading,
    error: fetchStationsError,
  } = useFetchStationsByLineId(Number(selectedLineId));

  useEffect(() => {
    if (routeId) {
      onRouteInfoOpen();
    }
  }, [onRouteInfoOpen, routeId]);

  const footerSprings = useSpring({
    from: { opacity: 0, bottom: `-100%` },
    to: { opacity: 1, bottom: "0%" },
  });

  const inputLabel = useMemo(() => {
    if (searchMode === "line") {
      return "路線IDまたは路線名を入力してください";
    }

    if (searchMode === "station") {
      switch (screenMode) {
        case "src":
          return "検索する駅名を入力してください";
        case "dst":
          return "行き先の駅名を入力してください";
      }
    }
    return "";
  }, [screenMode, searchMode]);

  const handleTrainTypeClick = useCallback(
    (routeId: number) => () => {
      setValue("selectedRouteId", routeId.toString());
      params.update({
        rid: routeId.toString(),
      });
      onRouteInfoOpenChange();
    },
    [onRouteInfoOpenChange, params, setValue]
  );

  const handleStationClick = useCallback((stationId: number) => () => {}, []);

  const route = useMemo(
    () => routes?.find((r) => r.id === Number(selectedRouteId)),
    [routes, selectedRouteId]
  );

  const fromStop = useMemo(
    () =>
      route?.stops.find(
        (stop) => stop.groupId === Number(selectedFromStationId)
      ),
    [route?.stops, selectedFromStationId]
  );

  const modalContent = useMemo(
    () => ({
      id: route?.id,
      lineName: fromStop?.line?.nameShort,
      trainType: route?.stops.find(
        (stop) => stop.trainType?.groupId === Number(selectedRouteId)
      )?.trainType,
    }),
    [fromStop?.line?.nameShort, route?.id, route?.stops, selectedRouteId]
  );

  const fromStation = useMemo(
    () =>
      fromStationsByGroupId?.find(
        (s) => s.groupId === Number(selectedFromStationId)
      ),
    [fromStationsByGroupId, selectedFromStationId]
  );
  const toStation = useMemo(
    () =>
      toStationsByGroupId?.find(
        (s) => s.groupId === Number(selectedToStationId)
      ),
    [selectedToStationId, toStationsByGroupId]
  );

  const handleLaunchApp = useCallback(() => {
    const appScheme = devMode ? "trainlcd-canary://" : "trainlcd://";

    const lineGroupId = route?.stops.find(
      (stop) => stop.trainType?.groupId === Number(selectedRouteId)
    )?.trainType?.groupId;

    const direction =
      (route?.stops ?? []).findIndex(
        (s) => s.groupId === fromStation?.groupId
      ) <
      (route?.stops ?? []).findIndex((s) => s.groupId === toStation?.groupId)
        ? 0
        : 1;

    if (lineGroupId) {
      window.open(
        `${appScheme}route?sgid=${fromStation?.groupId}&lgid=${lineGroupId}&dir=${direction}`
      );
      return;
    }

    const lineId = fromStop?.line?.id;
    if (lineId) {
      window.open(
        `${appScheme}route?sgid=${fromStation?.groupId}&lid=${lineId}&dir=${direction}`
      );
    }
  }, [
    devMode,
    fromStation?.groupId,
    fromStop?.line?.id,
    route?.stops,
    selectedRouteId,
    toStation?.groupId,
  ]);

  const handleUpdateSearchMode = useCallback(
    (mode: "station" | "line" | "dev") => {
      if (mode !== "dev") {
        onMenuOpenChange();
        params.update({ mode });
        return;
      }
      params.update({ dev: devMode ? "false" : "true" });
    },
    [devMode, onMenuOpenChange, params]
  );

  return (
    <main className="flex flex-col w-screen h-full mx-auto overflow-hidden">
      <FormProvider {...methods}>
        {searchMode === "station" && screenMode === "src" && (
          <SelectStationListBox
            loading={isFromStationsLoading}
            value={selectedFromStationId}
            stations={fromStations}
            isDirty={dirtyFields.fromStationName ?? false}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedFromStationId", keysArr[0]);
              params.update({ fsid: keysArr[0] });
            }}
          />
        )}

        {searchMode === "station" && screenMode === "dst" && (
          <SelectStationListBox
            loading={isToStationsLoading}
            value={selectedToStationId}
            stations={toStations}
            isDirty={dirtyFields.toStationName ?? false}
            selectedFromStation={fromStation}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedToStationId", keysArr[0]);
              params.update({
                tsid: keysArr[0] ?? "",
              });
            }}
          />
        )}

        {searchMode === "line" && screenMode !== "res" && (
          <LineListBox
            loading={isSingleLineLoading || isLinesLoading}
            value={selectedFromStationId}
            lines={singleLine ? [singleLine] : lines ?? []}
            isDirty={dirtyFields.lineIdOrName ?? false}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedLineId", keysArr[0]);
              params.update({ lid: keysArr[0] });
            }}
          />
        )}

        {screenMode === "res" && (
          <div className="flex flex-col flex-shrink-0 min-h-dvh max-h-screen pt-4 pb-24 w-11/12 mx-auto transition-height">
            <p className="font-medium opacity-90 text-center">
              こちらの経路が見つかりました
            </p>

            {params.get("mode") !== "line" &&
            (isFromStationsLoading ||
              isToStationsLoading ||
              !fromStation ||
              !toStation) ? (
              <Skeleton className="w-32 h-4 mt-1 mb-8 self-center rounded-md" />
            ) : null}

            {params.get("mode") !== "line" &&
            !isFromStationsLoading &&
            !isToStationsLoading &&
            fromStation &&
            toStation ? (
              <p className="font-medium opacity-50 mt-1 mb-8 text-center text-xs">
                {fromStation?.name}
                &nbsp;-&nbsp;
                {toStation?.name}
              </p>
            ) : null}

            {params.get("lid") &&
            params.get("mode") === "line" &&
            !isLinesLoading ? (
              <p className="font-medium opacity-50 mt-1 mb-8 text-center text-xs">
                {singleLine
                  ? singleLine?.nameShort
                  : lines?.find((l) => l.id === Number(selectedLineId))
                      ?.nameShort}
              </p>
            ) : null}

            {params.get("lid") &&
            params.get("mode") === "line" &&
            isSingleLineLoading ? (
              <Skeleton className="w-32 h-4 mt-1 mb-8 self-center rounded-md" />
            ) : null}

            <>
              {selectedLineId ? (
                <StationListBox
                  isLoading={isStationsLoading}
                  stations={stationsByLineId}
                  onTrainTypeClick={handleStationClick}
                  error={fetchStationsError}
                />
              ) : (
                <RoutesListBox
                  isLoading={isRoutesLoading}
                  fromStationId={Number(selectedFromStationId)}
                  routes={routes ?? []}
                  onStationClick={handleTrainTypeClick}
                  error={routesLoadingError}
                />
              )}
              <p className="font-medium my-2 text-xs opacity-50">
                TrainLCDアプリで利用可能なデータであるため、実際の情報とは異なる場合があります。
              </p>
            </>
          </div>
        )}

        <animated.footer
          style={footerSprings}
          className="fixed bottom-0 w-screen py-4 lg:py-6 shadow-xl border-t-1 bg-white"
        >
          <div className="w-11/12 flex justify-center m-auto gap-2">
            {screenMode !== "res" && (
              <Button
                variant="bordered"
                className="bg-default-100 shadow h-14 min-w-14 p-0"
                onClick={onMenuOpenChange}
              >
                <MenuIcon className="text-2xl text-foreground-600" />
              </Button>
            )}

            {searchMode == "station" && screenMode === "src" ? (
              <Input
                className="m-auto"
                required
                variant="faded"
                label={inputLabel}
                {...register("fromStationName")}
              />
            ) : null}
            {searchMode === "station" && screenMode === "dst" ? (
              <Input
                className="m-auto"
                required
                variant="faded"
                label={inputLabel}
                {...register("toStationName")}
              />
            ) : null}
            {searchMode === "line" && screenMode !== "res" ? (
              <Input
                className="m-auto"
                required
                variant="faded"
                label={inputLabel}
                {...register("lineIdOrName")}
              />
            ) : null}
            {screenMode === "res" ? (
              <Button
                variant="bordered"
                color="primary"
                className="w-32 self-center"
                onClick={() => {
                  methods.reset();
                  setValue("selectedLineId", "");
                  setValue("selectedFromStationId", "");
                  setValue("selectedToStationId", "");
                  params.clear();
                }}
              >
                やり直す
              </Button>
            ) : null}
          </div>
        </animated.footer>

        <MenuModal
          isOpen={isMenuOpen}
          onOpenChange={onMenuOpenChange}
          onSelect={handleUpdateSearchMode}
          value={searchMode}
          devMode={devMode}
        />
        <RouteInfoModal
          isOpen={isRouteInfoOpen}
          onOpenChange={onRouteInfoOpenChange}
          modalContent={modalContent}
          route={route}
          onLaunchApp={handleLaunchApp}
        />
      </FormProvider>
    </main>
  );
}
