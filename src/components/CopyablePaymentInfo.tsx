"use client";

import { useState, useCallback, ReactNode } from "react";

function CopyableSpan({ value, children }: { value: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback silencieux
    }
  }, [value]);

  return (
    <span
      onClick={handleCopy}
      className="relative inline-flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-2 hover:text-green-600 transition-colors"
      title={`Copier : ${value}`}
    >
      {children}
      {copied ? (
        <span className="text-[10px] text-green-600 font-medium no-underline">✓</span>
      ) : (
        <svg
          className="inline w-3 h-3 text-green-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </span>
  );
}

const EMAIL_RE = /[\w.-]+@[\w.-]+\.\w+/g;
const PHONE_RE = /(?:\+?\d[\d\s.-]{7,}\d)/g;

function parsePaymentText(text: string): ReactNode[] {
  // Combine both regexes to find all matches with their positions
  const combined = new RegExp(`(${EMAIL_RE.source})|(${PHONE_RE.source})`, "g");
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = combined.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    const cleanValue = match[1] ? matched : matched.replace(/\s+/g, ""); // clean phone spaces for copy

    result.push(
      <CopyableSpan key={key++} value={match[1] ? matched : cleanValue}>
        {matched}
      </CopyableSpan>
    );

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export default function CopyablePaymentInfo({ text }: { text: string }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4 text-center">
      <p className="text-xs text-green-600 font-medium mb-1">Comment payer</p>
      <p className="text-sm text-green-800 whitespace-pre-line">
        {parsePaymentText(text)}
      </p>
    </div>
  );
}
