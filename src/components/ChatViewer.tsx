import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Bot } from "lucide-react";
import { ChatMessage } from "@/pages/Index";

interface ChatViewerProps {
  chats: ChatMessage[];
  onToggleChat: (id: string) => void;
  onToggleAll: (selected: boolean) => void;
  applyMasking: (text: string) => string;
}

export const ChatViewer = ({ chats, onToggleChat, onToggleAll, applyMasking }: ChatViewerProps) => {
  const allSelected = chats.every(chat => chat.selected);
  const someSelected = chats.some(chat => chat.selected);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Conversations</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(true)}
            disabled={allSelected}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAll(false)}
            disabled={!someSelected}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`p-4 transition-colors ${
                chat.selected ? 'bg-card' : 'bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={chat.selected}
                  onCheckedChange={() => onToggleChat(chat.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">{chat.title}</h4>
                    <Badge variant="secondary" className="ml-auto">
                      {chat.messages.length} messages
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {chat.messages.slice(0, 3).map((message, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-border bg-background p-3 text-sm"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          {message.role === 'user' ? (
                            <User className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Bot className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium capitalize text-muted-foreground">
                            {message.role}
                          </span>
                        </div>
                        <p className="text-foreground line-clamp-2">
                          {applyMasking(message.content)}
                        </p>
                      </div>
                    ))}
                    {chat.messages.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        + {chat.messages.length - 3} more messages
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
