'use client';

import { useState, useRef, useEffect } from 'react';
import { trackChatOpen, trackChatLead } from '@/lib/tracking';
import { subscribeContact } from '@/lib/api';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const GREETING = `Hi! I'm 818 Capital's AI lending assistant. I can help you:

- Figure out which loan program fits your deal
- Estimate your DSCR or flip profit
- Walk you through our process
- Connect you with our team

What are you working on?`;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !hasTrackedOpen) {
      trackChatOpen();
      setHasTrackedOpen(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
        }),
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      // If the AI collected lead info, track it
      if (data.leadCaptured) {
        trackChatLead(data.dealType || 'unknown');
        if (data.email) {
          subscribeContact({
            email: data.email,
            first_name: data.name,
            tags: ['chatbot'],
            source: 'chat_widget',
          }).catch(() => {});
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. You can reach our team directly at (917) 993-9194 or deals@818capitalpartners.com.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 z-[90] w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-navy-100 flex flex-col overflow-hidden"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="bg-navy-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-sans font-semibold text-white">818 Capital</p>
                <p className="text-xs text-navy-300">AI Lending Assistant</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-navy-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm font-body leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-navy-50 text-navy-700 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-navy-50 rounded-xl px-4 py-3 rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-navy-100 px-4 py-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about DSCR, fix & flip, rates..."
              className="flex-1 px-3 py-2 text-sm font-body rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 md:right-6 z-[90] w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition flex items-center justify-center group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
          </>
        )}
      </button>
    </>
  );
}
