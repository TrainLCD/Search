"use client";
import { Line, Route, Station, StopCondition } from "@/gen/proto/stationapi_pb";
import { useFetchLineById } from "@/hooks/useFetchLineById";
import { useFetchLinesByName } from "@/hooks/useFetchLinesByName";
import { useFetchRoutes } from "@/hooks/useFetchRoutes";
import { useFetchStationsByGroupId } from "@/hooks/useFetchStationsByGroupId";
import { useFetchStationsByLineId } from "@/hooks/useFetchStationsByLineId";
import { useFetchStationsByName } from "@/hooks/useFetchStationsByName";
import { useParams } from "@/hooks/useParams";
import { ArrowLeftIcon } from "@/icons/ArrowLeft";
import { CheckIcon } from "@/icons/Check";
import { ChevronRightIcon } from "@/icons/ChevronRight";
import { CloseSmallRoundedIcon } from "@/icons/CloseSmallRounded";
import { RailIcon } from "@/icons/Rail";
import { StationIcon } from "@/icons/Station";
import dropEitherJunctionStation from "@/utils/dropJunctionStation";
import { removeBrackets } from "@/utils/removeBracket";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  Selection,
  Skeleton,
} from "@nextui-org/react";
import { animated, useSpring } from "@react-spring/web";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

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
              <CheckIcon
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
            <span>始点駅と接続していない駅と</span>
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
              <CheckIcon
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
  onStationClick: (routeId: number, typeId: number | undefined) => () => void;
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
          onClick={onStationClick(
            route.id,
            route.stops.find((stop) => stop.groupId === fromStationId)
              ?.trainType?.typeId
          )}
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
  const { isOpen, onOpenChange } = useDisclosure();
  const [selectedTrainTypeId, setSelectedTrainTypeId] = useState<number>(1);

  const params = useParams();

  const initialScreenPhase = useMemo(() => {
    const fromStationId = params.get("fsid");
    const toStationId = params.get("tsid");
    const lineId = params.get("lid");
    const mode = params.get("mode");

    if (mode === "line" && !lineId) {
      return "line";
    }

    if ((fromStationId && toStationId) || lineId) {
      return "res";
    }

    if (fromStationId && !toStationId) {
      return "dst";
    }

    return "src";
  }, [params]);
  const [screenPhase, setScreenPhase] = useState<
    "src" | "dst" | "res" | "line"
  >(initialScreenPhase);

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
  const selectedRouteId = useWatch({ control, name: "selectedRouteId" });
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

  const footerSprings = useSpring({
    from: { opacity: 0, bottom: `-100%` },
    to: { opacity: 1, bottom: "0%" },
  });

  const inputLabel = useMemo(() => {
    switch (screenPhase) {
      case "src":
        return "検索する駅名を入力してください";
      case "dst":
        return "行き先の駅名を入力してください";
      case "line":
        return "路線IDまたは路線名を入力してください";
      default:
        return "";
    }
  }, [screenPhase]);

  const handleTrainTypeClick = useCallback(
    (routeId: number, trainTypeId: number | undefined) => () => {
      setValue("selectedRouteId", routeId.toString());
      if (trainTypeId) {
        setSelectedTrainTypeId(trainTypeId);
      }
      onOpenChange();
    },
    [onOpenChange, setValue]
  );

  const handleStationClick = useCallback((stationId: number) => () => {}, []);

  const handleLeftButtonClick = useCallback(() => {
    switch (screenPhase) {
      case "src":
        params.update({ mode: "line" });
        setScreenPhase("line");
        break;
      case "dst":
        params.clear();
        setScreenPhase("src");
        break;
      case "res":
        setScreenPhase("dst");
      case "line":
        setScreenPhase("src");
    }
  }, [params, screenPhase]);

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
        (stop) => stop.trainType?.typeId === selectedTrainTypeId
      )?.trainType,
    }),
    [fromStop?.line?.nameShort, route?.id, route?.stops, selectedTrainTypeId]
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

  return (
    <main className="flex flex-col w-screen h-full mx-auto overflow-hidden">
      <FormProvider {...methods}>
        {screenPhase === "src" && (
          <SelectStationListBox
            loading={isFromStationsLoading}
            value={selectedFromStationId}
            stations={fromStations}
            isDirty={dirtyFields.fromStationName ?? false}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedFromStationId", keysArr[0]);
              params.update({ fsid: keysArr[0] });
              setScreenPhase("dst");
            }}
          />
        )}

        {screenPhase === "dst" && (
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

              setScreenPhase("res");
            }}
          />
        )}

        {screenPhase === "line" && (
          <LineListBox
            loading={isSingleLineLoading || isLinesLoading}
            value={selectedFromStationId}
            lines={singleLine ? [singleLine] : lines ?? []}
            isDirty={dirtyFields.lineIdOrName ?? false}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedLineId", keysArr[0]);
              setScreenPhase("res");
            }}
          />
        )}

        {screenPhase === "res" && (
          <div className="flex flex-col flex-shrink-0 min-h-dvh max-h-screen pt-4 pb-24 w-11/12 mx-auto transition-height">
            <p className="font-medium opacity-90 text-center">
              こちらの経路が見つかりました
            </p>

            {isFromStationsLoading ||
            isToStationsLoading ||
            !fromStation ||
            !toStation ? (
              <Skeleton className="w-32 h-4 mt-1 mb-8 self-center rounded-md" />
            ) : (
              <p className="font-medium opacity-50 mt-1 mb-8 text-center text-xs">
                {fromStation?.name}
                &nbsp;-&nbsp;
                {toStation?.name}
              </p>
            )}

            {params.get("lid") && params.get("mode") === "line" ? (
              <p className="font-medium opacity-50 mt-1 mb-8 text-center text-xs">
                {singleLine
                  ? singleLine?.nameShort
                  : lines?.find((l) => l.id === Number(selectedLineId))
                      ?.nameShort}
              </p>
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
            {screenPhase !== "res" && (
              <Button
                variant="bordered"
                className="bg-default-100 shadow h-14 min-w-14 p-0"
                onClick={handleLeftButtonClick}
              >
                {screenPhase === "src" ? (
                  <StationIcon className="text-xl text-foreground-600" />
                ) : null}
                {screenPhase === "dst" ? (
                  <ArrowLeftIcon className="text-xl text-foreground-600" />
                ) : null}
                {screenPhase === "line" ? (
                  <RailIcon className="text-xl text-foreground-600" />
                ) : null}
              </Button>
            )}

            {screenPhase === "src" ? (
              <Input
                className="m-auto"
                required
                autoFocus
                variant="faded"
                label={inputLabel}
                {...register("fromStationName")}
              />
            ) : null}
            {screenPhase === "dst" ? (
              <Input
                className="m-auto"
                required
                autoFocus
                variant="faded"
                label={inputLabel}
                {...register("toStationName")}
              />
            ) : null}
            {screenPhase === "line" ? (
              <Input
                className="m-auto"
                required
                autoFocus
                variant="faded"
                label={inputLabel}
                {...register("lineIdOrName")}
              />
            ) : null}
            {screenPhase === "res" ? (
              <Button
                variant="bordered"
                color="primary"
                className="w-32 self-center"
                onClick={() => {
                  methods.reset();
                  params.clear();
                  setScreenPhase("src");
                }}
              >
                やり直す
              </Button>
            ) : null}
          </div>
        </animated.footer>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent className="overflow-y-scroll max-h-svh">
            {(onClose) => (
              <>
                <ModalHeader className="sticky top-0 bg-white border-b-1 shadow-sm">
                  <div className="flex flex-1 justify-between align-center h-full">
                    <div className="flex items-center">
                      <span>{modalContent.lineName}</span>
                      <span
                        className="ml-1 text-sm"
                        style={{ color: modalContent.trainType?.color }}
                      >
                        {removeBrackets(modalContent.trainType?.name ?? "")}
                      </span>
                    </div>
                    <button onClick={onClose}>
                      <CloseSmallRoundedIcon />
                    </button>
                  </div>
                </ModalHeader>

                <ModalBody>
                  <p className="font-bold">停車駅: </p>
                  <div className="flex flex-wrap gap-x-2">
                    {dropEitherJunctionStation(route?.stops ?? []).flatMap(
                      (stop) =>
                        stop.stopCondition === StopCondition.All ? (
                          <span>{stop.name}</span>
                        ) : (
                          <span
                            className={`text-${
                              STOP_CONDITIONS.find(
                                (cnd) => cnd.id === stop.stopCondition
                              )?.color ?? ""
                            }`}
                          >
                            {stop.name}
                          </span>
                        )
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {STOP_CONDITIONS.map((cnd) => (
                      <div className="flex items-center gap-2" key={cnd.id}>
                        <div
                          className={`w-4 h-4 bg-${cnd.color} border-1 rounded`}
                        />
                        <span>{cnd.text}</span>
                      </div>
                    ))}
                  </div>

                  <p className="font-bold">各線の種別: </p>
                  <div className="whitespace-pre-wrap">
                    {Array.from(
                      new Map(
                        route?.stops.map((stop) => [stop.line?.id, stop])
                      ).values()
                    ).map((stop) => (
                      <p key={stop.line?.id} className="flex flex-wrap">
                        <span className="flex-1">{stop.line?.nameShort}: </span>
                        <span
                          className="flex-1 font-bold"
                          style={{ color: stop.trainType?.color }}
                        >
                          {removeBrackets(
                            stop.trainType?.name ?? "普通または各駅停車"
                          )}
                        </span>
                      </p>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    閉じる
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </FormProvider>
    </main>
  );
}
