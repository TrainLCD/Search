"use client";
import { ArrowRightIcon } from "@/icons/ArrowRight";
import { CheckIcon } from "@/icons/Check";
import { PlusIcon } from "@/icons/Plus";
import { Input } from "@nextui-org/input";
import { Listbox, ListboxItem } from "@nextui-org/listbox";

export default function Home() {
  return (
    <main className="flex w-screen min-h-screen flex-col items-center justify-center p-8 lg:p-24">
      <form className="w-full sm:w-full md:w-1/2 xl:w-1/3 2xl:w-1/5">
        <Input
          required
          label="駅名を入力してください"
          endContent={
            <div className="h-full flex justify-center items-center">
              <ArrowRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            </div>
          }
        />
        <Listbox
          className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
          onAction={(key) => alert(console.debug)}
        >
          <ListboxItem
            className="py-4"
            key="new"
            showDivider
            endContent={
              <CheckIcon className="text-2xl transition-colors flex-shrink-0 cursor-pointer text-green-500" />
            }
          >
            <p className="font-medium opacity-90">渋谷駅</p>
          </ListboxItem>
          <ListboxItem
            className="py-4"
            key="new"
            endContent={
              <CheckIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            }
          >
            <p className="font-medium opacity-90">高座渋谷駅</p>
          </ListboxItem>
        </Listbox>
        <Input
          required
          label="行き先の駅名を入力してください"
          className="mt-8"
          endContent={
            <div className="h-full flex justify-center items-center">
              <ArrowRightIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            </div>
          }
        />
        <Listbox
          className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
          onAction={(key) => alert(console.debug)}
        >
          <ListboxItem
            className="py-4"
            key="new"
            showDivider
            endContent={
              <CheckIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            }
          >
            <p className="font-medium opacity-90">元町駅</p>
          </ListboxItem>
          <ListboxItem
            className="py-4"
            key="new"
            showDivider
            endContent={
              <CheckIcon className="text-2xl transition-colors flex-shrink-0 cursor-pointer text-green-500" />
            }
          >
            <p className="font-medium opacity-90">元町・中華街駅</p>
          </ListboxItem>
          <ListboxItem
            className="py-4"
            key="new"
            endContent={
              <CheckIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
            }
          >
            <p className="font-medium opacity-90">西元町駅</p>
          </ListboxItem>
        </Listbox>

        <p className="font-medium opacity-90 w-full mt-8">
          こちらの経路が見つかりました
        </p>
        <Listbox
          className="bg-white bg-opacity-80 mt-4 rounded-xl drop-shadow"
          onAction={(key) => alert(console.debug)}
        >
          <ListboxItem
            showDivider
            className="p-4"
            key="new"
            endContent={
              <div className="flex items-center">
                <PlusIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
              </div>
            }
          >
            <p className="font-medium opacity-90">東急東横線</p>
            <div className="flex items-center mt-1 h-4">
              <p className="text-xs mr-1 opacity-50">みなとみらい線直通</p>
              <div className="w-2 h-2 rounded-full ml-1 bg-[#da0442]" />
              <div className="w-2 h-2 rounded-full ml-1 bg-[#0067c0]" />
            </div>
          </ListboxItem>
          <ListboxItem
            className="p-4"
            key="new"
            endContent={
              <div className="flex items-center">
                <PlusIcon className="text-2xl text-default-400 transition-colors flex-shrink-0 cursor-pointer" />
              </div>
            }
          >
            <p className="font-medium opacity-90">湘南新宿ライン</p>
            <div className="flex items-center mt-1 h-4">
              <div className="w-2 h-2 rounded-full ml-1 bg-[#e31f26]" />
              <div className="w-2 h-2 rounded-full ml-1 bg-[#0067c0]" />
            </div>
          </ListboxItem>
        </Listbox>
      </form>
    </main>
  );
}
