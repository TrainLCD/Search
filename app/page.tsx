"use client";
import { StopCondition } from "@/gen/proto/stationapi_pb";
import { useFetchRoutes } from "@/hooks/useFetchRoutes";
import { useFetchStationsByName } from "@/hooks/useFetchStationsByName";
import { CheckIcon } from "@/icons/Check";
import { ChevronRightIcon } from "@/icons/ChevronRight";
import dropEitherJunctionStation from "@/utils/dropJunctionStation";
import { removeBrackets } from "@/utils/removeBracket";
import { Input } from "@nextui-org/input";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Button, Modal, ModalContent } from "@nextui-org/react";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { animateScroll as scroll } from "react-scroll";

type Inputs = {
  fromStationName: string;
  selectedFromStationId: string;
  toStationName: string;
  selectedToStationId: string;
  selectedRouteId: string;
};

const STOP_CONDITION_MAP = {
  0: { text: "停車", color: "black" },
  1: { text: "通過", color: "gray-400" },
  2: { text: "一部通過", color: "yellow-400" },
  3: { text: "平日通過", color: "blue-400" },
  4: { text: "休日通過", color: "red-400" },
  5: { text: "一部停車", color: "yellow-400" },
} as const;

export default function Home() {
  const methods = useForm<Inputs>();
  const { register, setValue, control } = methods;
  const { isOpen, onOpenChange } = useDisclosure();
  const [selectedTrainTypeId, setSelectedTrainTypeId] = useState<number>(1);

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

  const debouncedFromStationName = useDebounce(
    fromStationName?.trim(),
    DEBOUNCE_DELAY
  );
  const {
    stations: fromStations,
    error: fetchFromStationsError,
    isLoading: isFromStationsLoading,
  } = useFetchStationsByName(debouncedFromStationName?.replace(/駅$/, ""));

  const debouncedToStationName = useDebounce(
    toStationName?.trim(),
    DEBOUNCE_DELAY
  );
  const {
    stations: toStations,
    error: fetchToStationsError,
    isLoading: isToStationsLoading,
  } = useFetchStationsByName(debouncedToStationName?.replace(/駅$/, ""));

  const { routes, isLoading: isRoutesLoading } = useFetchRoutes(
    Number(selectedFromStationId),
    Number(selectedToStationId)
  );

  useEffect(() => {
    if (selectedFromStationId) {
      scroll.scrollMore(window.innerHeight);
    }
  }, [selectedFromStationId, selectedToStationId]);

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
    <main className="flex flex-col w-full h-full mx-auto sm:w-full md:w-1/2 xl:w-1/3 2xl:w-1/4">
      <FormProvider {...methods}>
        <div className="flex flex-col flex-shrink-0 w-full min-h-dvh p-8 lg:p-16">
          <div className="flex-1">
            <Listbox
              aria-label="検索する駅名を入力してください"
              className="bg-white rounded-xl drop-shadow"
              selectionMode="single"
              disallowEmptySelection
              onSelectionChange={(keys) => {
                const keysArr = Array.from(keys as Set<string>);
                if (!keysArr.length) {
                  setValue("selectedToStationId", "");
                  setValue("selectedRouteId", "");
                  setValue("selectedFromStationId", "");
                  return;
                }

                setValue("selectedFromStationId", keysArr[0]);
              }}
            >
              {fromStations.map((sta, idx) => (
                <ListboxItem
                  className="p-4"
                  key={sta.groupId}
                  showDivider={fromStations.length < idx}
                  hideSelectedIcon
                  endContent={
                    <CheckIcon
                      className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                        selectedFromStationId === sta.groupId.toString()
                          ? "text-green-500"
                          : "text-default-400"
                      }`}
                    />
                  }
                  textValue={selectedToStationId}
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
              10駅以上の検索結果は表示されません
            </p>
          </div>

          <Input
            className="mt-8"
            required
            autoFocus
            variant="faded"
            label="検索する駅名を入力してください"
            {...register("fromStationName")}
          />
        </div>

        {selectedFromStationId && (
          <div className="flex flex-col flex-shrink-0 w-full min-h-dvh p-8 lg:p-16">
            <div className="flex-1">
              <Listbox
                aria-label="行き先の駅名を入力してください"
                className="bg-white rounded-xl drop-shadow"
                selectionMode="single"
                hideSelectedIcon
                disallowEmptySelection
                onSelectionChange={(keys) => {
                  const keysArr = Array.from(keys as Set<string>);
                  if (!keysArr.length) {
                    setValue("selectedRouteId", "");
                    setValue("selectedToStationId", "");
                    return;
                  }
                  setValue(
                    "selectedToStationId",
                    Array.from(keys as Set<string>)[0]
                  );
                }}
              >
                {toStations.map((sta, idx) => (
                  <ListboxItem
                    className="p-4"
                    key={sta.groupId}
                    showDivider={toStations.length < idx}
                    endContent={
                      <CheckIcon
                        className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                          selectedToStationId === sta.groupId.toString()
                            ? "text-green-500"
                            : "text-default-400"
                        }`}
                      />
                    }
                    textValue={selectedToStationId}
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
                10駅以上の検索結果は表示されません
              </p>
            </div>

            <Input
              required
              autoFocus
              variant="faded"
              label="行き先の駅名を入力してください"
              className="mt-4"
              {...register("toStationName")}
            />
          </div>
        )}

        {selectedFromStationId && selectedToStationId && (
          <div className="flex flex-col justify-center flex-shrink-0 w-full min-h-dvh p-8 lg:p-16">
            <p className="font-medium opacity-90 mb-8 text-center">
              {routes?.length
                ? "こちらの経路が見つかりました"
                : "経路が見つかりませんでした"}
            </p>
            {routes?.length !== 0 && (
              <>
                <Listbox className="bg-white mt-4 rounded-xl drop-shadow">
                  {(routes ?? []).map((route, idx) => (
                    <ListboxItem
                      showDivider={(routes ?? []).length < idx}
                      className="p-4"
                      key={route.id}
                      onClick={handleLineClick(
                        route.id,
                        route.stops.find(
                          (stop) =>
                            stop.groupId === Number(selectedFromStationId)
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
                          (stop) =>
                            stop.groupId === Number(selectedFromStationId)
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
                                className="w-2 h-2 rounded-full ml-1 first:ml-0"
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
                <p className="font-medium mt-2 text-xs opacity-50">
                  TrainLCDアプリで利用可能なデータであるため、実際の情報とは異なる場合があります。
                </p>
              </>
            )}
            <Button
              variant="bordered"
              color="primary"
              className="mt-8 w-32 self-center"
              onClick={() => scroll.scrollToTop()}
            >
              やり直す
            </Button>
          </div>
        )}

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col justify-center">
                  <div className="flex items-center">
                    <span>{modalContent.lineName}</span>
                    <span
                      className="ml-1 text-sm"
                      style={{ color: modalContent.trainType?.color }}
                    >
                      {removeBrackets(modalContent.trainType?.name ?? "")}
                    </span>
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
                              STOP_CONDITION_MAP[stop.stopCondition].color
                            }`}
                          >
                            {stop.name}
                          </span>
                        )
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(STOP_CONDITION_MAP).map(([key, value]) => (
                      <div className="flex items-center gap-2" key={key}>
                        <div
                          className={`w-4 h-4 bg-${value.color} border-1 rounded`}
                        />
                        <span>{value.text}</span>
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
