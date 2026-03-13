import type { LucideIcon, LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type IconName = keyof typeof import("lucide-react");

export type NavItem = {
  title: string;
  href: string;
  icon: IconName;
  label?: string;
  role?: 'Principal' | 'Teacher';
};

export type Course = {
  id: string;
  title: string;
  language: 'Punjabi' | 'Hindi' | 'English';
  description: string;
  modules: number;
  imageId: string;
  progress: number;
  class: string;
};

export type Student = {
  id: string;
  name: string;
  class: string;
  avatarId: string;
  overallScore: number;
  attendance: number;
  completedCourses: number;
};

export type TeacherRole = 'Class Teacher' | 'Subject Teacher' | 'Principal';

export type Teacher = {
  id: string;
  name: string;
  role: TeacherRole;
  assignment: string;
  avatarId: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  title: string;
  courseId: string;
  questions: QuizQuestion[];
};

export type ChatContact = {
  id: string;
  name: string;
  role: string;
  avatarId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  messages: ChatMessage[];
};
