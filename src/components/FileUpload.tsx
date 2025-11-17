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
  );
};
