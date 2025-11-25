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
      // Validate file is actually a ZIP
      if (!file.name.endsWith('.zip')) {
        throw new Error('Please upload a ZIP file');
      }

      console.log('Processing ZIP file:', file.name, 'Size:', file.size, 'bytes');
      
      const zip = new JSZip();
      const contents = await zip.loadAsync(file).catch(err => {
        console.error('ZIP load error:', err);
        throw new Error('Invalid or corrupted ZIP file. Please re-download your ChatGPT export and try again.');
      });
      
      const chatFiles: ChatMessage[] = [];
      let fileIndex = 0;

      console.log('ZIP loaded successfully. Found', Object.keys(contents.files).length, 'files');

      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (filename.endsWith('.json') && !zipEntry.dir) {
          console.log('Processing JSON file:', filename);
          const content = await zipEntry.async('string');
          try {
            const data = JSON.parse(content);
            
            // Helper function to extract content from various formats
            const extractContent = (node: any): string | null => {
              if (!node.message?.content) return null;
              
              const content = node.message.content;
              
              // Format 1: content.parts array (most common)
              if (content.parts && Array.isArray(content.parts) && content.parts.length > 0) {
                return typeof content.parts[0] === 'string' ? content.parts[0] : JSON.stringify(content.parts[0]);
              }
              
              // Format 2: content as direct string
              if (typeof content === 'string') {
                return content;
              }
              
              // Format 3: content.text
              if (content.text && typeof content.text === 'string') {
                return content.text;
              }
              
              // Format 4: content.content_type with text
              if (content.content_type === 'text' && content.text) {
                return content.text;
              }
              
              return null;
            };
            
            // Helper function to process messages from mapping
            const processMapping = (mapping: any): Array<{role: string; content: string; timestamp?: string}> => {
              if (!mapping || typeof mapping !== 'object') return [];
              
              const messages: Array<{role: string; content: string; timestamp?: string}> = [];
              
              Object.values(mapping).forEach((node: any) => {
                const content = extractContent(node);
                if (content && node.message?.author?.role) {
                  messages.push({
                    role: node.message.author.role,
                    content: content,
                    timestamp: node.message.create_time
                  });
                }
              });
              
              return messages;
            };
            
            // Handle ChatGPT export format
            if (Array.isArray(data)) {
              // Array of conversations
              data.forEach((chat, index) => {
                const messages = chat.mapping ? processMapping(chat.mapping) : [];
                if (messages.length > 0) {
                  chatFiles.push({
                    id: `${fileIndex}-${index}`,
                    title: chat.title || `Conversation ${fileIndex + 1}-${index + 1}`,
                    messages: messages,
                    selected: true
                  });
                }
              });
            } else if (data.title && data.mapping) {
              // Single conversation format
              const messages = processMapping(data.mapping);
              if (messages.length > 0) {
                chatFiles.push({
                  id: `${fileIndex}`,
                  title: data.title || `Conversation ${fileIndex + 1}`,
                  messages: messages,
                  selected: true
                });
              }
            } else if (data.messages && Array.isArray(data.messages)) {
              // Alternative format: direct messages array
              const messages = data.messages
                .filter((msg: any) => msg.role && msg.content)
                .map((msg: any) => ({
                  role: msg.role,
                  content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                  timestamp: msg.timestamp || msg.create_time
                }));
              
              if (messages.length > 0) {
                chatFiles.push({
                  id: `${fileIndex}`,
                  title: data.title || `Conversation ${fileIndex + 1}`,
                  messages: messages,
                  selected: true
                });
              }
            }
            
            fileIndex++;
          } catch (error) {
            console.error(`Error parsing ${filename}:`, error);
            console.error('File content preview:', content.substring(0, 200));
          }
        }
      }

      console.log('Successfully processed', chatFiles.length, 'conversations');
      
      if (chatFiles.length === 0) {
        throw new Error('No ChatGPT conversations found in ZIP file. Please make sure you exported your data correctly from ChatGPT.');
      }

      setChats(chatFiles);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error processing ZIP file:', errorMessage, error);
      
      // Show error to user
      alert(`Upload failed: ${errorMessage}\n\nPlease check the console for more details or contact support if the issue persists.`);

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
          helpMessage: errorMessage,
          errorDetails: error instanceof Error ? error.stack : String(error),
          fileName: file.name,
          fileSize: file.size,
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
                  allChatLength={chats.length}
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
