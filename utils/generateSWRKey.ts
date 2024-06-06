import { type Message } from "@bufbuild/protobuf";

export const generateSWRKey = <T extends Message>(method: string, request: T) =>
  `${method}:${Object.entries(request)
    .map(([key, value]) => `${key}:${value}`)
    .join(":")}`;
