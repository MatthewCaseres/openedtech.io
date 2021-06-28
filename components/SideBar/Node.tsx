import { StatefulNode, useSideBarDispatch, Problem } from "./SideBarContext";
import Chevron from "./Chevron";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ProblemStatus from "../ProblemStatus";

function equalPath(subPath: readonly number[], longPath: readonly number[]) {
  if (subPath.length !== longPath.length) {
    return false;
  }
  for (let i = 0; i < subPath.length; i++) {
    if (subPath[i] !== longPath[i]) {
      return false;
    }
  }
  return true;
}
function equalPrefix(subPath: readonly number[], longPath: readonly number[]) {
  if (subPath.length > longPath.length) {
    return false;
  }
  for (let i = 0; i < subPath.length; i++) {
    if (subPath[i] !== longPath[i]) {
      return false;
    }
  }
  return true;
}
function isHighlighted(node: StatefulNode, pagePath: readonly number[]) {
  return equalPrefix(node.treePath, pagePath);
}
function isGrayBG(node: StatefulNode, pagePath: readonly number[]) {
  return equalPath(node.treePath, pagePath);
}

export default function Node({
  node,
  pagePath,
}: {
  node: StatefulNode;
  pagePath: readonly number[];
}) {
  const dispatch = useSideBarDispatch();
  const highlighted = isHighlighted(node, pagePath);
  const grayBG = isGrayBG(node, pagePath);
  const myRef = useRef<HTMLDivElement>(null);
  // This is scrolling the correct sidebar location into view if it is too far away.
  useEffect(() => {
    if (highlighted) {
      myRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [highlighted]);
  return (
    <div>
      <div
        ref={myRef}
        className={`my-1 flex flex-row text-left items-center cursor-pointer parent select-none relative rounded pl-2 hover:bg-gray-300 dark:hover:bg-gray-700 ${
          grayBG && "bg-gray-200 dark:bg-gray-800"
        } `}
        style={{ paddingTop: 1, paddingBottom: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          node.open && !node.route
            ? dispatch({ type: "close", path: node.treePath })
            : dispatch({ type: "open", path: node.treePath });
        }}
      >
        {node.route ? (
          <Link href={node.route}>
            <a
              className={`flex-1 hover:text-indigo-400 hover:underline dark:text-gray-300 text-gray-600 text-lg ${
                highlighted && "text-indigo-500 dark:text-indigo-500"
              }`}
            >
              {node.title}
            </a>
          </Link>
        ) : (
          <span
            className={`dark:text-gray-300 text-gray-600 font-semibold ${
              highlighted && "text-blue-400 dark:text-blue-600"
            }`}
          >
            {node.title}
          </span>
        )}

        <>
          {node.route && (
            <Link href={node.route}>
              <a>
                <Progress
                  problems={node.problems}
                  problemsVisible={node.problemsVisible}
                  treePath={node.treePath}
                />
              </a>
            </Link>
          )}
          {node.children && (
            <div
              className="ml-1 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                node.open
                  ? dispatch({ type: "close", path: node.treePath })
                  : dispatch({ type: "open", path: node.treePath });
              }}
            >
              <Chevron expanded={node.open ?? false} />
            </div>
          )}
        </>
      </div>
      {(node.problemsVisible || grayBG) && (
        <div className="flex flex-row flex-wrap content-center border-gray-400 border-l rounded-bl-xl ml-2 -my-1">
          {node.problems?.map((problem, index) => (
            <Link href={`${node.route}#${problem.id}`} key={index}>
              <a className="flex content-center">
                <button className="hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl p-1">
                  <ProblemStatus size="small" color={problem.color} />
                </button>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
type ProgressProps = {
  problems: readonly Problem[] | undefined;
  problemsVisible: boolean | undefined;
  treePath: readonly number[];
};
function Progress({ problems }: ProgressProps) {
  if (problems === undefined) {
    return null;
  }
  return (
    <div
      className={`flex flex-col text-xs dark:text-gray-300  rounded-md px-2 
    ${
      problems.length ===
      problems.filter((problem) => problem.color === 1).length
        ? "bg-green-200 dark:bg-green-800 "
        : problems.filter((problem) => problem.color === 1).length > 0
        ? "bg-yellow-200 dark:bg-yellow-800 "
        : "bg-gray-300 dark:bg-gray-700 "
    }`}
    >
      <div className="border-b border-black dark:border-gray-300">
        {problems.filter((problem) => problem.color === 1).length}
      </div>
      <div>{problems.length}</div>
    </div>
  );
}
