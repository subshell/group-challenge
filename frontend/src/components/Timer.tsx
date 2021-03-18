import { useState, useEffect, useRef } from 'react';

const Timer = ({
  forSeconds,
  startAt = new Date(),
  onFinish,
}: {
  forSeconds: number;
  startAt?: Date;
  onFinish?: () => any;
}) => {
  const [startTime] = useState(startAt);
  const [endTime] = useState(new Date(startAt.getTime() + forSeconds * 1_000));
  const [remainingSeconds, setRemainingSeconds] = useState((endTime.getTime() - Date.now()) / 1000);
  const timerInterval = useRef<any>();

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setRemainingSeconds((endTime.getTime() - Date.now()) / 1000);
    }, 150);
    return () => {
      clearInterval(timerInterval.current);
    };
  }, [endTime, startTime]);

  useEffect(() => {
    if (remainingSeconds < 0) {
      onFinish?.();
      clearInterval(timerInterval.current);
    }
  }, [remainingSeconds, forSeconds]);

  return (
    <div className="relative">
      <div className="overflow-hidden h-2 text-xs flex bg-blue-200">
        <div
          style={{ width: `${Math.round(((forSeconds - remainingSeconds) / forSeconds) * 100)}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
        ></div>
      </div>
    </div>
  );
};

export default Timer;
