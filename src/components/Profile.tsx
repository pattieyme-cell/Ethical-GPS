import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export const Profile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, token, logout, login } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [status, setStatus] = useState(user?.status || 'working');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  if (!user || !token) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const { name: newName, age: newAge, status: newStatus } = await api.updateProfile({ name, age: parseInt(age), status }, token);
      login({ ...user, name: newName, age: newAge, status: newStatus }, token);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you absolutely sure you want to delete your account? This will permanently delete all your decisions and data.")) {
      try {
        await api.deleteAccount(token);
        logout();
      } catch (err) {
        alert("Failed to delete account");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 glass-panel rounded-3xl mx-auto mt-10 animate-fade-in relative transition-all duration-300">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-purple-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-white">Your Profile</h2>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700 transition-all duration-300">
        <div className="mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Account Email</p>
          <p className="font-bold text-lg dark:text-white">{user.email}</p>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
            <input type="text" required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Age</label>
            <input type="number" required min={13} max={120} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" value={age} onChange={e => setAge(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
            <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="working">Working</option>
              <option value="studying">Studying</option>
              <option value="both">Both</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-span-2 pt-2">
            <button type="submit" disabled={saveStatus === 'saving'} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-600 transition-all flex justify-center items-center gap-2">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-red-100 dark:border-red-900/30 pt-8 mt-8">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">You Sure?</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={handleDeleteAccount} className="px-6 py-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/40 transition-all">
          Delete Account
        </button>
      </div>
    </div>
  );
};
