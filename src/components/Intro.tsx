import React from 'react';

export const Intro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="w-full max-w-3xl p-10 glass-panel rounded-3xl mx-auto mt-16 animate-fade-in text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
        Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Ethical GPS</span>
      </h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        Making tough life choices is never easy. We often get blinded by immediate emotions or pressured by external constraints. 
        EthicsGPS uses objective analysis to help you see the bigger picture.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
        <div className="p-6 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10">
          <div className="text-2xl mb-3">🧠</div>
          <h3 className="font-bold text-lg dark:text-white mb-2">Logic First</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">We break down the pros and cons objectively, removing the fog of immediate stress.</p>
        </div>
        <div className="p-6 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10">
          <div className="text-2xl mb-3">❤️</div>
          <h3 className="font-bold text-lg dark:text-white mb-2">Emotional Impact</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Understand how your choices affect your mental wellbeing and the feelings of those around you.</p>
        </div>
        <div className="p-6 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10">
          <div className="text-2xl mb-3">⚖️</div>
          <h3 className="font-bold text-lg dark:text-white mb-2">Ethical Weight</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Align your decisions with core moral principles and long-term philosophical integrity.</p>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold shadow-lg hover:from-indigo-600 hover:to-purple-600 hover:scale-105 transition-all text-lg"
      >
        I'm Ready to Begin
      </button>
    </div>
  );
};
