/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmotionType = 
  | "happy" 
  | "thinking" 
  | "listening" 
  | "explaining" 
  | "surprised" 
  | "sad" 
  | "laughing";

export interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
  timestamp: string;
  emotion?: EmotionType;
}

export type SimulatedAppType = 
  | "home" 
  | "youtube" 
  | "play_song" 
  | "instagram" 
  | "whatsapp" 
  | "call" 
  | "message" 
  | "alarm" 
  | "camera" 
  | "google_search" 
  | "settings"
  | "notifications";

export interface Contact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AlarmItem {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface WhatsAppChat {
  contactName: string;
  messages: {
    id: string;
    sender: "me" | "contact";
    text: string;
    time: string;
  }[];
}
