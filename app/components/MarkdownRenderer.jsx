"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";

// Custom components to give Bloom & Nurture rich styling to markdown elements
const components = {
  h1: ({ node, ...props }) => (
    <h3 className="text-base sm:text-lg font-bold text-rose-950 mt-3.5 mb-1.5 flex items-center gap-1.5" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h4 className="text-sm sm:text-base font-bold text-rose-900 mt-3 mb-1" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h5 className="text-xs sm:text-sm font-bold text-slate-900 mt-2.5 mb-1" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h6 className="text-xs sm:text-sm font-bold text-slate-800 mt-2 mb-0.5" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-slate-700" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-slate-900" {...props} />
  ),
  em: ({ node, ...props }) => (
    <em className="italic text-slate-800" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="space-y-1.5 my-2 pl-4 list-disc marker:text-rose-400" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="space-y-1.5 my-2 pl-4 list-decimal marker:text-rose-500 marker:font-bold" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-slate-700 leading-relaxed pl-1" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-3 border-rose-400 bg-rose-50/70 pl-3.5 py-1.5 my-2.5 rounded-r-xl text-xs sm:text-sm text-slate-700 italic" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono text-[11px] sm:text-xs font-semibold border border-rose-200/70" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="p-3 rounded-2xl bg-slate-900 text-rose-100 font-mono text-xs overflow-x-auto my-2.5 border border-slate-800 shadow-xs">
        <code {...props}>{children}</code>
      </pre>
    );
  },
  hr: () => <hr className="my-3 border-rose-100" />,
  a: ({ node, ...props }) => (
    <a
      className="text-rose-600 font-semibold underline hover:text-rose-700 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-rose-100">
      <table className="w-full text-left border-collapse text-xs" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th className="bg-rose-50/80 px-3 py-2 font-bold text-slate-800 border-b border-rose-100" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="px-3 py-2 text-slate-700 border-b border-rose-50" {...props} />
  )
};

function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  // Clean out any internal <think>...</think> tags if present from reasoning models
  const cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  return (
    <div className={`markdown-content text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown components={components}>
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRenderer);
