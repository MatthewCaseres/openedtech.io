import React, { useEffect, useState } from "react";
import { usePopper } from "react-popper";
import Markdown from "./Markdown";
import useOnclickOutside from "react-cool-onclickoutside";
import { useSession, signIn, signOut } from "next-auth/client";
import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "react-query";
import type { Problem } from "./SideBar/SideBarContext";
import { useProblemColor } from "./SideBar/SideBarContext";
import ProblemStatus from "./ProblemStatus";

type MCQType = {
  prompt: string;
  solution: string;
  answers: string[];
  correct_idx: number | number[];
  id: string;
};
const color = 0;

function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function useCompleteProblem() {
  async function setProblemColor(problem: Problem): Promise<Problem> {
    const res = await axios.post("/api/setProblemColor", problem);
    return res.data;
  }
  const queryClient = useQueryClient();
  return useMutation(setProblemColor, {
    // When mutate is called:
    onMutate: async (problem) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries("problems");

      // Snapshot the previous value
      const previousProblems = queryClient.getQueryData<Problem[]>("problems");
      // Optimistically update to the new value
      if (previousProblems) {
        let inExisting = false;
        let newProblems = previousProblems.map((prevProb) => {
          if (problem.id === prevProb.id) {
            inExisting = true;
            return problem;
          } else {
            return prevProb;
          }
        });
        if (!inExisting) {
          newProblems.push(problem);
        }
        queryClient.setQueryData<Problem[]>("problems", newProblems);
      }
      // Return a context object with the snapshotted value
      return { previousProblems };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    // Why is this typing not good?
    onError: (err, newTodo, context: any) => {
      if (context?.previousProblems) {
        queryClient.setQueryData("problems", context.previousTodos);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries("problems");
    },
  });
}

export function Dropdown({
  id,
  problemColor,
}: {
  id: string;
  problemColor: number;
}) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const { styles, attributes } = usePopper(referenceElement, popperElement);
  const ref = useOnclickOutside(() => {
    setMenuVisible(false);
  });
  const mutation = useCompleteProblem();
  return (
    <div
      onClick={() => setMenuVisible((visible) => !visible)}
      ref={ref}
      className="flex align-middle mr-2"
    >
      <button
        ref={setReferenceElement}
        className="border-gray-400 border rounded-md flex items-center"
        style={{ padding: 2 }}
      >
        <ProblemStatus color={problemColor} size="large" />
        <ChevronDown />
      </button>

      {menuVisible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="flex border bg-white dark:bg-black border-gray-400 my-1 p-1 rounded-lg">
            {[0, 1, 2, 3].map((color) => (
              <button
                className="hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => mutation.mutate({ id, color })}
              >
                <ProblemStatus color={color} size="large" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MCQ({
  prompt,
  answers,
  solution,
  correct_idx,
  id,
}: MCQType) {
  const problemColor = useProblemColor(id);
  const mutation = useCompleteProblem();
  const singleSelect = typeof correct_idx === "number";
  const correct_idx_array = singleSelect
    ? [correct_idx as number]
    : (correct_idx as number[]);
  const [graded, setGraded] = useState(false);
  const [selectedIdxs, setSelectedIdx] = useState<number[]>([]);
  function changeSelection(idx: number) {
    setGraded(false);
    if (singleSelect) {
      setSelectedIdx([idx]);
    } else {
      if (selectedIdxs.includes(idx)) {
        setSelectedIdx(selectedIdxs.filter((el) => el !== idx));
      } else {
        setSelectedIdx([...selectedIdxs, idx]);
      }
    }
  }
  //LOL array equality check
  const isMatch =
    selectedIdxs.sort().toString() === correct_idx_array.sort().toString();
  return (
    <div id={id}>
      <div className="container border-gray-400 border px-4 rounded-lg">
        <div className="py-2 mt-2">
          <Markdown content={prompt} />
          {graded &&
            (isMatch ? (
              <div className="bg-green-300 dark:bg-green-800 border-2 rounded-xl border-green-400 dark:border-green-700 px-2 py-1 mt-2 ">
                <Markdown content={solution} />
              </div>
            ) : (
              <div className="bg-red-300 dark:bg-red-800 border-2 rounded-xl border-red-400 dark:border-red-700 px-2 py-1 mt-2">
                <Markdown content="Incorrect" />
              </div>
            ))}
        </div>
        {answers.map((answer, index) => (
          <div
            key={index}
            className="flex flex-row items-center border-gray-800 border-t py-1"
          >
            <input
              type={singleSelect ? "radio" : "checkbox"}
              className="form-radio mr-4 "
              value={index}
              onChange={() => changeSelection(index)}
              checked={selectedIdxs.includes(index)}
            ></input>
            <Markdown content={answer} />
          </div>
        ))}
      </div>
      <div className="flex flex-row items-center py-2">
        <Dropdown id={id} problemColor={problemColor} />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
          onClick={() => {
            setGraded(true);
            if (isMatch && problemColor === 0) {
              mutation.mutate({ id, color: 1 });
            }
          }}
        >
          Submit
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 ml-2 px-4 rounded"
          onClick={() => {
            setGraded(true);
            setSelectedIdx(correct_idx_array);
          }}
        >
          Solution
        </button>
      </div>
    </div>
  );
}
