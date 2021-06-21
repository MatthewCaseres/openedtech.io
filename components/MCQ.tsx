import React, { useEffect, useState } from "react";
import Markdown from "./Markdown";
import { useSession, signIn, signOut } from "next-auth/client";
import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "react-query";

type MCQType = {
  prompt: string;
  solution: string;
  answers: string[];
  correct_idx: number | number[];
  id: string;
};
const color = 0;
type ProblemColor = { id: string; color: number };

function MCQ({ prompt, answers, solution, correct_idx, id }: MCQType) {
  function colorProblem(problemColor: ProblemColor) {
    return axios.post("/api/colorProblem", problemColor);
  }
  const mutation = useMutation(colorProblem, {
    onSuccess: (data, variables, context) => {
      console.log(data);
      // Boom baby!
    },
  });

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
      <div className="container border-gray-500 border px-4 rounded-lg">
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
            {/* text-indigo-600 */}
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
      <div className="flex flex-row items-center py-1">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 mt-1 rounded"
          onClick={() => {
            setGraded(true);
            if (isMatch && color === 0) {
              mutation.mutate({ id, color: 1 });
            }
          }}
        >
          Submit
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 ml-2 px-4 mt-1 rounded"
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

export default MCQ;
