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