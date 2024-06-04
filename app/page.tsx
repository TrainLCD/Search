"use client";
import { CheckIcon } from "@/icons/Check";
import { PlusIcon } from "@/icons/Plus";
import { Input } from "@nextui-org/input";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { useForm } from "react-hook-form";

type Inputs = {
  fromStationName: string;
  selectedFromStationId: string;
  toStationName: string;
  selectedToStationId: string;
  selectedTrainTypeId: string;
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
      lines: [
        { id: 1, color: "#0067c0" },
        { id: 2, color: "#da0442" },
      ],
    },
  ],
};

export default function Home() {
  const { register, watch, setValue } = useForm<Inputs>();

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
                  endContent={
                    <div className="flex items-center">
                      <PlusIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
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
    </main>
  );
}
