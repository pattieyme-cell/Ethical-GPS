export interface DecisionAnalysis {
  logic: {
    pros: string[];
    cons: string[];
  };
  emotion: {
    impactOnSelf: string;
    impactOnOthers: string;
    primaryEmotions: string[];
  };
  ethics: {
    principles: string;
    moralWeight: string;
    ethicalAlignment: string;
  };
  recommendation: string;
  consequences: {
    shortTerm: string[];
    longTerm: string[];
  };
  books: {
    title: string;
    author: string;
    reason: string;
  }[];
}

export interface DecisionEntry {
  id: string;
  timestamp: number;
  input: string;
  analysis: DecisionAnalysis;
}

export enum ViewType {
  HOME = 'home',
  ANALYZE = 'analyze',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  CONSEQUENCES = 'consequences',
  FEEDBACK = 'feedback',
  BOOKS = 'books',
  INTRO = 'intro',
  LOGIN = 'login',
  SIGNUP = 'signup',
  PROFILE = 'profile'
}

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
