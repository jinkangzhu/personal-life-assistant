import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  emptyText?: string;
}

export function MarkdownContent({
  content,
  className,
  emptyText = "暂无内容",
}: MarkdownContentProps) {
  if (!content.trim()) {
    return <p className="text-sm text-[var(--color-muted)]">{emptyText}</p>;
  }

  return (
    <div className={cn("markdown-body text-sm leading-relaxed text-[var(--color-foreground)]", className)}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-semibold tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-medium first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-3 text-base font-medium first:mt-0">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 [&:not(:first-child)]:mt-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-indigo-500/40 pl-4 text-[var(--color-muted)] last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-[var(--color-border)]" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline-offset-2 hover:text-indigo-300 hover:underline"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--color-foreground)]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-[var(--color-muted)]">{children}</em>,
          code: ({ className: codeClassName, children }) => {
            const isBlock = codeClassName?.includes("language-");
            if (isBlock) {
              return <code className={codeClassName}>{children}</code>;
            }
            return (
              <code className="rounded bg-[var(--color-card-hover)] px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-200">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-lg bg-[var(--color-card-hover)] p-3 font-mono text-[0.85em] leading-relaxed last:mb-0">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[var(--color-border)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-medium text-[var(--color-foreground)]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-[var(--color-border)] px-3 py-2 text-[var(--color-muted)]">
              {children}
            </td>
          ),
          del: ({ children }) => (
            <del className="text-[var(--color-muted)] line-through">{children}</del>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
