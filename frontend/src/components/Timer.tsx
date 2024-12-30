import { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import dingSound from '../assets/ding-sound.mp3';

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
  const timerInterval = useRef<any>(undefined);
  const [timerDone, setTimerDone] = useState(false);
  const [playDingSound] = useSound(dingSound);

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setRemainingSeconds((endTime.getTime() - Date.now()) / 1000);
    }, 150);
    return () => {
      clearInterval(timerInterval.current);
    };
  }, [endTime, startTime]);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      setTimerDone(true);
    }
  }, [remainingSeconds, forSeconds]);

  useEffect(() => {
    if (timerDone) {
      onFinish?.();
      playDingSound();
      clearInterval(timerInterval.current);
    }
  }, [timerDone, onFinish]);

  const progress = (forSeconds - remainingSeconds) / forSeconds;
  let color: string;
  if (progress < 0.75) {
    color = 'bg-blue-500';
  } else if (progress < 1) {
    color = 'bg-yellow-500';
  } else {
    color = 'bg-red-500';
  }

  return (
    <div className="relative">
      <div className="overflow-hidden h-2 text-xs flex bg-blue-200">
        <div
          style={{ width: `${Math.round(progress * 100)}%` }}
          className={`shadow-none flex flex-col justify-center ${color}`}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
