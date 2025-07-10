// Session info returned from backend
export interface SessionInfoType {
  message: string;
  sessionId: string;
  userId: string;
  api_base_url: string;
  gui_url: string;
  direct_https_url: string;
  containerId: string;
  containerName: string;
  containerIp: string;
  publishedPort: string;
  starting_time: string;
  expires_in: number;
  usage_notes?: {
    recommended?: string;
    direct?: string;
  };
}

// Service type
export interface Service {
  key: string;
  name: string;
  icon: string;
  enabled?: boolean;
  desc?: string;
  select?: {
    label: string;
    options: { value: string; label: string; enabled?: boolean }[];
    default: string;
  } | null;
  action?: string;
  title?: string; // for features section compatibility
} 

export interface StartSessionPayload {
  userId: string;
}
export interface StartSessionResponse {
  message: string;
  sessionId: string;
  userId: string;
  api_base_url: string;
  gui_url: string;
  direct_https_url: string;
  containerId: string;
  containerName: string;
  containerIp: string;
  publishedPort: string;
  starting_time: string;
  expires_in: number;
  usage_notes: {
    recommended: string;
    direct: string;
  };
}

// --- Types matching backend contract ---


export interface StopSessionPayload {
  containerId: string;
}
export interface StopSessionResponse {
  message: string;
  containerId: string;
}

export interface ExtendSessionPayload {
  containerId: string;
  duration?: number;
}
export interface ExtendSessionResponse {
  message: string;
  containerId: string;
  expires_at: string;
}

// Admin dashboard types
export interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
  createdAt: string;
}

export interface User {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  status?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface DialogState {
  type: 'edit' | 'delete' | 'restart';
  entity: 'container' | 'user';
  id: string;
}

// For nullable dialog state
export type DialogStateOrNull = DialogState | null;

export interface ContainerForm {
  id?: string;
  name: string;
  image: string;
  status: string;
  createdAt: string;
}

export interface UserForm {
  id?: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface FormErrors {
  [key: string]: string;
}