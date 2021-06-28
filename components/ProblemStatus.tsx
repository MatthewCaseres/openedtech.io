type ProblemStatusProps = { size: "large" | "small"; color: number };
export default function ProblemStatus({ size, color }: ProblemStatusProps) {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${size === "small" ? "h-7 w-7" : "h-8 w-8"} ${
          !color
            ? "text-gray-500"
            : color === 1
            ? "text-green-500"
            : color === 2
            ? "text-yellow-500"
            : "text-red-500"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        {!color ? <QuestionMark /> : color === 1 ? <Check /> : <Flag />}
      </svg>
    </>
  );
}

function Flag() {
  return (
    <path
      fillRule="evenodd"
      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
      clipRule="evenodd"
    />
  );
}

function Check() {
  return (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  );
}

function QuestionMark() {
  return (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  );
}
