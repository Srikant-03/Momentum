import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import OCRUploader from "@/components/timetable/OCRUploader";
import TimetableView from "@/components/timetable/TimetableView";
import TimetableEditor from "@/components/timetable/TimetableEditor";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Calendar, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Timetable() {
  const { user } = useAuth();
  const { activeSection } = useTheme();
  const { toast } = useToast();
  const [showOCRUploader, setShowOCRUploader] = useState(false);
  const [showNewTimetableForm, setShowNewTimetableForm] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  // Fetch user's timetables
  const { data: timetables = [], isLoading: isLoadingTimetables } = useQuery({
    queryKey: [`/api/users/${user?.id}/timetables`],
    enabled: !!user,
  });

  // Get active timetable for the current section
  const activeTimetable = timetables.find(
    t => t.isActive && t.section === activeSection
  );

  // Fetch schedule entries if there's an active timetable
  const { data: scheduleEntries = [], isLoading: isLoadingEntries } = useQuery({
    queryKey: [`/api/timetables/${activeTimetable?.id}/entries`],
    enabled: !!activeTimetable,
  });

  // Mutation for creating a new timetable
  const createTimetableMutation = useMutation({
    mutationFn: async (timetableData: { name: string, userId: number, section: string }) => {
      const response = await apiRequest("POST", "/api/timetables", timetableData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/timetables`] });
      setShowNewTimetableForm(false);
      toast({
        title: "Timetable created",
        description: "Your new timetable has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create timetable",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCreateTimetable = (name: string) => {
    if (!user) return;
    
    createTimetableMutation.mutate({
      name,
      userId: user.id,
      section: activeSection
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Timetable</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOCRUploader(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            OCR Scan
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setShowEditor(false);
              setShowNewTimetableForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Timetable
          </Button>
        </div>
      </div>

      {/* Main content */}
      {isLoadingTimetables ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : activeTimetable ? (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">
              <Calendar className="h-4 w-4 mr-2" />
              View Timetable
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit Entries
            </TabsTrigger>
          </TabsList>
          <TabsContent value="view">
            <Card>
              <CardContent className="p-6">
                <TimetableView
                  timetable={activeTimetable}
                  entries={scheduleEntries}
                  isLoading={isLoadingEntries}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="edit">
            <Card>
              <CardContent className="p-6">
                <TimetableEditor
                  timetable={activeTimetable}
                  entries={scheduleEntries}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
            <Calendar className="h-12 w-12 text-primary opacity-50" />
            <h3 className="text-xl font-medium">No Timetables Found</h3>
            <p className="text-muted-foreground">
              Create a new timetable or upload one via OCR scan to get started.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowOCRUploader(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                OCR Scan
              </Button>
              <Button
                variant="default"
                onClick={() => setShowNewTimetableForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Timetable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Uploader Dialog */}
      <OCRUploader
        open={showOCRUploader}
        onClose={() => setShowOCRUploader(false)}
        onScan={(result) => {
          // Handle OCR result
          console.log("OCR scan results:", result);
          setShowOCRUploader(false);
        }}
      />

      {/* Create New Timetable */}
      {showNewTimetableForm && (
        <TimetableEditor
          isNew={true}
          onSave={handleCreateTimetable}
          onCancel={() => setShowNewTimetableForm(false)}
        />
      )}
    </div>
  );
}
