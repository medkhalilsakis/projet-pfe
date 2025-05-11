export type BugLevel = 'critical' | 'major' | 'minor';

export interface BugReport {
  id?: number;
  level: BugLevel;
  description: string;
  suggestions: string;
  attachments?: string[];
  projectId?: number;
  createdAt?: string;
}
