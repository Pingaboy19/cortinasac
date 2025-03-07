"use client";

import {
  createClient,
  LiveClient,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
} from "@deepgram/sdk";

import { createContext, useContext, useState, ReactNode, FunctionComponent, useRef } from "react";

interface DeepgramContextType {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  transcript: string;
  isRecording: boolean;
}

const DeepgramContext = createContext<DeepgramContextType>({
  startRecording: async () => {},
  stopRecording: () => {},
  transcript: '',
  isRecording: false
});

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/deepgram", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

const DeepgramContextProvider: FunctionComponent<DeepgramContextProviderProps> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // Aquí iría la lógica de iniciar la grabación con Deepgram
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Aquí iría la lógica de detener la grabación con Deepgram
  };

  return (
    <DeepgramContext.Provider
      value={{
        startRecording,
        stopRecording,
        transcript,
        isRecording
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

// Use the useDeepgram hook to access the deepgram context and use the deepgram in any component.
// This allows you to connect to the deepgram and disconnect from the deepgram via a socket.
// Make sure to wrap your application in a DeepgramContextProvider to use the deepgram.
function useDeepgram(): DeepgramContextType {
  const context = useContext(DeepgramContext);
  if (!context) {
    throw new Error('useDeepgram debe ser usado dentro de un DeepgramProvider');
  }
  return context;
}

export {
  DeepgramContextProvider,
  useDeepgram,
  SOCKET_STATES,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
};
