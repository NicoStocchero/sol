'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          // Tables - Critical for GFM
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-dark-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-dark-700">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-dark-600 px-3 py-2 text-left font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-dark-600 px-3 py-2 text-gray-300">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-dark-700/50 transition-colors">{children}</tr>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-dark-600">{children}</tbody>
          ),

          // Headers
          h1: ({ children, id }) => (
            <h1 id={id} className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-primary-400 border-b border-dark-600 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children, id }) => (
            <h2 id={id} className="text-xl md:text-2xl font-bold mt-6 mb-3 text-primary-300">
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3 id={id} className="text-lg md:text-xl font-semibold mt-5 mb-2 text-gray-100">
              {children}
            </h3>
          ),
          h4: ({ children, id }) => (
            <h4 id={id} className="text-base md:text-lg font-semibold mt-4 mb-2 text-gray-200">
              {children}
            </h4>
          ),
          h5: ({ children, id }) => (
            <h5 id={id} className="text-base font-medium mt-3 mb-2 text-gray-300">
              {children}
            </h5>
          ),
          h6: ({ children, id }) => (
            <h6 id={id} className="text-sm font-medium mt-3 mb-2 text-gray-400">
              {children}
            </h6>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside my-3 space-y-1 ml-6 text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside my-3 space-y-1 ml-6 text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300 pl-1">{children}</li>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="my-3 text-gray-300 leading-relaxed">{children}</p>
          ),

          // Emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-200">{children}</em>
          ),

          // Code
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-dark-700 px-1.5 py-0.5 rounded text-primary-300 text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} font-mono`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-dark-800 p-4 rounded-lg overflow-x-auto my-4 border border-dark-600 text-sm">
              {children}
            </pre>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 my-4 italic text-gray-400 bg-dark-800/50 py-2 rounded-r">
              {children}
            </blockquote>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),

          // Horizontal rule
          hr: () => <hr className="my-6 border-dark-600" />,

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg my-4 border border-dark-600"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
