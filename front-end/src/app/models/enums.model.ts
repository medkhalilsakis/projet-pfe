export type ItemType = 'FILE' | 'FOLDER';

/**
 * Test status values
 */
export enum TestStatus {
  non_commence = 'non_commence',
  en_cours = 'en_cours',
  en_pause = 'en_pause',
  cloture = 'cloture',
  termine = 'termine'
}

/**
 * Tester decision values
 */
export enum TestApproval {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
