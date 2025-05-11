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

export enum TacheStatus {
  A_DEVELOPPER = 'a_developper',
  EN_COURS     = 'en_cours',
  SUSPENDU     = 'suspendu',
  CLOTURE      = 'cloturé',
  TERMINE      = 'terminé'
}
/**
 * Tester decision values
 */
export enum TestApproval {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PauseStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}