import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, chatWithMentor } from '../services/geminiService';
import { DecisionAnalysis } from '../types';

interface MentorChatProps {
  dilemma: string;
  analysis: DecisionAnalysis;
}

export const MentorChat: React.FC<MentorChatProps> = ({ dilemma, analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithMentor(dilemma, analysis, messages, userMsg);
      setMessages(prev => [...prev, { role: "model", text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "model", text: "I'm having trouble connecting to my thoughts right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass-panel mt-12 rounded-3xl overflow-hidden flex flex-col h-[500px] border border-slate-200 dark:border-slate-700">
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="serif-font font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">💬</span> Deep Dive with Mentor
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ask follow-up questions about your dilemma</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/30 dark:bg-slate-900/30">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 italic mt-10">
            Send a message to explore your analysis deeper.
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-200"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
