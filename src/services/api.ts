import { User, AuthResponse, DecisionEntry } from '../types';

const API_URL = 'http://localhost:3001/api';

const getHeaders = (token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
});

export const api = {
  async register(data: Omit<User, 'id'> & { password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async saveDecision(input: string, analysis: any, token: string): Promise<DecisionEntry> {
    const res = await fetch(`${API_URL}/decisions`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ input, analysis })
    });
    if (!res.ok) throw new Error('Failed to save decision');
    return res.json();
  },

  async getDecisions(token: string): Promise<DecisionEntry[]> {
    const res = await fetch(`${API_URL}/decisions`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return res.json();
  },

  async submitFeedback(feedback_text: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ feedback_text })
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
  },

  async updateProfile(data: { name: string, age: number, status: string }, token: string): Promise<any> {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async deleteAccount(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/account`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete account');
  },

  async deleteDecision(id: number | string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/decisions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to delete decision');
  }
};
