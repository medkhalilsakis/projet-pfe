import { Project } from './project.model';
import { User } from './user.model';

export interface ProjectInvitedUser {
  id: number;
  project: Project;
  user: User;
  status: 'pending' | 'accepted' | 'rejected';
  invitedAt: string;         // ISO datetime string
}