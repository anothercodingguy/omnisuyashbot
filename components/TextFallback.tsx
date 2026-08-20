'use client';

import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface TextFallbackProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function TextFallback({
  onSendMessage,
  isLoading,
  placeholder = 'Ask a question about Suyash’s projects, research, or experience...',
}: TextFallbackProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative flex items-center">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-[#0d1117]/90 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 text-white disabled:text-slate-500 transition-all shadow-md active:scale-95"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
