import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson } from "lucide-react";
import { ChatMessage } from "@/pages/Index";
import { toast } from "sonner";

interface ExportControlsProps {
  chats: ChatMessage[];
  applyMasking: (text: string) => string;
}

export const ExportControls = ({ chats, applyMasking }: ExportControlsProps) => {
  const handleExport = () => {
    if (chats.length === 0) {
      toast.error("No conversations selected to export");
      return;
    }

    const exportData = chats.map(chat => ({
      title: chat.title,
      messages: chat.messages.map(msg => ({
        role: msg.role,
        content: applyMasking(msg.content),
        timestamp: msg.timestamp
      }))
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatgpt-export-filtered-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Export downloaded successfully");
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Export Data</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Export selected conversations with your masking applied.
      </p>

      <div className="space-y-3">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Selected conversations</span>
            <span className="font-semibold text-foreground">{chats.length}</span>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full"
          disabled={chats.length === 0}
        >
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </Button>
      </div>
    </Card>
  );
};
