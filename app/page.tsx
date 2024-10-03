"use client";
import { Station, StopCondition } from "@/gen/proto/stationapi_pb";
import { useFetchRoutes } from "@/hooks/useFetchRoutes";
import { useFetchStationsByName } from "@/hooks/useFetchStationsByName";
import { CheckIcon } from "@/icons/Check";
import { ChevronRightIcon } from "@/icons/ChevronRight";
import { CloseSmallRoundedIcon } from "@/icons/CloseSmallRounded";
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
  selectedToStationId: string;
  selectedRouteId: string;
};

const STOP_CONDITIONS = [
  { id: 0, text: "停車", color: "black" },
  { id: 1, text: "通過", color: "gray-400" },
  { id: 2, text: "一部通過", color: "yellow-400" },
  { id: 5, text: "一部停車", color: "yellow-400" },
  { id: 3, text: "平日停車", color: "blue-400" },
  { id: 4, text: "休日停車", color: "red-400" },
] as const;

const StationListBox = ({
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
          <span className="font-bold">
            始点駅として &nbsp;{selectedFromStation.name}
            &nbsp;が選択されています。
          </span>
        ) : null}
        {selectedFromStation ? (
          <span>
            <br />
            始点駅と接続していない駅と
          </span>
        ) : null}
        10駅以上の検索結果は表示されません。
      </p>
    </animated.div>
  );
};

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
  const [screenPhase, setScreenPhase] = useState<"src" | "dst" | "res">("src");

  const DEBOUNCE_DELAY = 1000;

  const selectedFromStationId = useWatch({
    control,
    name: "selectedFromStationId",
  });
  const selectedToStationId = useWatch({
    control,
    name: "selectedToStationId",
  });
  const fromStationName = useWatch({ control, name: "fromStationName" });
  const toStationName = useWatch({ control, name: "toStationName" });
  const selectedRouteId = useWatch({ control, name: "selectedRouteId" });

  const debouncedFromStationName = useDebounce(fromStationName, DEBOUNCE_DELAY);
  const {
    stations: fromStations = [],
    error: fetchFromStationsError,
    isLoading: isFromStationsLoading,
  } = useFetchStationsByName(
    debouncedFromStationName?.replace(/駅$/, "")?.trim()
  );

  const debouncedToStationName = useDebounce(toStationName, DEBOUNCE_DELAY);
  const {
    stations: toStations = [],
    error: fetchToStationsError,
    isLoading: isToStationsLoading,
  } = useFetchStationsByName(
    debouncedToStationName?.replace(/駅$/, "")?.trim(),
    Number(selectedFromStationId)
  );

  const {
    routes,
    isLoading: isRoutesLoading,
    error: routesLoadingError,
  } = useFetchRoutes(
    Number(selectedFromStationId),
    Number(selectedToStationId)
  );

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
      default:
        return "";
    }
  }, [screenPhase]);

  const handleLineClick = useCallback(
    (routeId: number, trainTypeId: number | undefined) => () => {
      setValue("selectedRouteId", routeId.toString());
      if (trainTypeId) {
        setSelectedTrainTypeId(trainTypeId);
      }
      onOpenChange();
    },
    [onOpenChange, setValue]
  );

  const route = useMemo(
    () => routes?.find((r) => r.id === Number(selectedRouteId)),
    [routes, selectedRouteId]
  );

  const isHasTypeChange = useCallback(
    (routeId: number) => {
      const targetRoute = routes?.find((r) => r.id === routeId);
      const typeIds = targetRoute?.stops.map((s) => s.trainType?.typeId);
      return Array.from(new Set(typeIds)).length > 1;
    },
    [routes]
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

  return (
    <main className="flex flex-col w-screen h-full mx-auto overflow-hidden">
      <FormProvider {...methods}>
        {screenPhase === "src" && (
          <StationListBox
            loading={isFromStationsLoading}
            value={selectedFromStationId}
            stations={fromStations}
            isDirty={dirtyFields.fromStationName ?? false}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedFromStationId", keysArr[0]);
              setScreenPhase("dst");
            }}
          />
        )}

        {screenPhase === "dst" && (
          <StationListBox
            loading={isToStationsLoading}
            value={selectedToStationId}
            stations={toStations}
            isDirty={dirtyFields.toStationName ?? false}
            selectedFromStation={fromStations?.find(
              (s) => s.groupId === Number(selectedFromStationId)
            )}
            onSelectionChange={(keys) => {
              const keysArr = Array.from(keys as Set<string>);
              setValue("selectedToStationId", keysArr[0]);
              setScreenPhase("res");
            }}
          />
        )}

        {screenPhase === "res" && (
          <div className="flex flex-col flex-shrink-0 min-h-dvh max-h-screen pt-4 pb-24 w-11/12 mx-auto">
            <p className="font-medium opacity-90 text-center">
              こちらの経路が見つかりました
            </p>
            <p className="font-medium opacity-50 mt-1 mb-8 text-center text-xs">
              {fromStations?.find(
                (s) => s.groupId === Number(selectedFromStationId)
              )?.name ?? ""}
              &nbsp;-&nbsp;
              {toStations.find((s) => s.groupId === Number(selectedToStationId))
                ?.name ?? ""}
            </p>

            <>
              <Listbox
                className="w-full rounded-xl shadow bg-white overflow-y-scroll px-4"
                emptyContent={
                  isRoutesLoading ? (
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
                    routesLoadingError && (
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
                    onClick={handleLineClick(
                      route.id,
                      route.stops.find(
                        (stop) => stop.groupId === Number(selectedFromStationId)
                      )?.trainType?.typeId
                    )}
                    endContent={
                      <div className="flex items-center">
                        <ChevronRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
                      </div>
                    }
                    textValue={selectedFromStationId}
                  >
                    <p className="font-medium opacity-90">
                      {route.stops.find(
                        (stop) => stop.groupId === Number(selectedFromStationId)
                      )?.line?.nameShort ?? ""}
                      &nbsp;
                      {removeBrackets(
                        route.stops.find(
                          (stop) =>
                            stop.groupId === Number(selectedFromStationId)
                        )?.trainType?.name ?? ""
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
          <div className="w-11/12 flex justify-center m-auto">
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
            {screenPhase === "res" ? (
              <Button
                variant="bordered"
                color="primary"
                className="w-32 self-center"
                onClick={() => {
                  methods.reset();
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
