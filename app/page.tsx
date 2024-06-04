"use client";
import { CheckIcon } from "@/icons/Check";
import { ChevronBottomIcon } from "@/icons/ChevronBottom";
import { ChevronRightIcon } from "@/icons/ChevronRight";
import { Input } from "@nextui-org/input";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { useDisclosure } from "@nextui-org/modal";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  fromStationName: string;
  selectedFromStationId: string;
  toStationName: string;
  selectedToStationId: string;
  selectedRouteId: string;
};

const MOCK_DB = {
  matchedFromStops: [
    {
      id: 1,
      stationName: "渋谷",
      lines: [
        { id: 1, color: "#80C241" },
        { id: 2, color: "#00B48D" },
        { id: 3, color: "#F68B1E" },
        { id: 4, color: "#000088" },
        { id: 5, color: "#EE0011" },
        { id: 6, color: "#018D54" },
        { id: 7, color: "#F39700" },
        { id: 8, color: "#9B7CB6" },
        { id: 9, color: "#BB641D" },
      ],
    },
    {
      id: 2,
      stationName: "高座渋谷",
      lines: [{ id: 1, color: "#2D8BD0" }],
    },
  ],
  matchedToStops: [
    {
      id: 1,
      stationName: "元町",
      lines: [
        { id: 1, color: "#0072BC" },
        { id: 2, color: "#FFA00E" },
        { id: 3, color: "#2560A8" },
      ],
    },
    {
      id: 2,
      stationName: "元町・中華街",
      lines: [{ id: 1, color: "#0067c0" }],
    },
    {
      id: 3,
      stationName: "西元町",
      lines: [{ id: 1, color: "#2560A8" }],
    },
  ],
  matchedRoutes: [
    {
      id: 1,
      lineName: "東急東横線",
      notice: "みなとみらい線直通",
      trainTypes: [
        { id: 1, typeName: "各駅停車", color: "#1F63C6" },
        { id: 2, typeName: "急行", color: "#DC143C" },
      ],
      lines: [
        { id: 1, color: "#0067c0" },
        { id: 2, color: "#da0442" },
      ],
    },
  ],
};

export default function Home() {
  const { register, watch, setValue, getValues } = useForm<Inputs>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedTrainTypeId, setSelectedTrainTypeId] = useState<number>(1);

  const handleLineClick = useCallback(
    (routeId: string) => () => {
      setValue("selectedRouteId", routeId);
      onOpenChange();
    },
    [onOpenChange, setValue]
  );

  const modalContent = useMemo(() => {
    const route = MOCK_DB.matchedRoutes.find(
      (r) => r.id === Number(getValues().selectedRouteId)
    );
    return {
      id: route?.id,
      lineName: route?.lineName ?? "",
      trainType: route?.trainTypes.find((tt) => tt.id === selectedTrainTypeId),
    };
  }, [getValues, selectedTrainTypeId]);

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
        {watch("fromStationName") && (
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
            {MOCK_DB.matchedFromStops.map((sta, idx) => (
              <ListboxItem
                className="py-4"
                key={sta.id}
                showDivider={MOCK_DB.matchedFromStops.length < idx}
                hideSelectedIcon
                endContent={
                  <CheckIcon
                    className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                      watch("selectedFromStationId") === sta.id.toString()
                        ? "text-green-500"
                        : "text-default-400"
                    }`}
                  />
                }
              >
                <p className="font-medium opacity-90">{sta.stationName}駅</p>
                <div className="flex items-center mt-1 h-4">
                  {sta.lines.map((line) => (
                    <div
                      key={line.id}
                      className="w-2 h-2 rounded-full ml-1"
                      style={{ background: line.color }}
                    />
                  ))}
                </div>
              </ListboxItem>
            ))}
          </Listbox>
        )}
        {watch("selectedFromStationId") && (
          <Input
            required
            label="行き先の駅名を入力してください"
            className="mt-8"
            {...register("toStationName")}
          />
        )}
        {watch("toStationName") && (
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
            {MOCK_DB.matchedToStops.map((sta, idx) => (
              <ListboxItem
                className="py-4"
                key={sta.id}
                showDivider={MOCK_DB.matchedToStops.length < idx}
                endContent={
                  <CheckIcon
                    className={`text-2xl transition-colors flex-shrink-0 cursor-pointer ${
                      watch("selectedToStationId") === sta.id.toString()
                        ? "text-green-500"
                        : "text-default-400"
                    }`}
                  />
                }
              >
                <p className="font-medium opacity-90">{sta.stationName}駅</p>
                <div className="flex items-center mt-1 h-4">
                  {sta.lines.map((line) => (
                    <div
                      key={line.id}
                      className="w-2 h-2 rounded-full ml-1"
                      style={{ background: line.color }}
                    />
                  ))}
                </div>
              </ListboxItem>
            ))}
          </Listbox>
        )}
        {watch("selectedToStationId") && (
          <>
            <p className="font-medium opacity-90 w-full mt-8">
              こちらの経路が見つかりました
            </p>
            <Listbox
              className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
              onAction={console.debug}
            >
              {MOCK_DB.matchedRoutes.map((route, idx) => (
                <ListboxItem
                  showDivider={MOCK_DB.matchedRoutes.length < idx}
                  className="p-4"
                  key={route.id}
                  onClick={handleLineClick(route.id.toString())}
                  endContent={
                    <div className="flex items-center">
                      <ChevronRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
                    </div>
                  }
                >
                  <p className="font-medium opacity-90">{route.lineName}</p>
                  <div className="flex items-center mt-1 h-4">
                    {route.lines.map((line) => (
                      <div
                        key={line.id}
                        className="w-2 h-2 rounded-full ml-1"
                        style={{ background: line.color }}
                      />
                    ))}
                    <p className="text-xs ml-2 opacity-50">{route.notice}</p>
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
              <ModalHeader className="flex items-center gap-1">
                {MOCK_DB.matchedRoutes.find(
                  (r) => r.id === Number(watch("selectedRouteId"))
                )?.lineName ?? ""}

                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      className="ml-2 p-0 text-sm font-bold"
                      endContent={<ChevronBottomIcon />}
                      style={{ color: modalContent.trainType?.color }}
                    >
                      {modalContent.trainType?.typeName}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    className="p-0"
                    aria-label="Static Actions"
                    selectionMode="single"
                    onSelectionChange={(keys) =>
                      setSelectedTrainTypeId(
                        Number(Array.from(keys as Set<string>)[0])
                      )
                    }
                  >
                    {MOCK_DB.matchedRoutes.flatMap((r) =>
                      r.trainTypes.map((tt) => (
                        <DropdownItem
                          startContent={
                            <div
                              key={tt.id}
                              className="w-2 h-2 rounded-full"
                              style={{ background: tt.color }}
                            />
                          }
                          key={tt.id}
                        >
                          {tt.typeName}
                        </DropdownItem>
                      ))
                    )}
                  </DropdownMenu>
                </Dropdown>
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
                <p>
                  Magna exercitation reprehenderit magna aute tempor cupidatat
                  consequat elit dolor adipisicing. Mollit dolor eiusmod sunt ex
                  incididunt cillum quis. Velit duis sit officia eiusmod Lorem
                  aliqua enim laboris do dolor eiusmod. Et mollit incididunt
                  nisi consectetur esse laborum eiusmod pariatur proident Lorem
                  eiusmod et. Culpa deserunt nostrud ad veniam.
                </p>
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
