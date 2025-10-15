import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (url: string) => void;
}

export const ImageUploader = ({ imageUrl, onImageChange }: ImageUploaderProps) => {
  const [generating, setGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageChange(dataUrl);
      toast.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image description");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: imagePrompt },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        onImageChange(data.imageUrl);
        toast.success("Image generated successfully!");
        setImagePrompt("");
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload" className="text-sm font-medium mb-2 block">
          Upload Image
        </Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or generate with AI</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-prompt" className="text-sm font-medium">
          Describe the image
        </Label>
        <Textarea
          id="image-prompt"
          placeholder="E.g., Modern fitness app on smartphone with workout metrics"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          rows={3}
        />
        <Button
          onClick={handleGenerateImage}
          disabled={generating || !imagePrompt.trim()}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden border">
          <img src={imageUrl} alt="Uploaded or generated" className="w-full h-48 object-cover" />
        </div>
      )}
    </div>
  );
};