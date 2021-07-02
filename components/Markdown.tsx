import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-dark">
      <ReactMarkdown
        components={{
          p: (props) => <p {...props} style={{ margin: 0 }} />,
          pre: ({ node }) => <div>{JSON.stringify(node)}</div>,
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
