import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import GroupTaskList from "./GroupTaskList";
import { 
  MessageSquare, 
  Clock, 
  Plus, 
  Calendar,
  Send
} from "lucide-react";

interface CollaborationSpaceProps {
  workspaceId: number;
  isOwner: boolean;
}

interface Message {
  id: string;
  userId: number;
  username: string;
  text: string;
  timestamp: Date;
}

export default function CollaborationSpace({ workspaceId, isOwner }: CollaborationSpaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch shared tasks
  const { data: sharedTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/workspaces/${workspaceId}/tasks`],
    enabled: !!workspaceId,
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!workspaceId || !user) return;

    // Get WebSocket protocol (wss for HTTPS, ws for HTTP)
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsUrl = `${protocol}://${host}/api/ws?workspace=${workspaceId}&userId=${user.id}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            userId: data.userId,
            username: data.username,
            text: data.text,
            timestamp: new Date(data.timestamp)
          }]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to collaboration server",
        variant: "destructive",
      });
    };
    
    websocket.onclose = () => {
      console.log('WebSocket closed');
    };
    
    // Clean up on unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [workspaceId, user, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create shared task mutation
  const createSharedTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/shared-tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/tasks`] });
      toast({
        title: "Task created",
        description: "Shared task has been added",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update shared task mutation
  const updateSharedTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PATCH", `/api/shared-tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/tasks`] });
      toast({
        title: "Task updated",
        description: "Shared task has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete shared task mutation
  const deleteSharedTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shared-tasks/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${workspaceId}/tasks`] });
      toast({
        title: "Task deleted",
        description: "Shared task has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !ws || !user) return;
    
    try {
      ws.send(JSON.stringify({
        type: 'message',
        workspaceId,
        userId: user.id,
        username: user.username,
        text: message.trim(),
        timestamp: new Date()
      }));
      
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = (taskData: any) => {
    if (!user) return;
    
    createSharedTaskMutation.mutate({
      workspaceId,
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: 'pending',
      createdBy: user.id
    });
  };

  const handleUpdateTask = (id: number, data: any) => {
    updateSharedTaskMutation.mutate({ id, data });
  };

  const handleDeleteTask = (id: number) => {
    deleteSharedTaskMutation.mutate(id);
  };

  // Filter tasks by status
  const pendingTasks = sharedTasks.filter(task => task.status === 'pending');
  const inProgressTasks = sharedTasks.filter(task => task.status === 'in-progress');
  const completedTasks = sharedTasks.filter(task => task.status === 'completed');

  return (
    <Tabs defaultValue="chat" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat" className="flex items-center">
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          Shared Tasks
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="pt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col h-[50vh]">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${msg.userId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                            <div className={`px-3 py-2 rounded-lg ${
                              msg.userId === user?.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary'
                            }`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-muted-foreground">
                              <span>{msg.username}</span>
                              <Clock className="h-3 w-3 mx-1" />
                              <span>{format(new Date(msg.timestamp), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="mt-4 flex">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="ml-2" 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !ws}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="tasks" className="pt-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Shared Tasks</CardTitle>
            <Button size="sm" onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingTasks ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <GroupTaskList
                pendingTasks={pendingTasks}
                inProgressTasks={inProgressTasks}
                completedTasks={completedTasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                isOwner={isOwner}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
