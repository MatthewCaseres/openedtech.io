import { summaryToUrlTree, UserFunction, getAllRoutesInfo } from "github-books";
import fs from "fs";
import visit from "unist-util-visit";
import GithubSlugger from "github-slugger";
import yaml from "js-yaml";

let allHeaders: Record<string, any> = {};
export type HeadersConfig = { depth: number; title: string; slug: string }[];

const headersAndProblemsFunction: UserFunction = ({ treeNode, mdast }) => {
  const routePrefix = treeNode.route;
  var slugger = new GithubSlugger();
  const headers: HeadersConfig = [];
  const problems: { id: string; color: number }[] = [];
  for (let node of mdast.children) {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      const depth = node.depth;
      const title = node.children[0].value;
      const slug = slugger.slug(title);
      headers.push({ depth, title, slug });
    } else if (node.type === "code" && node.lang === "mcq") {
      const yamlObject = yaml.load(node.value);
      if (yamlObject.id) {
        problems.push({ id: yamlObject.id, color: 0 });
      }
    }
  }
  allHeaders[routePrefix] = headers;
  if (problems.length) {
    treeNode.problems = problems;
  }
};

(async () => {
  const awsTree = await summaryToUrlTree({
    url: "https://github.com/MatthewCaseres/AWS-Notes/blob/main/source/00-index.md",
    localPath:
      "/Users/matthewcaseres/Documents/GitHub/AWS-Notes/source/00-index.md",
    userFunction: headersAndProblemsFunction,
  });
  fs.writeFileSync("bookPageHeadings.json", JSON.stringify(allHeaders));
  fs.writeFileSync("bookConfig.json", JSON.stringify([awsTree]));
})();
