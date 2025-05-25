import { User } from "./user.model";

export interface Meeting {
  id?: number;
  subject: string;
  date: string;
  participantsIds: number[] | null;
  description: string;
  projectId?: number;  
  createdAt: string|number|Date;
  attachments?: File[] | FileList | null;
  participants?: User[];
  participantNames?: string[];
}
