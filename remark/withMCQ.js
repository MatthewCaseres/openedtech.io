const visit = require("unist-util-visit");
const yaml = require("js-yaml");

export default function nextImages() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.lang == "mcq") {
        const yamlObject = yaml.load(node.value);
        node.type = "jsx";
        node.value = `<MCQ {...${JSON.stringify(yamlObject)}}/>`;
      }
    });
  };
}
