import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Bot, EyeOff } from "lucide-react";
import { ChatMessage } from "@/pages/Index";
import { toast } from "sonner";

interface ChatViewerProps {
  chats: ChatMessage[];
  onToggleChat: (id: string) => void;
  onToggleAll: (selected: boolean) => void;
  applyMasking: (text: string) => string;
  onAddMaskedWord: (word: string) => void;
}

export const ChatViewer = ({ chats, onToggleChat, onToggleAll, applyMasking, onAddMaskedWord }: ChatViewerProps) => {
  const allSelected = chats.every(chat => chat.selected);
  const someSelected = chats.some(chat => chat.selected);
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setSelectedText(text);
          setSelectionPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
        }
      } else {
        setSelectedText("");
        setSelectionPosition(null);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, []);

  const handleMaskSelection = () => {
    if (selectedText) {
      onAddMaskedWord(selectedText);
      toast.success(`"${selectedText}" added to masked words`);
      window.getSelection()?.removeAllRanges();
      setSelectedText("");
      setSelectionPosition(null);
    }
  };

  const toggleExpanded = (chatId: string) => {
    setExpandedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  return (
    <>
      {/* Floating mask button */}
      {selectedText && selectionPosition && (
        <div
          className="fixed z-50 animate-in fade-in zoom-in-95"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <Button
            size="sm"
            onClick={handleMaskSelection}
            className="shadow-lg"
          >
            <EyeOff className="mr-2 h-4 w-4" />
            Mask "{selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText}"
          </Button>
        </div>
      )}

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
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        In the following, you can review the chats included in your history. Before submitting them to the researchers, please check whether there is any personal data that I identifies you (e.g., names) and mask them.
        You can double click on a word and select "Mask" to hide all occurances of that word.
        Please hide personal information such as names, phone numbers, email addresses (Hiding names of publicly known people, such as politicians, is not necessary) 
      </p>      

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
                    {(expandedChats.has(chat.id) ? chat.messages : chat.messages.slice(0, 3)).map((message, idx) => (
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
                        <p className="text-foreground line-clamp-2 select-text cursor-text">
                          {applyMasking(message.content)}
                        </p>
                      </div>
                    ))}
                    {chat.messages.length > 3 && (
                      <button
                        onClick={() => toggleExpanded(chat.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {expandedChats.has(chat.id) 
                          ? "Show less" 
                          : `+ ${chat.messages.length - 3} more messages`
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
    </>
  );
};
