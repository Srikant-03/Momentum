import { useState } from "react";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2, 
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  UserCircle,
  Calendar,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { SharedTask } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import DeadlineForm from "@/components/deadlines/DeadlineForm";

interface GroupTaskListProps {
  pendingTasks: SharedTask[];
  inProgressTasks: SharedTask[];
  completedTasks: SharedTask[];
  onCreateTask: (task: any) => void;
  onUpdateTask: (id: number, data: any) => void;
  onDeleteTask: (id: number) => void;
  isOwner: boolean;
}

export default function GroupTaskList({
  pendingTasks,
  inProgressTasks,
  completedTasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  isOwner
}: GroupTaskListProps) {
  const { user } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<SharedTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Function to get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "medium":
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // No change in position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Find the task that was moved
    const taskId = parseInt(draggableId);
    let task: SharedTask | undefined;
    
    if (source.droppableId === "pending") {
      task = pendingTasks.find((t) => t.id === taskId);
    } else if (source.droppableId === "in-progress") {
      task = inProgressTasks.find((t) => t.id === taskId);
    } else if (source.droppableId === "completed") {
      task = completedTasks.find((t) => t.id === taskId);
    }
    
    if (!task) return;
    
    // Update the task status
    let newStatus: string;
    switch (destination.droppableId) {
      case "pending":
        newStatus = "pending";
        break;
      case "in-progress":
        newStatus = "in-progress";
        break;
      case "completed":
        newStatus = "completed";
        break;
      default:
        return;
    }
    
    // Call the update function to change the status
    onUpdateTask(taskId, { status: newStatus });
  };

  const handleCreateTask = (data: any) => {
    onCreateTask({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
    });
    setIsAddingTask(false);
  };

  const handleUpdateTask = (data: any) => {
    if (!editingTask) return;
    
    onUpdateTask(editingTask.id, {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
    });
    setEditingTask(null);
  };

  const canModifyTask = (task: SharedTask) => {
    return isOwner || task.createdBy === user?.id || task.assigneeId === user?.id;
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Drag tasks between columns to update their status
        </div>
        <Button size="sm" onClick={() => setIsAddingTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Pending Column */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
              Pending ({pendingTasks.length})
            </h3>
            <Droppable droppableId="pending">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px] bg-secondary/30 rounded-lg p-2"
                >
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2"
                          >
                            <Card className="bg-card">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <div className="font-medium">{task.title}</div>
                                    {canModifyTask(task) && (
                                      <div className="flex space-x-1">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6"
                                          onClick={() => setEditingTask(task)}
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 text-destructive"
                                          onClick={() => setConfirmDelete(task.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground">{task.description}</p>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      {task.assigneeId ? (
                                        <UserCircle className="h-3.5 w-3.5" />
                                      ) : null}
                                      <div className="flex items-center">
                                        {getPriorityIcon(task.priority)}
                                        <span className="ml-1 capitalize">{task.priority}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                      No pending tasks
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          {/* In Progress Column */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              In Progress ({inProgressTasks.length})
            </h3>
            <Droppable droppableId="in-progress">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px] bg-secondary/30 rounded-lg p-2"
                >
                  {inProgressTasks.length > 0 ? (
                    inProgressTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2"
                          >
                            <Card className="bg-card">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <div className="font-medium">{task.title}</div>
                                    {canModifyTask(task) && (
                                      <div className="flex space-x-1">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6"
                                          onClick={() => setEditingTask(task)}
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 text-destructive"
                                          onClick={() => setConfirmDelete(task.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground">{task.description}</p>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      {task.assigneeId ? (
                                        <UserCircle className="h-3.5 w-3.5" />
                                      ) : null}
                                      <div className="flex items-center">
                                        {getPriorityIcon(task.priority)}
                                        <span className="ml-1 capitalize">{task.priority}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                      No tasks in progress
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          
          {/* Completed Column */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Completed ({completedTasks.length})
            </h3>
            <Droppable droppableId="completed">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[200px] bg-secondary/30 rounded-lg p-2"
                >
                  {completedTasks.length > 0 ? (
                    completedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2"
                          >
                            <Card className="bg-card/70">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <div className="font-medium line-through text-muted-foreground">{task.title}</div>
                                    {canModifyTask(task) && (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => setConfirmDelete(task.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span>
                                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                      No completed tasks
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* Add Task Dialog */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <DeadlineForm
            onSubmit={handleCreateTask}
            onCancel={() => setIsAddingTask(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <DeadlineForm
              initialData={{
                id: editingTask.id,
                title: editingTask.title,
                description: editingTask.description || "",
                dueDate: editingTask.dueDate,
                priority: editingTask.priority,
                completed: editingTask.status === "completed",
                userId: 0, // Stub value, not used in updates
                section: "academic", // Stub value, not used in updates
                category: "",
                relatedMaterials: []
              }}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete !== null) {
                  onDeleteTask(confirmDelete);
                  setConfirmDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
