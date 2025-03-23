import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { RailIcon } from "./icons/Rail";
import { StationIcon } from "./icons/Station";
import { Listbox, ListboxItem, ListboxSection } from "@nextui-org/listbox";
import { BugIcon } from "./icons/Bug";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  onSelect: (value: "station" | "line" | "dev") => void;
  value: "station" | "line";
  devMode: boolean;
};

export const MenuModal = ({
  isOpen,
  onOpenChange,
  onSelect,
  value,
  devMode,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>メニュー</ModalHeader>
            <ModalBody>
              <Listbox>
                <ListboxSection title="検索対象">
                  <ListboxItem
                    key="station"
                    className={
                      value === "station" ? "text-white bg-primary" : ""
                    }
                    color="primary"
                    startContent={<StationIcon className="text-2xl" />}
                    onClick={() => onSelect("station")}
                  >
                    駅検索
                  </ListboxItem>
                </ListboxSection>
                <ListboxItem
                  key="line"
                  color="primary"
                  className={value === "line" ? "text-white bg-primary" : ""}
                  startContent={<RailIcon className="text-2xl" />}
                  onClick={() => onSelect("line")}
                >
                  路線名検索
                </ListboxItem>
                <ListboxSection title="高度な設定">
                  <ListboxItem
                    key="dev"
                    color="danger"
                    className={devMode ? "text-white bg-danger" : ""}
                    startContent={<BugIcon className="text-2xl" />}
                    onClick={() => onSelect("dev")}
                  >
                    開発用機能の有効化
                  </ListboxItem>
                </ListboxSection>
              </Listbox>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>閉じる</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
