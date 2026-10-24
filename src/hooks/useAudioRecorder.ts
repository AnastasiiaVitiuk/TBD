import { useState, useRef, useEffect, useCallback } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioLevels: number[];
  error: string | null;
  liveSpeechTranscript: string;
}

export function useAudioRecorder(langCode: string = 'en-GB') {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    recordingTime: 0,
    audioBlob: null,
    audioUrl: null,
    audioLevels: Array(24).fill(10),
    error: null,
    liveSpeechTranscript: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Setup Web Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = langCode;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setState((prev) => ({
            ...prev,
            liveSpeechTranscript: currentTranscript.trim(),
          }));
        };

        recognition.onerror = () => {
          // Non-blocking error for recognition
        };

        speechRecognitionRef.current = recognition;
      } catch (e) {
        // SpeechRecognition not supported or permission denied
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [langCode]);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !state.isRecording) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Pick 24 representative buckets
    const step = Math.floor(bufferLength / 24);
    const levels: number[] = [];
    for (let i = 0; i < 24; i++) {
      const val = dataArray[i * step] || 0;
      // map to 8 - 100%
      levels.push(Math.max(12, Math.min(100, Math.floor((val / 255) * 100))));
    }

    setState((prev) => ({ ...prev, audioLevels: levels }));
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [state.isRecording]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setState((prev) => ({
        ...prev,
        error: null,
        audioBlob: null,
        audioUrl: null,
        recordingTime: 0,
        liveSpeechTranscript: '',
      }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio analysis for waveform
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        source.connect(analyserRef.current);
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState((prev) => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorder.start(250); // Emit chunk every 250ms

      // Start Web Speech API if available
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.lang = langCode;
          speechRecognitionRef.current.start();
        } catch (_) {}
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);

      setState((prev) => ({ ...prev, isRecording: true }));
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (err: any) {
      console.warn('Microphone permission / access issue:', err);
      setState((prev) => ({
        ...prev,
        error: 'Microphone permission not granted or unsupported. You can still type in your symptoms below.',
        isRecording: false,
      }));
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
    }
  };

  const resetRecording = () => {
    stopRecording();
    setState({
      isRecording: false,
      recordingTime: 0,
      audioBlob: null,
      audioUrl: null,
      audioLevels: Array(24).fill(10),
      error: null,
      liveSpeechTranscript: '',
    });
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
