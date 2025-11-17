import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Eye, EyeOff } from "lucide-react";

interface MaskingControlsProps {
  maskedWords: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
}

export const MaskingControls = ({ maskedWords, onAddWord, onRemoveWord }: MaskingControlsProps) => {
  const [newWord, setNewWord] = useState("");

  const handleAdd = () => {
    if (newWord.trim()) {
      onAddWord(newWord.trim());
      setNewWord("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <EyeOff className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Word Masking</h3>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Add words or phrases to mask in your conversations. They'll be replaced with █ characters.
      </p>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Enter word to mask..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleAdd} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {maskedWords.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {maskedWords.length} word{maskedWords.length !== 1 ? 's' : ''} masked
          </p>
          <div className="flex flex-wrap gap-2">
            {maskedWords.map((word) => (
              <Badge key={word} variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                {word}
                <button
                  onClick={() => onRemoveWord(word)}
                  className="ml-1 rounded-full hover:bg-background/50"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">No words masked yet</p>
        </div>
      )}
    </Card>
  );
};
