import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds = 1200) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onTimeUpRef = useRef(null);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          if (onTimeUpRef.current) onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((seconds = initialSeconds) => {
    setSecondsLeft(seconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const setOnTimeUp = useCallback((fn) => {
    onTimeUpRef.current = fn;
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsLeft <= 300 && secondsLeft > 0;
  const isCritical = secondsLeft <= 60 && secondsLeft > 0;

  return {
    secondsLeft,
    formatted,
    isRunning,
    isWarning,
    isCritical,
    start,
    stop,
    reset,
    setOnTimeUp,
  };
}
