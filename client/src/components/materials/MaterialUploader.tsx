import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Image, FileText, Link as LinkIcon, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["pdf", "image", "link"]),
  url: z.string().optional(),
  fileContent: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaterialUploaderProps {
  userId: number;
  section: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MaterialUploader({ userId, section, onSuccess, onCancel }: MaterialUploaderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("link");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "link",
      url: "",
      fileContent: "",
      category: "",
      tags: [],
    },
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/materials", data);
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      toast({
        title: "Material added",
        description: "Your study material has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add material",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "pdf" | "image") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // Set preview for images
          if (fileType === "image") {
            setFilePreview(event.target.result.toString());
          } else {
            // Just show file name for PDFs
            setFilePreview(file.name);
          }
          
          // Update form with base64 data
          form.setValue("fileContent", event.target.result.toString());
          form.setValue("type", fileType);
          
          // Try to extract a title from filename if not set
          if (!form.getValues("title")) {
            const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            form.setValue("title", fileName);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!userId) return;
    
    try {
      setIsUploading(true);
      
      // Prepare material data
      const materialData = {
        userId,
        title: values.title,
        type: values.type,
        url: values.type === "link" ? values.url : undefined,
        fileContent: ["pdf", "image"].includes(values.type) ? values.fileContent : undefined,
        category: values.category || undefined,
        tags: values.tags || [],
        section,
      };
      
      createMaterialMutation.mutate(materialData);
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload material",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Study material title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Type</FormLabel>
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => {
                  setActiveTab(value);
                  field.onChange(value);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="link" className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="link" className="mt-4">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/study-resource" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="pdf" className="mt-4">
                  <div className="space-y-2">
                    <FormLabel>PDF File</FormLabel>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
                        {filePreview ? (
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                            <p className="mt-2 text-sm text-center">{filePreview}</p>
                            <p className="mt-1 text-xs text-center text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-center">Click to upload a PDF file</p>
                            <p className="mt-1 text-xs text-center text-muted-foreground">PDF (max. 10MB)</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, "pdf")} 
                        />
                      </label>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="mt-4">
                  <div className="space-y-2">
                    <FormLabel>Image</FormLabel>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
                        {filePreview && filePreview.startsWith('data:image') ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img 
                              src={filePreview} 
                              alt="Preview" 
                              className="max-h-full max-w-full object-contain"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100">
                              <p className="text-white text-sm">Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-center">Click to upload an image</p>
                            <p className="mt-1 text-xs text-center text-muted-foreground">PNG, JPG (max. 5MB)</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "image")} 
                        />
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select or enter a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Lecture Notes">Lecture Notes</SelectItem>
                  <SelectItem value="Assignments">Assignments</SelectItem>
                  <SelectItem value="Reading Material">Reading Material</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Tags (Optional)</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleAddTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Add Material"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
