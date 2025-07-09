// Session duration in seconds
export const SESSION_DURATION = 300;

// Service display names
export const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  chromium: 'Chromium',
  // ...add other services as needed
};

// List of services
export const SERVICES = [
  {
    key: 'browser',
    icon: 'Globe',
    name: 'Disposable Browser',
    title: 'Disposable Browser',
    desc: 'Launch a secure, isolated browser session for privacy and testing.',
    enabled: true,
    select: {
      label: 'Browser Type',
      options: [
        { value: 'chromium', label: 'Chromium', enabled: true },
        { value: 'firefox', label: 'Firefox', enabled: false },
        { value: 'edge', label: 'Edge', enabled: false },
        { value: 'brave', label: 'Brave', enabled: false },
      ],
      default: 'chromium',
    },
    action: 'Start',
  },
  {
    key: 'desktop',
    icon: 'Monitor',
    name: 'Disposable Desktop',
    title: 'Disposable Desktop',
    desc: 'Access a full Linux desktop in the cloud.',
    enabled: true,
    select: {
      label: 'Linux Flavor',
      options: [
        { value: 'ubuntu', label: 'Ubuntu', enabled: true },
        { value: 'debian', label: 'Debian', enabled: true },
        { value: 'fedora', label: 'Fedora', enabled: true },
        { value: 'arch', label: 'Arch', enabled: true },
        { value: 'kali', label: 'Kali', enabled: true },
      ],
      default: 'ubuntu',
    },
    action: 'Start',
  },
  {
    key: 'file-viewer',
    icon: 'FileText',
    name: 'File Viewer',
    title: 'File Viewer',
    desc: 'Open and analyze files in a safe, disposable environment.',
    enabled: true,
    select: null,
    action: 'Start',
  },
  {
    key: 'future',
    icon: 'Plus',
    name: 'More Services',
    title: 'More Services',
    desc: 'More disposable services will be added soon (e.g., VS Code, Jupyter, etc.)',
    enabled: false,
    select: null,
    action: 'Coming Soon',
  },
];

// Icon mapping
export const ICONS = {
  Monitor: require('lucide-react').Monitor,
  Globe: require('lucide-react').Globe,
  FileText: require('lucide-react').FileText,
  Plus: require('lucide-react').Plus,
  Upload: require('lucide-react').Upload,
  Loader2: require('lucide-react').Loader2,
  // ...add other icons as needed
};

// Features for the FeaturesSection
export const FEATURES = [
  {
    icon: "Globe",
    title: "Disposable Browser",
    desc: "Launch a secure, isolated browser session for privacy and testing.",
  },
  {
    icon: "Monitor",
    title: "Disposable Desktop",
    desc: "Access a full Linux desktop in the cloud, no traces left behind.",
  },
  {
    icon: "FileText",
    title: "File Viewer",
    desc: "Open and analyze files in a safe, disposable environment.",
  },
  {
    icon: "Shield",
    title: "Ephemeral & Secure",
    desc: "All sessions are time-limited and isolated for maximum security.",
  },
];

// Features for the WhyChooseSection
export const WHY_CHOOSE_FEATURES = [
  "Zero installation required",
  "Instant deployment",
  "Enterprise-grade security",
  "Complete privacy protection",
  "Cross-platform compatibility",
  "24/7 availability",
];
