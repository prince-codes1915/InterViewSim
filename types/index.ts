export interface UserSession {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date | string;
}

export type QuestionCategory = 'Technical' | 'Behavioral' | 'System Design' | 'Problem Solving';

export interface Question {
  id: number;
  question: string;
  category: QuestionCategory;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  techStack: string[];
  yearsExperience: number;
  questions: Question[];
  status: 'created' | 'in-progress' | 'completed';
  createdAt: Date | string;
}

export interface EvaluationResult {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  areasForImprovement: string[];
  summaryFeedback: string;
  keyTakeaways: string[];
}

export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp?: string;
}

export type VapiCallState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ended' | 'error';
