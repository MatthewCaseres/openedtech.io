import React, { useState } from "react";
import Markdown from "./Markdown";
import create from "zustand";
import produce from "immer";
import yaml from "js-yaml";
import { nanoid } from "nanoid";

type MCQMakerType = {
  fields: string[];
  correct_idx: number | number[];
  setFieldAtIdx: (idx: number, value: string) => void;
  changeCorrectIdx: (idx: number | number[]) => void;
  switchCorrectIdxType: () => void;
};

// zustand store for the component
const useMCQMakerStore = create<MCQMakerType>((set, get) => ({
  fields: [
    "You click on a part of the question to begin editing it",
    "This is where the solution is. Click to start editing.",
    "The selected answer will be used as the correct answer",
    'You can change between "Single Select" and "Multiple Select" questions.',
    "You can output the JSX or YAML code for the problem to use in your program.",
    "Thanks!",
    "For multiple selection questions there are two correct answers usually.",
  ],
  correct_idx: 0,
  setFieldAtIdx: (idx, value) =>
    set(
      produce(get(), (draft) => {
        draft.fields[idx] = value;
      })
    ),
  changeCorrectIdx: (idx) =>
    set(
      produce(get(), (draft) => {
        if (typeof draft.correct_idx === "number") {
          draft.correct_idx = idx;
        } else {
          if (draft.correct_idx.includes(idx as number)) {
            draft.correct_idx.splice(
              draft.correct_idx.indexOf(idx as number),
              1
            );
          } else {
            draft.correct_idx.push(idx as number);
          }
        }
      })
    ),
  switchCorrectIdxType: () => {
    if (typeof get().correct_idx === "number") {
      set({ correct_idx: [get().correct_idx as number] });
    } else {
      set({ correct_idx: (get().correct_idx as number[])[0] ?? 0 });
    }
  },
}));

export default function MCQ() {
  const fields = useMCQMakerStore((state) => state.fields);
  const correct_idx = useMCQMakerStore((state) => state.correct_idx);
  const isSingleSelect = typeof correct_idx === "number" ? true : false;
  const setFieldAtIdx = useMCQMakerStore((state) => state.setFieldAtIdx);
  const changeCorrectIdx = useMCQMakerStore((state) => state.changeCorrectIdx);
  const switchCorrectIdxType = useMCQMakerStore(
    (state) => state.switchCorrectIdxType
  );
  const [selected, setSelected] = useState(0);

  const singleSelect = typeof correct_idx === "number" ? true : false;
  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row space-x-3 items-center py-2">
          <>
            <button
              onClick={() => switchCorrectIdxType()}
              className="bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700  border-2 px-2 py-1 mt-2 rounded-md dark:text-gray-200"
            >
              {singleSelect
                ? "Switch to Multi-Select"
                : "Switch to Single Select"}
            </button>
            <button
              className="flex items-center bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700  border-2 px-2 py-1 mt-2 rounded-md dark:text-gray-200"
              onClick={() => {
                const mcqYAML = yaml.dump({
                  prompt: fields[0],
                  solution: fields[1],
                  answers: fields.slice(
                    2,
                    typeof correct_idx === "number" ? 6 : 7
                  ),
                  correct_idx: correct_idx,
                  id: nanoid(),
                });
                navigator.clipboard.writeText("```mcq\n" + mcqYAML + "```");
              }}
            >
              <ClipboardSVG />
              Copy YAML
            </button>
            <button
              className="flex items-center bg-gray-300 dark:bg-gray-800 border-gray-400 dark:border-gray-700  border-2 px-2 py-1 mt-2 rounded-md dark:text-gray-200"
              onClick={() => {
                navigator.clipboard.writeText(
                  `<MCQ {...${JSON.stringify({
                    prompt: fields[0],
                    solution: fields[1],
                    answers: fields.slice(
                      2,
                      typeof correct_idx === "number" ? 6 : 7
                    ),
                    correct_idx: correct_idx,
                    id: nanoid(),
                  })}} />`
                );
              }}
            >
              <ClipboardSVG />
              Copy JSX
            </button>
          </>
        </div>
        {/* textarea that updates the selected field */}
        <textarea
          onChange={(e) => setFieldAtIdx(selected, e.target.value)}
          value={fields[selected]}
          className=" w-full m-5 rounded-md"
        />
      </div>
      <div className="container border-gray-400 border px-4 rounded-lg">
        <div className="py-2 mt-2">
          <div
            className={`px-2 py-1 mt-2 rounded-xl ${
              selected === 0
                ? "bg-indigo-300 dark:bg-indigo-800 border-indigo-400 dark:border-indigo-700 border-2 "
                : ""
            } `}
            onClick={() => setSelected(0)}
          >
            <Markdown content={fields[0]} />
          </div>
          <div
            className={`${
              selected === 1
                ? "bg-indigo-300 dark:bg-indigo-800 border-indigo-400 dark:border-indigo-700"
                : "bg-green-300 dark:bg-green-800 border-green-400 dark:border-green-700"
            }  border-2 rounded-xl  px-2 py-1 mt-2 `}
            onClick={() => {
              setSelected(1);
            }}
          >
            <Markdown content={fields[1]} />
          </div>
        </div>
        {fields.slice(2, isSingleSelect ? 6 : 7).map((answer, index) => (
          <div
            key={index}
            className={`${
              selected === index + 2
                ? "bg-indigo-300 dark:bg-indigo-800 border-indigo-400 dark:border-indigo-700 px-2 rounded-md"
                : ""
            } flex flex-row items-center border-gray-800 border-t py-1`}
            onClick={() => setSelected(index + 2)}
          >
            <input
              type={singleSelect ? "radio" : "checkbox"}
              className="form-radio mr-4 "
              value={index}
              onChange={() => {
                changeCorrectIdx(index);
              }}
              onClick={(e) => e.stopPropagation()}
              checked={
                typeof correct_idx === "number"
                  ? correct_idx === index
                  : correct_idx.includes(index)
              }
            ></input>
            <Markdown content={answer} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ClipboardSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
      />
    </svg>
  );
}
