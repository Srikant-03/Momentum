import { useState } from "react";
import { ScheduleEntry, Timetable } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, Save, X } from "lucide-react";

// Days of the week
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Simple color selection for schedule entries
const COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Yellow", value: "#eab308" },
  { name: "Pink", value: "#ec4899" },
];

interface TimetableEditorProps {
  timetable?: Timetable;
  entries?: ScheduleEntry[];
  isNew?: boolean;
  onSave?: (name: string) => void;
  onCancel?: () => void;
}

export default function TimetableEditor({ 
  timetable, 
  entries = [], 
  isNew = false,
  onSave,
  onCancel
}: TimetableEditorProps) {
  const { user } = useAuth();
  const { activeSection } = useTheme();
  const { toast } = useToast();
  
  const [timetableName, setTimetableName] = useState(timetable?.name || "");
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
  
  // New entry form state
  const [entryForm, setEntryForm] = useState({
    title: "",
    day: DAYS[0],
    startTime: "09:00",
    endTime: "10:30",
    location: "",
    color: COLORS[0].value,
    recurring: true,
    notifyBefore: 15
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const response = await apiRequest("POST", "/api/entries", entryData);
      return response.json();
    },
    onSuccess: () => {
      if (timetable) {
        queryClient.invalidateQueries({ queryKey: [`/api/timetables/${timetable.id}/entries`] });
      }
      setIsAddingEntry(false);
      resetEntryForm();
      toast({
        title: "Schedule entry added",
        description: "Your timetable has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add entry",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PATCH", `/api/entries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      if (timetable) {
        queryClient.invalidateQueries({ queryKey: [`/api/timetables/${timetable.id}/entries`] });
      }
      setEditingEntry(null);
      toast({
        title: "Entry updated",
        description: "Schedule entry has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update entry",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/entries/${id}`, undefined);
    },
    onSuccess: () => {
      if (timetable) {
        queryClient.invalidateQueries({ queryKey: [`/api/timetables/${timetable.id}/entries`] });
      }
      toast({
        title: "Entry deleted",
        description: "Schedule entry has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete entry",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Filter entries by selected day
  const entriesForSelectedDay = entries.filter(entry => entry.day === selectedDay);

  const handleCreateEntry = () => {
    if (!timetable || !user) return;
    
    createEntryMutation.mutate({
      timetableId: timetable.id,
      title: entryForm.title,
      day: entryForm.day,
      startTime: entryForm.startTime,
      endTime: entryForm.endTime,
      location: entryForm.location,
      color: entryForm.color,
      recurring: entryForm.recurring,
      notifyBefore: parseInt(entryForm.notifyBefore.toString())
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;
    
    updateEntryMutation.mutate({
      id: editingEntry.id,
      data: {
        title: entryForm.title,
        day: entryForm.day,
        startTime: entryForm.startTime,
        endTime: entryForm.endTime,
        location: entryForm.location,
        color: entryForm.color,
        recurring: entryForm.recurring,
        notifyBefore: parseInt(entryForm.notifyBefore.toString())
      }
    });
  };

  const handleDeleteEntry = (id: number) => {
    deleteEntryMutation.mutate(id);
  };

  const startEditingEntry = (entry: ScheduleEntry) => {
    setEntryForm({
      title: entry.title,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      location: entry.location || "",
      color: entry.color || COLORS[0].value,
      recurring: entry.recurring,
      notifyBefore: entry.notifyBefore
    });
    setEditingEntry(entry);
  };

  const resetEntryForm = () => {
    setEntryForm({
      title: "",
      day: DAYS[0],
      startTime: "09:00",
      endTime: "10:30",
      location: "",
      color: COLORS[0].value,
      recurring: true,
      notifyBefore: 15
    });
  };

  const handleSaveTimetable = () => {
    if (onSave) {
      onSave(timetableName);
    }
  };

  // If it's a new timetable creation form
  if (isNew) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timetable-name">Timetable Name</Label>
              <Input
                id="timetable-name"
                value={timetableName}
                onChange={(e) => setTimetableName(e.target.value)}
                placeholder="e.g., Fall Semester 2023"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Section</Label>
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {activeSection === "academic" ? "Academic" : "Professional"}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveTimetable} disabled={!timetableName.trim()}>
                Create Timetable
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{timetable?.name}</h2>
        <Button onClick={() => setIsAddingEntry(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <Tabs defaultValue={DAYS[0]} value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="w-full overflow-x-auto flex-wrap">
          {DAYS.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day.substring(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedDay} className="pt-4">
          {entriesForSelectedDay.length > 0 ? (
            <div className="space-y-4">
              {entriesForSelectedDay.map((entry) => (
                <Card key={entry.id} className={`border-l-4`} style={{ borderLeftColor: entry.color || COLORS[0].value }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{entry.title}</h3>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {entry.startTime} - {entry.endTime}
                          </div>
                          {entry.location && (
                            <div>
                              Location: {entry.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => startEditingEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-48">
              <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsAddingEntry(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Entry Dialog */}
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Class to Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-title">Class Title</Label>
              <Input
                id="class-title"
                value={entryForm.title}
                onChange={(e) => setEntryForm({...entryForm, title: e.target.value})}
                placeholder="e.g., Mathematics 101"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select 
                  value={entryForm.day} 
                  onValueChange={(value) => setEntryForm({...entryForm, day: value})}
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select 
                  value={entryForm.color} 
                  onValueChange={(value) => setEntryForm({...entryForm, color: value})}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 mr-2 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          ></div>
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={entryForm.startTime}
                  onChange={(e) => setEntryForm({...entryForm, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={entryForm.endTime}
                  onChange={(e) => setEntryForm({...entryForm, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={entryForm.location}
                onChange={(e) => setEntryForm({...entryForm, location: e.target.value})}
                placeholder="e.g., Room 101"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="recurring" className="cursor-pointer">
                  Recurring weekly
                </Label>
                <Switch
                  id="recurring"
                  checked={entryForm.recurring}
                  onCheckedChange={(checked) => 
                    setEntryForm({...entryForm, recurring: checked})
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notify-before">Notification (minutes before)</Label>
                <Select 
                  value={entryForm.notifyBefore.toString()} 
                  onValueChange={(value) => 
                    setEntryForm({...entryForm, notifyBefore: parseInt(value)})
                  }
                >
                  <SelectTrigger id="notify-before">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingEntry(false);
                  resetEntryForm();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!entryForm.title}
              >
                <Save className="mr-2 h-4 w-4" />
                Add to Timetable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-class-title">Class Title</Label>
              <Input
                id="edit-class-title"
                value={entryForm.title}
                onChange={(e) => setEntryForm({...entryForm, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-day">Day</Label>
                <Select 
                  value={entryForm.day} 
                  onValueChange={(value) => setEntryForm({...entryForm, day: value})}
                >
                  <SelectTrigger id="edit-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select 
                  value={entryForm.color} 
                  onValueChange={(value) => setEntryForm({...entryForm, color: value})}
                >
                  <SelectTrigger id="edit-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 mr-2 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          ></div>
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-time">Start Time</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={entryForm.startTime}
                  onChange={(e) => setEntryForm({...entryForm, startTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-end-time">End Time</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={entryForm.endTime}
                  onChange={(e) => setEntryForm({...entryForm, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location (Optional)</Label>
              <Input
                id="edit-location"
                value={entryForm.location}
                onChange={(e) => setEntryForm({...entryForm, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="edit-recurring" className="cursor-pointer">
                  Recurring weekly
                </Label>
                <Switch
                  id="edit-recurring"
                  checked={entryForm.recurring}
                  onCheckedChange={(checked) => 
                    setEntryForm({...entryForm, recurring: checked})
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notify-before">Notification (minutes before)</Label>
                <Select 
                  value={entryForm.notifyBefore.toString()} 
                  onValueChange={(value) => 
                    setEntryForm({...entryForm, notifyBefore: parseInt(value)})
                  }
                >
                  <SelectTrigger id="edit-notify-before">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingEntry(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingEntry) {
                    handleDeleteEntry(editingEntry.id);
                    setEditingEntry(null);
                  }
                }}
              >
                Delete
              </Button>
              <Button
                onClick={handleUpdateEntry}
                disabled={!entryForm.title}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
