import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

// Add SpeechRecognition types for browsers that support it
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className = '' }) => {
  const { language, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: unknown) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative inline-flex items-center justify-center p-3 rounded-full transition-all ${
        isListening
          ? 'bg-red-600 text-white shadow-lg animate-pulse ring-4 ring-red-200'
          : 'bg-green-100 hover:bg-green-200 text-green-800'
      } ${className}`}
      title={isListening ? t('stopListening') : t('pressToSpeak')}
      aria-label={isListening ? t('stopListening') : t('pressToSpeak')}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 animate-bounce" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
};
