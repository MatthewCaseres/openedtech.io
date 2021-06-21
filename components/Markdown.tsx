import ReactMarkdown from "react-markdown";

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-dark">

    <ReactMarkdown
      components={{
        p: (props) => <p {...props} style={{ margin: 0 }} />,
        pre: ({node}) => <div>
          {JSON.stringify(node)}
        </div>
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}