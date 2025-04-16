import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Image, FileText, Link as LinkIcon } from "lucide-react";
import MaterialsList from "@/components/materials/MaterialsList";
import MaterialUploader from "@/components/materials/MaterialUploader";
import { StudyMaterial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StudyMaterials() {
  const { user } = useAuth();
  const { activeSection } = useTheme();
  const { toast } = useToast();
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch study materials
  const { data: materials = [], isLoading } = useQuery<StudyMaterial[]>({
    queryKey: [`/api/users/${user?.id}/materials?section=${activeSection}`],
    enabled: !!user,
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/materials/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/materials`] });
      toast({
        title: "Material deleted",
        description: "Study material has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete material",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Filter materials based on search term and active tab
  const filteredMaterials = materials.filter((material) => {
    // Filter by search term
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.category && material.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tab/type
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "pdf" && material.type === "pdf") ||
      (activeTab === "image" && material.type === "image") ||
      (activeTab === "link" && material.type === "link");
    
    return matchesSearch && matchesTab;
  });

  const handleDeleteMaterial = (id: number) => {
    deleteMaterialMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
        <Button onClick={() => setIsAddingMaterial(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search materials..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              PDFs
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center">
              <Image className="mr-1 h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center">
              <LinkIcon className="mr-1 h-4 w-4" />
              Links
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Materials list */}
      <MaterialsList
        materials={filteredMaterials}
        isLoading={isLoading}
        onDelete={handleDeleteMaterial}
      />

      {/* Add Material Dialog */}
      <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Study Material</DialogTitle>
          </DialogHeader>
          <MaterialUploader 
            userId={user?.id || 0}
            section={activeSection}
            onSuccess={() => {
              setIsAddingMaterial(false);
              queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/materials`] });
              toast({
                title: "Material added",
                description: "Your study material has been added successfully",
              });
            }}
            onCancel={() => setIsAddingMaterial(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
