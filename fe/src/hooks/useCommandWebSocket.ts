import React, { useState } from 'react';

export const useCommand = (serverUrl: string) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [state, setState] = useState<number>(WebSocket.CLOSED);
  //  const [error, setError] = useState<Error>();

  const executeCommand = (request: string) => {
    const socket = new WebSocket(serverUrl);

    socket.onopen = () => {
      console.log('WebSocket connected', serverUrl);
      setState(socket.readyState);
      socket.send(request); // 연결되자마자 요청 보냄
    };

    socket.onmessage = (event) => {
      //  console.log('Received:', serverUrl, (event.data as string).substring(0, 50) + '....');
      setLastMessage(event.data);
    };

    socket.onerror = (event) => {
      console.error('WebSocket error', serverUrl, event);
    };

    socket.onclose = () => {
      console.log('WebSocket closed', serverUrl);
      setState(WebSocket.CLOSED);
    };
  };

  return { lastMessage, state, executeCommand };
};
