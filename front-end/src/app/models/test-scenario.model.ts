// src/app/models/test-scenario.model.ts
export interface TestScenarioStep {
  id?: number;
  description: string;
  expected: string;
}

export interface TestScenario {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;        // date ISO
  projectId: number;
  superviseurId: number;
  steps: TestScenarioStep[];

  // --- NOUVEAUX CHAMPS POUR LE FICHIER JOINT ---
  attachmentName?: string;
  attachmentPath?: string;
  attachmentType?: string;
  attachmentSize?: number;
}
