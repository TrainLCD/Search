import { Route, StopCondition, TrainType } from "@/gen/proto/stationapi_pb";
import dropEitherJunctionStation from "@/utils/dropJunctionStation";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { CloseSmallRoundedIcon } from "./icons/CloseSmallRounded";
import { removeBrackets } from "@/utils/removeBracket";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  modalContent: {
    id: number | undefined;
    lineName: string | undefined;
    trainType: TrainType | undefined;
  };
  route: Route | undefined;
  onLaunchApp: () => void;
};

const STOP_CONDITIONS = [
  { id: 0, text: "停車", color: "black" },
  { id: 1, text: "通過", color: "gray-400" },
  { id: 2, text: "一部通過", color: "yellow-400" },
  { id: 5, text: "一部停車", color: "yellow-400" },
  { id: 3, text: "平日停車", color: "blue-400" },
  { id: 4, text: "休日停車", color: "red-400" },
] as const;

export const RouteInfoModal = ({
  isOpen,
  onOpenChange,
  modalContent,
  route,
  onLaunchApp,
}: Props) => {
  return (
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
                {dropEitherJunctionStation(route?.stops ?? []).flatMap((stop) =>
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
              <Button color="primary" variant="flat" onPress={onLaunchApp}>
                アプリを起動
              </Button>
              <Button color="primary" variant="light" onPress={onClose}>
                閉じる
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
