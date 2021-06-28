const visit = require("unist-util-visit");

export default function nextImages() {
  return (tree) => {
    visit(tree, "image", (node) => {
      if (node.url.substr(0, 2) === "./") {
        node.url =
          "https://storage.googleapis.com/aws-csa" + node.url.substring(1);
      }
    });
  };
}
