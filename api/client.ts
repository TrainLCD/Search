import { StationAPI } from "@/gen/proto/stationapi_connect";
import { createPromiseClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";

const transport = createConnectTransport({
  baseUrl: process.env.API_URL ?? "http://127.0.0.1:50051",
});

const client = createPromiseClient(StationAPI, transport);
