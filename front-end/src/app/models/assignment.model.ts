import { TestStatus, TestApproval } from "./enums.model";
import { Project } from "./project.model";
import { User } from "./user.model";


export interface ProjectTesterAssignment {
  id: number;
  project: Project;
  testeur: User;
  superviseur: User;
  dateDesignation: string;   // ISO date string (YYYY-MM-DD)
  numeroTesteur: number;
  casTestPath?: string;
  statutTest: TestStatus;
  decision?: TestApproval;
  rapportTestPath?: string;
}