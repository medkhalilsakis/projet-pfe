// src/app/models/file-node.model.ts

/**
 * Type d’élément dans l’explorateur de fichiers
 */
export type ItemType = 'FILE' | 'FOLDER';

/**
 * Noeud représentant un fichier ou un dossier dans l’arborescence
 */
export interface FileNode {
  /** Identifiant unique du nœud */
  id: number;

  /** Nom du fichier ou du dossier */
  name: string;

  /** Type de l’élément : fichier ou dossier */
  type: ItemType;

  /** Chemin complet relatif ou absolu vers le fichier */
  filePath: string;

  /** Sous-éléments (pour les dossiers) */
  children?: FileNode[];
}
