import ProblemStatus from "../ProblemStatus";
import { BiExpand, BiCollapse } from "react-icons/bi";
import { useState } from "react";
import { useSideBarDispatch } from "./SideBarContext";
import { useSession, signIn, signOut } from "next-auth/client";
import Login from "./Login";
export default function SideBarTop({
  pagePath,
}: {
  pagePath: readonly number[];
}) {
  const dispatch = useSideBarDispatch();
  return (
    <div className="flex my-3">
      <Login />
      <div className="inline-flex border-gray-500 border rounded-md overflow-hidden ml-3 cursor-pointer">
        <button
          className="px-1 border-gray-500 hover:bg-opacity-50 border-r last:border-r-0"
          onClick={() => dispatch({ type: "expand" })}
        >
          <BiExpand className="h-8 w-8 dark:text-gray-200" />
        </button>
        <button
          className="px-1 border-gray-500 hover:bg-opacity-50 border-r last:border-r-0"
          onClick={() => {
            dispatch({ type: "collapse" });
            dispatch({ type: "open", path: pagePath });
          }}
        >
          <BiCollapse className="h-8 w-8 dark:text-gray-200" />
        </button>
      </div>
    </div>
  );
}
