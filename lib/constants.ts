// Service cards for the Services page
export const SERVICES = [
  {
    key: "browser",
    icon: "Globe",
    name: "Disposable Browser",
    desc: "Launch a secure, isolated browser session for privacy and testing.",
    enabled: true,
    select: {
      label: "Browser Type",
      options: [
        { value: "chromium", label: "Chromium", enabled: true },
        { value: "firefox", label: "Firefox", enabled: false },
        { value: "edge", label: "Edge", enabled: false },
        { value: "brave", label: "Brave", enabled: false },
      ],
      default: "chromium",
    },
    action: "Start",
  },
  {
    key: "desktop",
    icon: "Monitor",
    name: "Disposable Desktop",
    desc: "Access a full Linux desktop in the cloud.",
    enabled: true,
    select: {
      label: "Linux Flavor",
      options: [
        { value: "ubuntu", label: "Ubuntu", enabled: true },
        { value: "debian", label: "Debian", enabled: true },
        { value: "fedora", label: "Fedora", enabled: true },
        { value: "arch", label: "Arch", enabled: true },
        { value: "kali", label: "Kali", enabled: true },
      ],
      default: "ubuntu",
    },
    action: "Start",
  },
  {
    key: "file-viewer",
    icon: "FileText",
    name: "File Viewer",
    desc: "Open and analyze files in a safe, disposable environment.",
    enabled: true,
    select: null,
    action: "Start",
  },
  {
    key: "future",
    icon: "Plus",
    name: "More Services",
    desc: "More disposable services will be added soon (e.g., VS Code, Jupyter, etc.)",
    enabled: false,
    select: null,
    action: "Coming Soon",
  },
];

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
