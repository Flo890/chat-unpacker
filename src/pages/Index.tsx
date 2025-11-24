import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ChatViewer } from "@/components/ChatViewer";
import { MaskingControls } from "@/components/MaskingControls";
import { ExportControls } from "@/components/ExportControls";
import { Button } from "@/components/ui/button";
import { HelpForm } from "@/components/HelpForm";
import { FileText } from "lucide-react";
import JSZip from "jszip";

export interface ChatMessage {
  id: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  selected: boolean;
}

const Index = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [maskedWords, setMaskedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpVisible, setHelpvisible] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const chatFiles: ChatMessage[] = [];
      let fileIndex = 0;

      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (filename.endsWith('.json') && !zipEntry.dir) {
          const content = await zipEntry.async('string');
          try {
            const data = JSON.parse(content);
            
            // Handle ChatGPT export format
            if (Array.isArray(data)) {
              data.forEach((chat, index) => {
                chatFiles.push({
                  id: `${fileIndex}-${index}`,
                  title: chat.title || `Conversation ${fileIndex + 1}`,
                  messages: chat.mapping ? Object.values(chat.mapping)
                    .filter((node: any) => node.message?.content?.parts?.[0])
                    .map((node: any) => ({
                      role: node.message.author.role,
                      content: node.message.content.parts[0],
                      timestamp: node.message.create_time
                    })) : [],
                  selected: true
                });
              });
            } else if (data.title && data.mapping) {
              // Single conversation format
              chatFiles.push({
                id: `${fileIndex}`,
                title: data.title || `Conversation ${fileIndex + 1}`,
                messages: Object.values(data.mapping)
                  .filter((node: any) => node.message?.content?.parts?.[0])
                  .map((node: any) => ({
                    role: node.message.author.role,
                    content: node.message.content.parts[0],
                    timestamp: node.message.create_time
                  })),
                selected: true
              });
            }
            fileIndex++;
          } catch (error) {
            console.error(`Error parsing ${filename}:`, error);
          }
        }
      }

      setChats(chatFiles);
    } catch (error) {
      console.error('Error processing ZIP file:', error);

      const endpointUrl = "/submit"
      var url = new URL(window.location.href);
      var idOne = url.searchParams.get("id_one");
      
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_one: idOne,
          helpMessage: error,
          timestamp: new Date().toISOString(),
       //   total_conversations: exportData.length,
        //  total_messages: exportData.reduce((sum, chat) => sum + chat.messages.length, 0)
        }),
      });

      if (response.ok) {
        console.log("Help data submitted.");
      } else {
        console.error(`Server responded with ${response.status}`);
        
      }

    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = (id: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, selected: !chat.selected } : chat
    ));
  };

  const toggleAll = (selected: boolean) => {
    setChats(prev => prev.map(chat => ({ ...chat, selected })));
  };

  const addMaskedWord = (word: string) => {
    if (word && !maskedWords.includes(word.toLowerCase())) {
      setMaskedWords(prev => [...prev, word.toLowerCase()]);
    }
  };

  const removeMaskedWord = (word: string) => {
    setMaskedWords(prev => prev.filter(w => w !== word));
  };

  const applyMasking = (text: string): string => {
    let masked = text;
    maskedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      masked = masked.replace(regex, '█'.repeat(word.length));
    });
    return masked;
  };

  const reset = () => {
    setChats([]);
    setMaskedWords([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">ChatGPT Chat Submission</h1>
              <p className="text-sm text-muted-foreground">View, filter, and anonymize your chat history for the data donation</p>
            </div>
          </div>
          <div className="helpbox" onClick={()=>{setHelpvisible(!isHelpVisible)}}><p>Help</p></div>
        </div>
      </header>

      {isHelpVisible ? <HelpForm ></HelpForm> : <div></div>}
   
      <main className="container mx-auto px-4 py-8">
        {chats.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {chats.length} conversation{chats.length !== 1 ? 's' : ''} loaded
                </h2>
                <p className="text-sm text-muted-foreground">
                  {chats.filter(c => c.selected).length} selected
                </p>
              </div>
              <Button variant="outline" onClick={reset}>
                Load Different File
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChatViewer 
                  chats={chats} 
                  onToggleChat={toggleChat}
                  onToggleAll={toggleAll}
                  applyMasking={applyMasking}
                  onAddMaskedWord={addMaskedWord}
                />
              </div>
              
              
              <div className="space-y-6">
                <MaskingControls
                  maskedWords={maskedWords}
                  onAddWord={addMaskedWord}
                  onRemoveWord={removeMaskedWord}
                />
              
                <ExportControls 
                  chats={chats.filter(c => c.selected)}
                  applyMasking={applyMasking}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
