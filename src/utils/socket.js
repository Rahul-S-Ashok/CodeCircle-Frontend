import io from "socket.io-client";

import { SOCKET_URL } from "./constants";

export const createSocketConnection = () => {
  return io(SOCKET_URL, {
    withCredentials: true,
    path: "/socket.io",
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("codecircle_token"),
    },
  });
};