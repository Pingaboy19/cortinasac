'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { motion } from 'framer-motion';

export default function VoiceRecorder() {
  const { startRecording, stopRecording, transcript, isRecording } = useDeepgram();
  const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);

  const handleSaveTranscript = () => {
    if (transcript) {
      setSavedTranscripts(prev => [...prev, transcript]);
      // Aquí podrías implementar el guardado en localStorage o en tu backend
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-full ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-[#E31E24] hover:bg-[#C41A1F]'
          } text-white transition-colors duration-200`}
        >
          {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
        </button>
      </div>

      {isRecording && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 p-3 bg-red-50 rounded-lg"
        >
          <p className="text-red-600">Grabando...</p>
        </motion.div>
      )}

      {transcript && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Transcripción actual:</h3>
          <p className="p-3 bg-gray-50 rounded-lg">{transcript}</p>
          <button
            onClick={handleSaveTranscript}
            className="mt-2 px-3 py-1 text-sm bg-[#E31E24] text-white rounded hover:bg-[#C41A1F] transition-colors duration-200"
          >
            Guardar Transcripción
          </button>
        </div>
      )}

      {savedTranscripts.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Transcripciones guardadas:</h3>
          <div className="space-y-2">
            {savedTranscripts.map((text, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}