import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContentCardProps {
  title: string;
  icon: React.ReactNode;
  type: "instagram" | "email" | "landing" | "linkedin";
  fields: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
    rows?: number;
  }[];
  projectPrompt: string;
  onGenerate?: (content: any) => void;
}

export const ContentCard = ({ title, icon, type, fields, projectPrompt, onGenerate }: ContentCardProps) => {
  const [generating, setGenerating] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleGenerate = async () => {
    if (!projectPrompt.trim()) {
      toast.error("Please enter a project description first");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt: projectPrompt, type },
      });

      if (error) throw error;

      if (data?.content) {
        if (onGenerate) {
          onGenerate(data.content);
        }
        toast.success(`${title} generated successfully!`);
      } else {
        throw new Error("No content returned");
      }
    } catch (error: any) {
      console.error(`Error generating ${type}:`, error);
      toast.error(error.message || `Failed to generate ${title}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{field.label}</Label>
              {field.value && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(field.value, field.label)}
                  className="h-7 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
            {field.multiline ? (
              <Textarea
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                rows={field.rows || 4}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                className="resize-none"
              />
            ) : (
              <Input
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};