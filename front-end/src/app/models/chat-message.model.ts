// src/app/models/chat-message.model.ts

import { Project } from "./project.model";

/**
 * Pièce jointe d’un message de chat.
 */
export interface ChatAttachmentDTO {
  id: number;
  fileName: string;
  filePath: string;
  mimeType: string;
}

/**
 * Informations minimalistes sur l’expéditeur.
 */
export interface ChatSenderDTO {
  id: number;
  prenom: string;
  nom: string;
}

/**
 * Informations minimalistes sur le destinataire.
 */
export interface ChatReceiverDTO {
  id: number;
  prenom: string;
  nom: string;
}

/**
 * Représente un message de chat avec métadonnées et pièces jointes.
 */
export interface ChatMessageDTO {
  /** Identifiant unique du message */
  id: number;

  /** Contenu textuel du message */
  message: string;

  /** Horodatage de création (ISO datetime) */
  createdAt: string;

  /** Qui a envoyé ce message */
  sender: ChatSenderDTO;

  /** À qui le message est destiné */
  receiver: ChatReceiverDTO;

  /** Liste des pièces jointes associées */
  attachments: ChatAttachmentDTO[];
}


export interface ChatMessage {
  id: number;
  project: Project;
  sender: ChatSenderDTO;
  receiver: ChatReceiverDTO;
  message: string;
  createdAt: string;
  sentBy: 'me' | 'other';
}