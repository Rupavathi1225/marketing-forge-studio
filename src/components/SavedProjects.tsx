import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

interface SavedProjectsProps {
  onLoadProject: (project: any) => void;
  refreshTrigger: number;
}

export const SavedProjects = ({ onLoadProject, refreshTrigger }: SavedProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("marketing_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("marketing_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No saved projects yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="p-4 cursor-pointer hover:shadow-card-hover transition-all duration-300 group"
        >
          <div onClick={() => onLoadProject(project)}>
            {project.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h4 className="font-semibold truncate mb-1">{project.title}</h4>
            <p className="text-xs text-muted-foreground">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project.id);
            }}
            className="w-full mt-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </Card>
      ))}
    </div>
  );
};