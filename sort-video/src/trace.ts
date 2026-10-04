export type StepAction =
  | "intro"
  | "compare"
  | "swap"
  | "no_swap"
  | "element_sorted"
  | "sorted";

export type Step = {
  arr: number[];
  prevArr: number[];
  compare?: [number, number]; // indices being compared [j, j+1]
  swap?: [number, number]; // indices being swapped [j, j+1]
  sortedIndices: number[]; // indices locked in sorted position
  action: StepAction;
  line: number; // 1-4 line number in Python code
  i: number; // outer loop index
  j: number; // inner loop index
  comparisonResult?: boolean; // whether arr[j] > arr[j+1]
  leftVal?: number;
  rightVal?: number;
  description: string;
  duration: number; // duration in frames
  startFrame: number; // start frame in composition
};

// Input array (educational standard)
export const input = [5, 60, 53, 93, 63];

export const codeLines = [
  "for i in range(len(arr)):",
  "  for j in range(len(arr) - i - 1):",
  "    if arr[j] > arr[j + 1]:",
  "      arr[j], arr[j + 1] = arr[j + 1], arr[j]",
];

export const generateTrace = (
  initialArray: number[],
): { steps: Step[]; totalDuration: number } => {
  const generatedSteps: Step[] = [];
  const currentArr = [...initialArray];
  const sortedSet = new Set<number>();
  let currentFrame = 0;

  const addStep = (
    data: Omit<Step, "startFrame" | "duration">,
    duration: number,
  ) => {
    const step: Step = {
      ...data,
      arr: [...data.arr],
      prevArr: [...data.prevArr],
      sortedIndices: Array.from(sortedSet).sort((a, b) => a - b),
      duration,
      startFrame: currentFrame,
    };
    generatedSteps.push(step);
    currentFrame += duration;
  };

  // 1. Intro Step
  addStep(
    {
      arr: [...currentArr],
      prevArr: [...currentArr],
      action: "intro",
      line: 1,
      i: 0,
      j: 0,
      sortedIndices: [],
      description: "Initialize array: Bubble Sort algorithm starting",
    },
    38,
  );

  const n = currentArr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const leftVal = currentArr[j];
      const rightVal = currentArr[j + 1];
      const needsSwap = leftVal > rightVal;

      // Comparison step
      addStep(
        {
          arr: [...currentArr],
          prevArr: [...currentArr],
          compare: [j, j + 1],
          action: "compare",
          line: 3,
          i,
          j,
          comparisonResult: needsSwap,
          leftVal,
          rightVal,
          sortedIndices: [],
          description: `Compare arr[${j}] (${leftVal}) and arr[${j + 1}] (${rightVal})`,
        },
        22,
      );

      if (needsSwap) {
        const prevArr = [...currentArr];
        // Perform swap
        [currentArr[j], currentArr[j + 1]] = [currentArr[j + 1], currentArr[j]];

        // Swap step
        addStep(
          {
            arr: [...currentArr],
            prevArr,
            compare: [j, j + 1],
            swap: [j, j + 1],
            action: "swap",
            line: 4,
            i,
            j,
            comparisonResult: true,
            leftVal,
            rightVal,
            sortedIndices: [],
            description: `${leftVal} > ${rightVal}: Swap positions!`,
          },
          28,
        );
      } else {
        // No swap step
        addStep(
          {
            arr: [...currentArr],
            prevArr: [...currentArr],
            compare: [j, j + 1],
            action: "no_swap",
            line: 3,
            i,
            j,
            comparisonResult: false,
            leftVal,
            rightVal,
            sortedIndices: [],
            description: `${leftVal} ≤ ${rightVal}: Already in order`,
          },
          14,
        );
      }
    }

    // Element at index (n - 1 - i) has bubbled to its final position
    const sortedIdx = n - 1 - i;
    sortedSet.add(sortedIdx);

    // If i === n - 2, then index 0 is also guaranteed sorted!
    if (i === n - 2) {
      sortedSet.add(0);
    }

    addStep(
      {
        arr: [...currentArr],
        prevArr: [...currentArr],
        action: "element_sorted",
        line: 2,
        i,
        j: n - i - 1,
        sortedIndices: [],
        description: `Element ${currentArr[sortedIdx]} locked into position! ✓`,
      },
      20,
    );
  }

  // Final guaranteed all-sorted state with celebration
  for (let k = 0; k < n; k++) {
    sortedSet.add(k);
  }

  addStep(
    {
      arr: [...currentArr],
      prevArr: [...currentArr],
      action: "sorted",
      line: 4,
      i: n - 1,
      j: 0,
      sortedIndices: [],
      description: "Array is completely sorted! ✓",
    },
    90,
  );

  return { steps: generatedSteps, totalDuration: currentFrame };
};

const traceData = generateTrace(input);
export const steps = traceData.steps;
export const TOTAL_FRAMES = traceData.totalDuration;
