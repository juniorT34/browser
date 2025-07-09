import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SERVICES } from '@/lib/constants';
import type { Service } from '@/type';

export function DownloadExtensionButton() {
  return (
    <Button
      size="lg"
      className="bg-orange-600 hover:bg-orange-700 text-white text-lg shadow-lg"
      asChild
    >
      <a href="/chrome-extension-link" target="_blank" rel="noopener noreferrer">
        <Download className="mr-2" /> Download Chrome Extension
      </a>
    </Button>
  );
} 