import {
  useReducer,
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import produce, { Draft } from "immer";
import { UrlNode } from "github-books";
import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "react-query";

export type Problem = { id: string; color: number };
export type IdMap = Partial<Record<string, Problem>>;
export type StatefulNode = Readonly<Omit<UrlNode, "children" | "treePath">> &
  Readonly<{
    children?: ReadonlyArray<StatefulNode>;
    open?: boolean;
    hidden?: boolean;
    problemsVisible?: boolean;
    treePath: ReadonlyArray<number>;
    problems?: readonly Problem[];
  }>;
export type StatefulNodes = ReadonlyArray<StatefulNode>;
type Action =
  | { type: "open"; path: readonly number[] }
  | { type: "close"; path: readonly number[] }
  | {
      type: "toggleProblemVisibility";
      path: readonly number[];
      value?: boolean;
    }
  | { type: "expand" }
  | { type: "collapse" }
  | { type: "merge"; idMap: IdMap };
type SideBarDispatch = (action: Action) => void;
const SideBarVisibleContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);
const SideBarStateContext = createContext<StatefulNodes | undefined>(undefined);
const SideBarDispatchContext = createContext<SideBarDispatch | undefined>(
  undefined
);
const IdMapContext = createContext<IdMap | undefined>(undefined);

const sideBarReducer = produce(
  (draft: Draft<StatefulNodes>, action: Action) => {
    switch (action.type) {
      case "open":
        if (action.path.length) {
          let pathOpen = [...action.path];
          let nodeOpen = draft[pathOpen.shift()!];
          nodeOpen.open = true;
          while (pathOpen.length > 0) {
            nodeOpen = nodeOpen.children![pathOpen.shift()!];
            if (nodeOpen.children) {
              nodeOpen.open = true;
            }
          }
        }
        break;
      case "close":
        let pathClose = [...action.path];
        let nodeClose = draft[pathClose.shift()!];
        while (pathClose.length > 0) {
          nodeClose = nodeClose.children![pathClose.shift()!];
        }
        nodeClose.open = false;
        break;
      case "toggleProblemVisibility":
        if (action.path.length) {
          let toggledNode = draft[action.path[0]];
          for (let i = 1; i < action.path.length; i++) {
            toggledNode = toggledNode.children![action.path[i]];
          }
          toggledNode.problemsVisible =
            action.value ?? !toggledNode.problemsVisible;
        }
        break;
      case "merge":
        draft.forEach((node) => mergeIdMap(node, action.idMap));
        break;
      case "expand":
        draft.forEach((node) => expandAll(node));
        break;
      case "collapse":
        draft.forEach((node) => collapseAll(node));
        break;
    }
  }
);

const SideBarProvider: React.FC<{
  config: StatefulNodes;
  treePath: readonly number[];
}> = ({ children, config, treePath }) => {
  const [state, dispatch] = useReducer(sideBarReducer, config);
  const [visible, setVisible] = useState(true);
  // this and the next useEffect is creating/maintaining the problems in the nav
  const [idMap, setIdMap] = useState({});
  const { data } = useQuery<Problem[], Error>("problems", async () => {
    const { data } = await axios.get("/api/problems");
    return data;
  });
  // Merge in the changes whenever they happen
  useEffect(() => {
    if (data) {
      const newIdMap = (data as Problem[]).reduce((idAccum, problem) => {
        const { color, id } = problem;
        return { ...idAccum, ...{ [id]: { color } } };
      }, {});
      setIdMap(newIdMap);
      dispatch({ type: "merge", idMap: newIdMap });
    }
  }, [data]);
  return (
    <SideBarStateContext.Provider value={state}>
      <SideBarDispatchContext.Provider value={dispatch}>
        <SideBarVisibleContext.Provider value={[visible, setVisible]}>
          <IdMapContext.Provider value={idMap}>
            {children}
          </IdMapContext.Provider>
        </SideBarVisibleContext.Provider>
      </SideBarDispatchContext.Provider>
    </SideBarStateContext.Provider>
  );
};

export function useProblemColor(id: string) {
  const context = useContext(IdMapContext);
  if (context === undefined) {
    throw new Error("useProblemColor must be used within a SidebarProvider");
  }
  const color = context[id]?.color ?? 0;
  return color;
}

export function useSideBarState() {
  const context = useContext(SideBarStateContext);
  if (context === undefined) {
    throw new Error("useSideBarState must be used within a SidebarProvider");
  }
  return context;
}
export function useSideBarDispatch() {
  const context = useContext(SideBarDispatchContext);
  if (context === undefined) {
    throw new Error("useSideBarDispatch must be used within a SidebarProvider");
  }
  return context;
}

function mergeIdMap(node: Draft<StatefulNode>, idMap: IdMap) {
  node.problems?.forEach((problem) => {
    if (problem.id in idMap) {
      problem.color = idMap[problem.id]!.color;
    } else {
      problem.color = 0;
    }
  });
  node.children?.forEach((child) => mergeIdMap(child, idMap));
}

function expandAll(node: Draft<StatefulNode>) {
  node.open = true;
  node.problemsVisible = true;
  node.children?.forEach((child) => expandAll(child));
}

function collapseAll(node: Draft<StatefulNode>) {
  node.open = false;
  node.problemsVisible = false;
  node.children?.forEach((child) => collapseAll(child));
}

export { SideBarProvider };
