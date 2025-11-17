import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileJson, Send } from "lucide-react";
import { ChatMessage } from "@/pages/Index";
import { toast } from "sonner";

interface ExportControlsProps {
  chats: ChatMessage[];
  applyMasking: (text: string) => string;
}

export const ExportControls = ({ chats, applyMasking }: ExportControlsProps) => {
  const [endpointUrl, setEndpointUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prepareExportData = () => {
    return chats.map(chat => ({
      title: chat.title,
      messages: chat.messages.map(msg => ({
        role: msg.role,
        content: applyMasking(msg.content),
        timestamp: msg.timestamp
      }))
    }));
  };

  const handleExport = () => {
    if (chats.length === 0) {
      toast.error("No conversations selected to export");
      return;
    }

    const exportData = prepareExportData();
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

  const handleSubmit = async () => {
    if (chats.length === 0) {
      toast.error("No conversations selected to submit");
      return;
    }

    if (!endpointUrl.trim()) {
      toast.error("Please enter a POST endpoint URL");
      return;
    }

    // Validate URL format
    try {
      new URL(endpointUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting to endpoint:", endpointUrl);

    try {
      const exportData = prepareExportData();
      
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversations: exportData,
          timestamp: new Date().toISOString(),
          total_conversations: exportData.length,
          total_messages: exportData.reduce((sum, chat) => sum + chat.messages.length, 0)
        }),
      });

      if (response.ok) {
        toast.success("Data submitted successfully");
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to submit data. Please check the URL and try again.");
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="space-y-4">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or submit to endpoint</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endpoint-url" className="text-sm">POST Endpoint URL</Label>
          <Input
            id="endpoint-url"
            type="url"
            placeholder="https://your-api.com/endpoint"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={chats.length === 0 || !endpointUrl.trim() || isSubmitting}
          variant="secondary"
        >
          {isSubmitting ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-pulse" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Data
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
