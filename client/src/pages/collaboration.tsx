import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Users, UserPlus, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  CollaborationWorkspace, 
  InsertCollaborationWorkspace,
  WorkspaceMember,
  InsertWorkspaceMember
} from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import CollaborationSpace from "@/components/collaboration/CollaborationSpace";

export default function Collaboration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isInvitingMember, setIsInvitingMember] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(null);

  // Fetch user's workspaces
  const { data: workspaces = [], isLoading } = useQuery<CollaborationWorkspace[]>({
    queryKey: [`/api/users/${user?.id}/workspaces`],
    enabled: !!user,
  });

  // Get active workspace
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Fetch workspace members when an active workspace is selected
  const { data: members = [] } = useQuery<WorkspaceMember[]>({
    queryKey: [`/api/workspaces/${activeWorkspaceId}/members`],
    enabled: !!activeWorkspaceId,
  });

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (workspaceData: InsertCollaborationWorkspace) => {
      const response = await apiRequest("POST", "/api/workspaces", workspaceData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/workspaces`] });
      setIsCreatingWorkspace(false);
      setActiveWorkspaceId(data.id);
      toast({
        title: "Workspace created",
        description: "Your collaboration workspace has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create workspace",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: InsertWorkspaceMember) => {
      const response = await apiRequest("POST", "/api/workspace-members", memberData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workspaces/${activeWorkspaceId}/members`] });
      setIsInvitingMember(false);
      toast({
        title: "Member added",
        description: "User has been added to the workspace",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add member",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Form schema for creating a workspace
  const workspaceFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
  });

  // Form for creating a workspace
  const workspaceForm = useForm<z.infer<typeof workspaceFormSchema>>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Form schema for inviting a member
  const inviteMemberSchema = z.object({
    username: z.string().min(1, "Username is required"),
  });

  // Form for inviting a member
  const inviteMemberForm = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      username: "",
    },
  });

  const handleCreateWorkspace = (values: z.infer<typeof workspaceFormSchema>) => {
    if (!user) return;
    
    createWorkspaceMutation.mutate({
      name: values.name,
      description: values.description || "",
      ownerId: user.id,
    });
  };

  const handleInviteMember = (values: z.infer<typeof inviteMemberSchema>) => {
    if (!user || !activeWorkspaceId) return;
    
    // In a real app, you would first check if the user exists
    // For this demo, we'll assume the user exists with ID 999
    addMemberMutation.mutate({
      workspaceId: activeWorkspaceId,
      userId: 999, // This would come from a user lookup in a real app
      role: "member",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Collaboration</h1>
        <Button onClick={() => setIsCreatingWorkspace(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-12 w-full animate-pulse bg-muted rounded"></div>
            <div className="mt-4 space-y-3">
              <div className="h-8 w-full animate-pulse bg-muted rounded"></div>
              <div className="h-8 w-full animate-pulse bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : workspaces.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
            <Users className="h-12 w-12 text-primary opacity-50" />
            <h3 className="text-xl font-medium">No Workspaces Yet</h3>
            <p className="text-muted-foreground">
              Create a collaboration workspace to start working with others on shared projects and tasks.
            </p>
            <Button onClick={() => setIsCreatingWorkspace(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Workspace list */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Your Workspaces</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${
                      workspace.id === activeWorkspaceId ? "bg-secondary" : ""
                    }`}
                    onClick={() => setActiveWorkspaceId(workspace.id)}
                  >
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {workspace.ownerId === user?.id ? "Owner" : "Member"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active workspace or placeholder */}
          {activeWorkspace ? (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{activeWorkspace.name}</CardTitle>
                  <CardDescription>{activeWorkspace.description}</CardDescription>
                </div>
                {activeWorkspace.ownerId === user?.id && (
                  <Button size="sm" variant="outline" onClick={() => setIsInvitingMember(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                )}
              </CardHeader>

              <Tabs defaultValue="space" className="w-full">
                <TabsList className="px-6">
                  <TabsTrigger value="space">Workspace</TabsTrigger>
                  <TabsTrigger value="members">
                    Members ({members.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="space" className="p-0 pt-4">
                  <CollaborationSpace 
                    workspaceId={activeWorkspace.id}
                    isOwner={activeWorkspace.ownerId === user?.id}
                  />
                </TabsContent>
                <TabsContent value="members" className="px-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Members</h3>
                    <div className="space-y-2">
                      {members.length > 0 ? (
                        members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-md bg-secondary/50 p-3"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                {member.userId.toString().substring(0, 2)}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium">User #{member.userId}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {member.role}
                                </div>
                              </div>
                            </div>
                            {activeWorkspace.ownerId === user?.id && member.userId !== user?.id && (
                              <Button size="sm" variant="ghost">
                                Remove
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No members in this workspace yet
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
                <Globe className="h-12 w-12 text-primary opacity-50" />
                <h3 className="text-xl font-medium">Select a Workspace</h3>
                <p className="text-muted-foreground">
                  Choose a workspace from the list to see its content and collaborate with others.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Workspace Dialog */}
      <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Create a new collaboration workspace to work with others on shared projects.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...workspaceForm}>
            <form onSubmit={workspaceForm.handleSubmit(handleCreateWorkspace)} className="space-y-4">
              <FormField
                control={workspaceForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Team Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={workspaceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What is this workspace for?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingWorkspace(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Workspace</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInvitingMember} onOpenChange={setIsInvitingMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Add a new member to the workspace by username.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...inviteMemberForm}>
            <form onSubmit={inviteMemberForm.handleSubmit(handleInviteMember)} className="space-y-4">
              <FormField
                control={inviteMemberForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInvitingMember(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Invite</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
