import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speak = useCallback(
    (text: string, langCode: string = 'en-GB') => {
      if (!supported || !text) return;

      window.speechSynthesis.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clear conversational pace

      // Try finding voice matching language prefix
      const matchingVoice = voices.find(
        (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.startsWith(langCode.slice(0, 2))
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      utterance.lang = langCode;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [supported, voices]
  );

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return {
    isSpeaking,
    speak,
    stop,
    supported,
  };
}
