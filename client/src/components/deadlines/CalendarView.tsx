import { useState } from "react";
import { Task } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowUp, 
  ArrowRight, 
  ArrowDown, 
  Calendar as CalendarIcon,
  Info 
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarViewProps {
  tasks: Task[];
  isLoading: boolean;
  onSelectTask: (task: Task) => void;
}

export default function CalendarView({ tasks, isLoading, onSelectTask }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Group tasks by date for easier calendar rendering
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = new Date(task.dueDate).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  // Get tasks for the selected date
  const selectedDateTasks = selectedDate
    ? tasksByDate[selectedDate.toDateString()] || []
    : [];

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

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateKey = day.toDateString();
    const dayTasks = tasksByDate[dateKey] || [];
    
    if (dayTasks.length === 0) return null;
    
    // Get counts by priority
    const highCount = dayTasks.filter(t => t.priority === "high").length;
    const mediumCount = dayTasks.filter(t => t.priority === "medium").length;
    const lowCount = dayTasks.filter(t => t.priority === "low").length;
    
    // Count completed tasks
    const completedCount = dayTasks.filter(t => t.completed).length;
    
    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex justify-center space-x-1 mt-1">
          {highCount > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
          )}
          {mediumCount > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
          )}
          {lowCount > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          )}
        </div>
        {dayTasks.length > 1 && (
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {dayTasks.length - completedCount} active
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              DayContent: (props) => (
                <>
                  <div>{props.day?.day}</div>
                  {props.day?.date ? renderDay(props.day.date) : null}
                </>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {selectedDate ? selectedDate.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : "Select a date"}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Tasks are color-coded by priority:<br />
                    Red: High, Yellow: Medium, Green: Low
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <ScrollArea className="h-[400px]">
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start p-3 rounded-lg cursor-pointer border ${
                      task.completed 
                        ? "bg-secondary/50 border-secondary" 
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                    onClick={() => onSelectTask(task)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={task.completed}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()} // Prevent opening the edit dialog
                        />
                        <div>
                          <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.category && (
                            <Badge variant="outline" className="mt-2">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                        <span className="capitalize">{task.priority}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  No tasks scheduled for this date
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
