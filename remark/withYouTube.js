const visit = require("unist-util-visit");
const getYouTubeID = require("get-youtube-id");
const fs = require("fs");

export default function embedYouTube() {
  return (tree) => {
    visit(tree, "paragraph", (node) => {
      if (
        node.children?.[0]?.url?.startsWith("https://www.youtube.com/watch?v=")
      ) {
        node.type = "jsx";
        node.value = `
        <div className="react-player-wrapper">
          <ReactPlayer 
            className="react-player"
            url="${node.children[0].url}" 
            width="100%" 
            height="100%"
            controls={true}
          />
        </div>
        `;
      }
    });
  };
}
