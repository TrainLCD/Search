"use client";
import { useFetchRoutes } from "@/hooks/useFetchRoutes";
import { useFetchStationsByName } from "@/hooks/useFetchStationsByName";
import { CheckIcon } from "@/icons/Check";
import { ChevronRightIcon } from "@/icons/ChevronRight";
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
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  fromStationName: string;
  selectedFromStationId: string;
  toStationName: string;
  selectedToStationId: string;
  selectedRouteId: string;
};

export default function Home() {
  const { register, watch, setValue } = useForm<Inputs>();
  const { isOpen, onOpenChange } = useDisclosure();
  const [selectedTrainTypeId, setSelectedTrainTypeId] = useState<number>(1);

  const DEBOUNCE_DELAY = 1000;

  const debouncedFromStationName = useDebounce(
    watch("fromStationName")?.trim(),
    DEBOUNCE_DELAY
  );
  const {
    stations: fromStations,
    error: fetchFromStationsError,
    isLoading: isFromStationsLoading,
  } = useFetchStationsByName(debouncedFromStationName);

  const debouncedToStationName = useDebounce(
    watch("toStationName")?.trim(),
    DEBOUNCE_DELAY
  );
  const {
    stations: toStations,
    error: fetchToStationsError,
    isLoading: isToStationsLoading,
  } = useFetchStationsByName(debouncedToStationName);

  const { routes } = useFetchRoutes(
    Number(watch("selectedFromStationId")),
    Number(watch("selectedToStationId"))
  );

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

  const route = routes?.find((r) => r.id === Number(watch("selectedRouteId")));

  const isHasTypeChange = useCallback(
    (routeId: number) => {
      const targetRoute = routes?.find((r) => r.id === routeId);
      const typeIds = targetRoute?.stops.map((s) => s.trainType?.typeId);
      return Array.from(new Set(typeIds)).length > 1;
    },
    [routes]
  );

  const fromStop = route?.stops.find(
    (stop) => stop.groupId === Number(watch("selectedFromStationId"))
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
    <main className="flex w-screen min-h-screen flex-col items-center justify-center p-8 lg:p-24">
      <form
        className="w-full sm:w-full md:w-1/2 xl:w-1/3 2xl:w-1/5"
        method="dialog"
      >
        <Input
          required
          label="駅名を入力してください"
          {...register("fromStationName")}
        />

        <Listbox
          className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
          selectionMode="single"
          onSelectionChange={(keys) =>
            setValue(
              "selectedFromStationId",
              Array.from(keys as Set<string>)[0]
            )
          }
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
                    watch("selectedFromStationId") === sta.groupId.toString()
                      ? "text-green-500"
                      : "text-default-400"
                  }`}
                />
              }
            >
              <p className="font-medium opacity-90">{sta.name}駅</p>
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

        {watch("selectedFromStationId") && (
          <Input
            required
            label="行き先の駅名を入力してください"
            className="mt-8"
            {...register("toStationName")}
          />
        )}
        {watch("selectedFromStationId") && (
          <Listbox
            className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
            selectionMode="single"
            hideSelectedIcon
            onSelectionChange={(keys) =>
              setValue(
                "selectedToStationId",
                Array.from(keys as Set<string>)[0]
              )
            }
          >
            {toStations.map((sta, idx) => (
              <ListboxItem
                className="p-4"
                key={sta.groupId}
                showDivider={toStations.length < idx}
                endContent={
                  <CheckIcon
                    className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                      watch("selectedToStationId") === sta.groupId.toString()
                        ? "text-green-500"
                        : "text-default-400"
                    }`}
                  />
                }
              >
                <p className="font-medium opacity-90">{sta.name}駅</p>
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
        )}
        {watch("selectedFromStationId") && watch("selectedToStationId") && (
          <>
            <p className="font-medium opacity-90 w-full mt-8">
              こちらの経路が見つかりました
            </p>
            <Listbox className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow">
              {(routes ?? [])?.map((route, idx) => (
                <ListboxItem
                  showDivider={(routes ?? []).length < idx}
                  className="p-4"
                  key={route.id}
                  onClick={handleLineClick(
                    route.id,
                    route.stops.find(
                      (stop) =>
                        stop.groupId === Number(watch("selectedFromStationId"))
                    )?.trainType?.typeId
                  )}
                  endContent={
                    <div className="flex items-center">
                      <ChevronRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
                    </div>
                  }
                >
                  <p className="font-medium opacity-90">
                    {route.stops.find(
                      (stop) =>
                        stop.groupId === Number(watch("selectedFromStationId"))
                    )?.line?.nameShort ?? ""}
                    &nbsp;
                    {route.stops.find(
                      (stop) =>
                        stop.groupId === Number(watch("selectedFromStationId"))
                    )?.trainType?.name ?? ""}
                  </p>
                  <div className="mt-1">
                    <div className="flex">
                      {Array.from(
                        new Map(
                          route.stops.map((stop) => [stop.line?.id, stop])
                        ).values()
                      ).map((stop) => (
                        <div
                          key={stop.line?.id}
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
          </>
        )}
      </form>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col justify-center">
                <div className="flex items-center">
                  <span> {modalContent.lineName}</span>
                  <span
                    className="ml-1 text-sm"
                    style={{ color: modalContent.trainType?.color }}
                  >
                    {modalContent.trainType?.name}
                  </span>
                </div>
              </ModalHeader>

              <ModalBody>
                <p>停車駅: </p>
                <p>{route?.stops.flatMap((stop) => stop.name).join("、")}</p>
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
    </main>
  );
}
