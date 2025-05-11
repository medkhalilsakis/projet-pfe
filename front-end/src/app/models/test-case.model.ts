// src/app/models/testcase.model.ts
import { Project } from './project.model';

export interface TestCase {
  id?: number;
  caseNumber: string;
  title: string;
  subsystem: string;
  description: string;
  executionDate: string; // ISO date string
  preconditions: string;
  postconditions: string;
  project: Project;
  steps: TestCaseStep[];
}

export interface TestCaseStep {
  id: number;
  stepDesc: string;
  action: string;
  expected: string;
  comment: string;
  success: boolean;
  testCase: TestCase;
}
