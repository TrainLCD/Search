import { StationAPI } from "@/gen/proto/stationapi_connect";
import { createPromiseClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";

const transport = createGrpcWebTransport({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:50051",
});

export const grpcClient = createPromiseClient(StationAPI, transport);
