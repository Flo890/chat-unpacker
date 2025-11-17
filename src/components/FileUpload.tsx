import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileArchive } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div>
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">1. Go to ChatGPT to export your chat history</h3>
      <p className="mb-4 text-sm">
        Please go to your ChatGPT account, click on <i>Settings</i>, then <i>Data Controls</i>, and <i>Export Data</i>. Click on the <i>Export</i> button. 
              This link directly brings you there: <a href="https://chatgpt.com/#settings/DataControls" target="_blank"><u>https://chatgpt.com/#settings/DataControls</u></a>
              </p>   
              
      <h3 className="text-lg font-semibold text-foreground">2. Check your emails - download the file</h3>
      <p className="mb-4 text-sm">
        You will then receive an email. This isually happens immediately. You do not have to wait 24 hours. Click on the link in the email, to download your ChatGPT history file.
      </p>   
    <video src="expl_videos/chatgpt_instr_merged.mp4" width="50%" autoPlay muted loop></video>
      <br/>
      <h3 className="text-lg font-semibold text-foreground">3. Upload the downloaded ZIP file here</h3>
      <p className="mb-4 text-sm">
        Drag and drop or select the file that you have just downloaded from ChatGPT here:
      </p>  
   
      </Card>
    <Card className="mx-auto max-w-2xl">
      
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <>
              <FileArchive className="h-16 w-16 animate-pulse text-primary" />
              <div>
                <p className="text-lg font-semibold text-foreground">Processing ZIP file...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              
              <div>
                <p className="mb-1 text-lg font-semibold text-foreground">
                  {isDragActive ? 'Drop your ZIP file here' : 'Upload ChatGPT Export'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to select your ZIP file
                </p>
              </div>
              
              <div className="mt-2 rounded-lg bg-muted px-4 py-2">
                <p className="text-xs text-muted-foreground">
                  Supports ChatGPT personal data export ZIP files
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
};
