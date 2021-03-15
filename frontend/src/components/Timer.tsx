import { useState, useEffect, useRef } from 'react';

const Timer = ({ forSeconds, onFinish }: { forSeconds: number; onFinish?: () => any }) => {
  const [seconds, setSeconds] = useState(0);
  const [startTime] = useState(new Date());
  const timerInterval = useRef<any>();

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setSeconds((new Date().getTime() - startTime.getTime()) / 1_000);
    }, 150);
    return () => {
      clearInterval(timerInterval.current);
    };
  }, []);

  useEffect(() => {
    if (seconds > forSeconds) {
      onFinish?.();
      clearInterval(timerInterval.current);
    }
  }, [seconds]);

  return (
    <div className="relative">
      <div className="overflow-hidden h-2 text-xs flex bg-blue-200">
        <div
          style={{ width: `${Math.round((seconds / forSeconds) * 100)}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
        ></div>
      </div>
    </div>
  );
};

export default Timer;
