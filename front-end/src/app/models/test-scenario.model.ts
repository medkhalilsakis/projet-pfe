export interface TestScenarioStep {
  id?: number;
  description: string;
  expected: string;
}

export interface TestScenario {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;        // ISO date string
  projectId: number;         // FK vers votre entité Project
  superviseurId: number;     // FK vers votre entité User (superviseur)
  steps: TestScenarioStep[];
}
