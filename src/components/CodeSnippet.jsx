"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeSnippet() {
  const [copied, setCopied] = useState(false);

  const codeString = `<script
  src="https://usepealo.com/widget/feedback-widget.js"
  data-api-key="fl_prod_8f39a0bc4"
  defer
></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0B1319] border border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-mono text-sm">
      {/* Window Header */}
      <div className="bg-[#070D10] px-4 py-3 flex items-center justify-between border-b border-neutral-800/60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          <span className="text-xs text-neutral-500 ml-2 select-none">html</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-600 px-2.5 py-1.2 rounded-md transition-all active:scale-95 duration-200"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-primary" />
              <span className="text-primary font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-5 overflow-x-auto text-left leading-relaxed text-neutral-300 whitespace-pre">

        <span className="text-rose-400">&lt;</span>
        <span className="text-rose-400">script</span>
        {"\n  "}
        <span className="text-sky-400">src</span>
        <span className="text-neutral-400">=</span>
        <span className="text-[#06AB78]">"https://usepealo.com/widget/feedback-widget.js"</span>
        {"\n  "}
        <span className="text-sky-400">data-api-key</span>
        <span className="text-neutral-400">=</span>
        <span className="text-[#06AB78]">"votre_cle_api_ici"</span>
        {"\n  "}
        <span className="text-sky-400">defer</span>
        {"\n"}
        <span className="text-rose-400">/&gt;</span>
      </div>
    </div>
  );
}
