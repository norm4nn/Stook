export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  socialLinks: SocialLinks;
  shareSettings: ShareSettings;
}

export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  customLinks?: string[];
}

export interface ShareSettings {
  sharePhone: boolean;
  shareEmail: boolean;
  shareSocial: boolean;
  shareGraph: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  socialLinks?: SocialLinks;
  tapDate: Date;
  location?: string;
  graph?: string[];
}

export interface TapEvent {
  id: string;
  contactId: string;
  timestamp: Date;
  customMessage?: string;
  customSound?: string;
}