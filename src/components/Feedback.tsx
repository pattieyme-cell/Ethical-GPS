import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Feedback: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setStatus('submitting');
    try {
      await api.submitFeedback(text, token);
      setStatus('success');
      setText('');
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 glass-panel rounded-3xl mx-auto mt-20 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-purple-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      
      <h2 className="text-3xl font-bold mb-2 text-center text-slate-800 dark:text-white">Your Feedback</h2>
      <p className="text-slate-500 text-center mb-8">Tell us how we can improve the EthicsGPS platform.</p>

      {status === 'success' ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-8 rounded-2xl text-center">
          <div className="text-4xl mb-4">💚</div>
          <h3 className="text-xl font-bold mb-2">Thank you!</h3>
          <p>Your feedback has been submitted successfully.</p>
          <button onClick={onBack} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Return to App</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="What worked well for you? What could be better?"
            className="w-full h-40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={status === 'submitting' || !text.trim()} 
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-md hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
};
