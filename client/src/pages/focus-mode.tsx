import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Task, InsertFocusSession } from "@shared/schema";
import PomodoroTimer from "@/components/focus/PomodoroTimer";
import { Clock, BellOff, Check, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enableNotifications, requestNotificationPermission } from "@/lib/notificationUtils";

export default function FocusMode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [distractionBlockingEnabled, setDistractionBlockingEnabled] = useState(false);
  const [pomodoroSettings, setPomodoroSettings] = useState({
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
  });

  // Fetch incomplete tasks for selection
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: [`/api/users/${user?.id}/tasks`],
    enabled: !!user,
  });

  // Filter for incomplete tasks only
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Create focus session mutation
  const createFocusSessionMutation = useMutation({
    mutationFn: async (sessionData: InsertFocusSession) => {
      const response = await apiRequest("POST", "/api/focus-sessions", sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/focus-sessions`] });
      toast({
        title: "Session recorded",
        description: "Your focus session has been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to record session",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update focus session mutation
  const updateFocusSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertFocusSession> }) => {
      const response = await apiRequest("PATCH", `/api/focus-sessions/${id}`, data);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Failed to update session",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleStartSession = () => {
    if (!user) return;
    
    // Create new focus session
    createFocusSessionMutation.mutate({
      userId: user.id,
      taskId: selectedTaskId,
      technique: "pomodoro",
      duration: 0, // Initially 0, will be updated when session ends
      completed: false,
      notes: ""
    });

    // Request notification permission if enabled
    if (notificationsEnabled) {
      requestNotificationPermission();
    }

    // Show toast
    toast({
      title: "Focus session started",
      description: "Stay focused. You can do this!",
    });
  };

  const handleEndSession = (sessionId: number, durationMinutes: number, completed: boolean) => {
    // Update existing session with duration and completion status
    updateFocusSessionMutation.mutate({
      id: sessionId,
      data: {
        duration: durationMinutes,
        completed,
        endTime: new Date()
      }
    });

    // Show toast
    toast({
      title: completed ? "Session completed" : "Session interrupted",
      description: `You focused for ${durationMinutes} minutes`,
    });
  };

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    if (newState) {
      const enabled = await enableNotifications();
      if (!enabled) {
        setNotificationsEnabled(false);
        toast({
          title: "Notification permission denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Focus Mode</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Main focus area */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Pomodoro Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PomodoroTimer
              settings={pomodoroSettings}
              onStart={handleStartSession}
              onEnd={handleEndSession}
              notificationsEnabled={notificationsEnabled}
              taskName={
                selectedTaskId
                  ? tasks.find(t => t.id === selectedTaskId)?.title || ""
                  : "Focus Session"
              }
            />
          </CardContent>
        </Card>

        {/* Settings panel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Task selection */}
            <div className="space-y-2">
              <Label htmlFor="task-select">Working on</Label>
              <Select 
                value={selectedTaskId?.toString() || ""} 
                onValueChange={(value) => setSelectedTaskId(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="task-select">
                  <SelectValue placeholder="Select a task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific task</SelectItem>
                  {incompleteTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timer settings */}
            <div className="space-y-2">
              <Label>Timer Settings (minutes)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="focus-time" className="text-xs">Focus Time</Label>
                  <Select 
                    value={pomodoroSettings.focusTime.toString()} 
                    onValueChange={(value) => 
                      setPomodoroSettings({...pomodoroSettings, focusTime: parseInt(value)})
                    }
                  >
                    <SelectTrigger id="focus-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
                        <SelectItem key={time} value={time.toString()}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="break-time" className="text-xs">Break Time</Label>
                  <Select 
                    value={pomodoroSettings.breakTime.toString()} 
                    onValueChange={(value) => 
                      setPomodoroSettings({...pomodoroSettings, breakTime: parseInt(value)})
                    }
                  >
                    <SelectTrigger id="break-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20].map((time) => (
                        <SelectItem key={time} value={time.toString()}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="notifications" className="cursor-pointer">Enable notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            </div>

            {/* Distraction blocking toggle */}
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="distraction-blocking" className="cursor-pointer">Block distractions</Label>
              </div>
              <Switch
                id="distraction-blocking"
                checked={distractionBlockingEnabled}
                onCheckedChange={setDistractionBlockingEnabled}
              />
            </div>

            {/* Info text */}
            <p className="text-xs text-muted-foreground mt-4">
              Focus Mode minimizes distractions to help you concentrate. 
              Complete your pomodoro sessions to track your productivity and improve your work habits.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Focus history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="mr-2 h-5 w-5 text-primary" />
            Recent Focus Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your focus session history will appear here once you complete sessions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
