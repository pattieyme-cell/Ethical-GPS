import React from 'react';

export const Consequences: React.FC<{ analysis: any }> = ({ analysis }) => {
  if (!analysis?.consequences) return null;
  const { shortTerm, longTerm } = analysis.consequences;

  return (
    <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl mt-6 animate-fade-in border border-slate-700">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">⏳</span> Future Ripple Effects
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
          <h4 className="font-bold text-amber-400 uppercase text-xs mb-3 tracking-wider">Short-Term (0-6 months)</h4>
          <ul className="space-y-2">
            {shortTerm.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-amber-500">•</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
          <h4 className="font-bold text-emerald-400 uppercase text-xs mb-3 tracking-wider">Long-Term (1+ years)</h4>
          <ul className="space-y-2">
            {longTerm.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-emerald-500">•</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
