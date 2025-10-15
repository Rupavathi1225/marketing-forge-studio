import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/ImageUploader";
import { ContentCard } from "@/components/ContentCard";
import { SavedProjects } from "@/components/SavedProjects";
import { Instagram, Mail, Globe, Linkedin, Save, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectPrompt, setProjectPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [instagramCaption, setInstagramCaption] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [landingHeadline, setLandingHeadline] = useState("");
  const [landingCta, setLandingCta] = useState("");
  const [linkedinPost, setLinkedinPost] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGenerateAll = async () => {
    if (!projectPrompt.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setGeneratingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt: projectPrompt, type: "all" },
      });

      if (error) throw error;

      if (data?.content) {
        const content = data.content;
        setInstagramCaption(content.instagram_caption || "");
        setEmailSubject(content.email_subject || "");
        setEmailBody(content.email_body || "");
        setLandingHeadline(content.landing_headline || "");
        setLandingCta(content.landing_cta || "");
        setLinkedinPost(content.linkedin_post || "");
        toast.success("All content generated successfully!");
      } else {
        throw new Error("No content returned");
      }
    } catch (error: any) {
      console.error("Error generating all content:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleSave = async () => {
    if (!projectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("marketing_projects").insert({
        title: projectTitle,
        image_url: imageUrl,
        instagram_caption: instagramCaption,
        email_subject: emailSubject,
        email_body: emailBody,
        landing_headline: landingHeadline,
        landing_cta: landingCta,
        linkedin_post: linkedinPost,
      });

      if (error) throw error;

      toast.success("Project saved successfully!");
      setRefreshTrigger((prev) => prev + 1);
      
      // Clear form
      setProjectTitle("");
      setProjectPrompt("");
      setImageUrl(null);
      setInstagramCaption("");
      setEmailSubject("");
      setEmailBody("");
      setLandingHeadline("");
      setLandingCta("");
      setLinkedinPost("");
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = (project: any) => {
    setProjectTitle(project.title);
    setImageUrl(project.image_url);
    setInstagramCaption(project.instagram_caption || "");
    setEmailSubject(project.email_subject || "");
    setEmailBody(project.email_body || "");
    setLandingHeadline(project.landing_headline || "");
    setLandingCta(project.landing_cta || "");
    setLinkedinPost(project.linkedin_post || "");
    toast.success("Project loaded");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marketing Asset Generator
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateAll}
                disabled={generatingAll || !projectPrompt.trim()}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate All
                  </>
                )}
              </Button>
              <Button onClick={handleSave} disabled={saving || !projectTitle.trim()}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Setup */}
        <Card className="p-6 mb-8 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Project Setup</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-title" className="text-sm font-medium mb-2 block">
                  Project Title *
                </Label>
                <Input
                  id="project-title"
                  placeholder="E.g., Fitness App Launch Campaign"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project-prompt" className="text-sm font-medium mb-2 block">
                  Describe Your Product/Service
                </Label>
                <Input
                  id="project-prompt"
                  placeholder="E.g., A mobile fitness app with personalized workout plans"
                  value={projectPrompt}
                  onChange={(e) => setProjectPrompt(e.target.value)}
                />
              </div>
            </div>
            <ImageUploader imageUrl={imageUrl} onImageChange={setImageUrl} />
          </div>
        </Card>

        {/* Content Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ContentCard
            title="Instagram Post"
            icon={<Instagram className="h-5 w-5 text-primary" />}
            type="instagram"
            projectPrompt={projectPrompt}
            fields={[
              {
                label: "Caption",
                value: instagramCaption,
                onChange: setInstagramCaption,
                multiline: true,
                rows: 6,
              },
            ]}
            onGenerate={(content) => setInstagramCaption(content)}
          />

          <ContentCard
            title="Email Creative"
            icon={<Mail className="h-5 w-5 text-secondary" />}
            type="email"
            projectPrompt={projectPrompt}
            fields={[
              {
                label: "Subject",
                value: emailSubject,
                onChange: setEmailSubject,
              },
              {
                label: "Body",
                value: emailBody,
                onChange: setEmailBody,
                multiline: true,
                rows: 5,
              },
            ]}
            onGenerate={(content) => {
              setEmailSubject(content.subject || "");
              setEmailBody(content.body || "");
            }}
          />

          <ContentCard
            title="Landing Page"
            icon={<Globe className="h-5 w-5 text-accent" />}
            type="landing"
            projectPrompt={projectPrompt}
            fields={[
              {
                label: "Headline",
                value: landingHeadline,
                onChange: setLandingHeadline,
              },
              {
                label: "CTA Button",
                value: landingCta,
                onChange: setLandingCta,
              },
            ]}
            onGenerate={(content) => {
              setLandingHeadline(content.headline || "");
              setLandingCta(content.cta || "");
            }}
          />

          <ContentCard
            title="LinkedIn Post"
            icon={<Linkedin className="h-5 w-5 text-secondary" />}
            type="linkedin"
            projectPrompt={projectPrompt}
            fields={[
              {
                label: "Post",
                value: linkedinPost,
                onChange: setLinkedinPost,
                multiline: true,
                rows: 6,
              },
            ]}
            onGenerate={(content) => setLinkedinPost(content)}
          />
        </div>

        <Separator className="my-8" />

        {/* Saved Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Saved Projects</h2>
          <SavedProjects onLoadProject={handleLoadProject} refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};

export default Index;