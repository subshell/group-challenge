import { useState, useEffect, useRef } from 'react';

interface Step {
  completed: boolean;
  selected: boolean;
  description: any;
}

const Stepper = ({ steps, currentStepNumber }: { steps: string[]; currentStepNumber: number }) => {
  const [stepperSteps, setStep] = useState<Step[]>([]);
  const stepsStateRef = useRef<Step[]>();

  useEffect(() => {
    const stepsState = steps.map((step, index) => ({
      completed: false,
      selected: index === 0 ? true : false,
      description: step,
    }));

    stepsStateRef.current = stepsState;

    const currentSteps = updateStep(currentStepNumber - 1, stepsState);
    setStep(currentSteps);
  }, []);

  useEffect(() => {
    const currentSteps = updateStep(currentStepNumber - 1, stepsStateRef.current!);
    setStep(currentSteps);
  }, [currentStepNumber]);

  function updateStep(stepNumber: number, steps: Step[]) {
    const newSteps = [...steps];

    let stepCounter = 0;
    while (stepCounter < newSteps.length) {
      //current step
      if (stepCounter === stepNumber) {
        newSteps[stepCounter] = {
          ...newSteps[stepCounter],
          selected: true,
          completed: false,
        };
        stepCounter++;
      }
      // Past step
      else if (stepCounter < stepNumber) {
        newSteps[stepCounter] = {
          ...newSteps[stepCounter],
          selected: true,
          completed: true,
        };
        stepCounter++;
      }
      // Future steps
      else {
        newSteps[stepCounter] = {
          ...newSteps[stepCounter],
          selected: false,
          completed: false,
        };
        stepCounter++;
      }
    }
    return newSteps;
  }

  const stepsDisplay = stepperSteps.map((step, index) => {
    return (
      <div key={index} className={index !== stepperSteps.length - 1 ? 'w-full flex items-center' : 'flex items-center'}>
        <div className="relative flex flex-col items-center text-teal-600">
          <div
            className={`rounded-full transition duration-500 ease-in-out border-2 border-gray-300 h-10 px-4 flex items-center justify-center ${
              step.selected ? 'bg-gray-700 text-white font-bold' : ''
            }`}
          >
            {step.completed && <span className="text-xl pr-4">&#10003;</span>} {step.description}
          </div>
        </div>
        <div
          className={`flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300 ${
            step.completed ? 'border-gray-700' : 'border-gray-300'
          }`}
        >
          {' '}
        </div>
      </div>
    );
  });

  return <div className="flex justify-between items-center">{stepsDisplay}</div>;
};

export default Stepper;
