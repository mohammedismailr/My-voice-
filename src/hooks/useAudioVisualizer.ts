import { useState, useEffect, useRef } from 'react';

interface UseAudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  barCount?: number;
}

export function useAudioVisualizer({
  isListening,
  isSpeaking,
  barCount = 8,
}: UseAudioVisualizerProps) {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [frequencies, setFrequencies] = useState<number[]>(() => new Array(barCount).fill(0.1));

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Microphone Audio Capture for Listening
  useEffect(() => {
    let isCancelled = false;

    if (isListening) {
      if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            if (isCancelled) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }

            streamRef.current = stream;
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLoop = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              // Calculate overall volume / RMS
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const normalizedLevel = Math.min(1, Math.max(0, average / 128));
              setAudioLevel(normalizedLevel);

              // Sample barCount frequency points
              const step = Math.floor(dataArray.length / barCount);
              const bars = [];
              for (let i = 0; i < barCount; i++) {
                const val = (dataArray[i * step] || 0) / 255;
                bars.push(Math.max(0.1, val));
              }
              setFrequencies(bars);

              animationFrameRef.current = requestAnimationFrame(updateLoop);
            };

            updateLoop();
          })
          .catch((err) => {
            console.warn('Microphone visualizer stream unavailable:', err);
          });
      }
    } else {
      // Clean up mic capture
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    }

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isListening, barCount]);

  // Speaking Simulation Animation loop
  useEffect(() => {
    let animId: number;

    if (isSpeaking && !isListening) {
      let phase = 0;
      const step = () => {
        phase += 0.12;
        // Natural speech rhythm wave pattern
        const baseLevel = 0.4 + 0.45 * Math.abs(Math.sin(phase) * Math.cos(phase * 0.7));
        setAudioLevel(baseLevel);

        const bars = [];
        for (let i = 0; i < barCount; i++) {
          const wave = 0.2 + 0.75 * Math.abs(Math.sin(phase + i * 0.5));
          bars.push(wave);
        }
        setFrequencies(bars);

        animId = requestAnimationFrame(step);
      };

      step();
    } else if (!isListening) {
      setAudioLevel(0);
      setFrequencies(new Array(barCount).fill(0.1));
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isSpeaking, isListening, barCount]);

  return {
    audioLevel,
    frequencies,
  };
}
