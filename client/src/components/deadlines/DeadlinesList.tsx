import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, 
  ArrowRight, 
  ArrowDown, 
  Clock, 
  Edit2, 
  Trash2,
  BookOpen,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeadlinesListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (task: Task) => void;
}

export default function DeadlinesList({ 
  tasks, 
  isLoading, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}: DeadlinesListProps) {
  
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
  const getStatusBadge = (task: Task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (task.completed) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    }
    
    if (dueDate < now) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    }
    
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / millisecondsPerDay);
    
    if (daysUntilDue <= 2) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Clock className="mr-1 h-3 w-3" />
          Due Soon
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        Upcoming
      </Badge>
    );
  };

  // Group tasks by completion status
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Sort pending tasks by due date and priority
  const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
    // First by due date
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    
    // Then by priority
    const priorityWeight = { high: 0, medium: 1, low: 2 };
    return priorityWeight[a.priority as keyof typeof priorityWeight] - 
           priorityWeight[b.priority as keyof typeof priorityWeight];
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 py-12">
          <BookOpen className="h-12 w-12 text-primary opacity-50" />
          <h3 className="text-xl font-medium">No Tasks</h3>
          <p className="text-muted-foreground">
            You don't have any tasks yet. Add a task to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">
          Pending Tasks ({sortedPendingTasks.length})
        </h3>
        
        {sortedPendingTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedPendingTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => onToggleComplete(task)}
                        className="mt-1"
                      />
                      
                      <div className="space-y-1">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {task.title}
                        </label>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </span>
                          
                          {task.category && (
                            <span>• {task.category}</span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            • Priority: 
                            <span className="flex items-center">
                              {getPriorityIcon(task.priority)}
                              <span className="capitalize">{task.priority}</span>
                            </span>
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm mt-2">{task.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-1">
                      {getStatusBadge(task)}
                      
                      <div className="flex gap-1 mt-1 sm:mt-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(task)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(task.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              No pending tasks. All caught up!
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">
            Completed Tasks ({completedTasks.length})
          </h3>
          
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <Card key={task.id} className="opacity-70">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => onToggleComplete(task)}
                        className="mt-1"
                      />
                      
                      <div className="space-y-1">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="font-medium cursor-pointer line-through"
                        >
                          {task.title}
                        </label>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          
                          {task.category && (
                            <span>• {task.category}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete(task.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
