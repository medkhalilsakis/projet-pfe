import { ItemType } from "./enums.model";
import { Project } from "./project.model";


export interface ProjectFile {
  id: number;
  project: Project;
  parent?: ProjectFile;
  name: string;
  type: ItemType;            // 'FILE' | 'FOLDER'
  fileSize?: number;
  filePath?: string;
  mimeType?: string;
  createdAt: string;         // ISO datetime string
}