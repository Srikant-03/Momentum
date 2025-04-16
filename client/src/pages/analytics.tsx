import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, PieChart, BarChart2, ArrowRight, BarChart, Activity } from "lucide-react";
import WeeklyReport from "@/components/analytics/WeeklyReport";
import PerformanceGraph from "@/components/analytics/PerformanceGraph";
import { Analytics, Task, FocusSession } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { generateInsights } from "@/lib/aiUtils";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const activeSection = "academic"; // Default section

  // Fetch analytics data
  const { data: analytics = [], isLoading: isLoadingAnalytics } = useQuery<Analytics[]>({
    queryKey: [`/api/users/${user?.id}/analytics`],
    enabled: !!user,
  });

  // Fetch tasks for analytics context
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: [`/api/users/${user?.id}/tasks?section=${activeSection}`],
    enabled: !!user,
  });

  // Fetch focus sessions
  const { data: focusSessions = [], isLoading: isLoadingFocusSessions } = useQuery<FocusSession[]>({
    queryKey: [`/api/users/${user?.id}/focus-sessions`],
    enabled: !!user,
  });

  // Process data for analytics
  const tasksCompleted = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  
  // Calculate total study minutes from focus sessions
  const totalStudyMinutes = focusSessions.reduce((total, session) => {
    if (session.completed && session.duration) {
      return total + session.duration;
    }
    return total;
  }, 0);
  
  // Calculate hours and minutes
  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMinutesRemainder = totalStudyMinutes % 60;

  // Get insights using AI
  const insights = generateInsights(tasks, focusSessions, analytics);

  // Loading state
  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingFocusSessions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          This Week
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Task completion card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">{tasksCompleted}/{totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {completionRate.toFixed(0)}% completion rate
                </p>
                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Study time card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {studyHours}h {studyMinutesRemainder}m
                </div>
                <p className="text-xs text-muted-foreground">
                  {focusSessions.filter(s => s.completed).length} completed sessions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Productivity score card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {analytics.length > 0 
                    ? analytics[0].productivityScore?.toFixed(0) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on task completion and focus time
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main analytics content */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="weekly">
            <BarChart className="mr-2 h-4 w-4" />
            Weekly Report
          </TabsTrigger>
          <TabsTrigger value="performance">
            <PieChart className="mr-2 h-4 w-4" />
            Performance Trends
          </TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="mt-4">
          <WeeklyReport 
            tasks={tasks}
            focusSessions={focusSessions}
            insights={insights}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PerformanceGraph 
            analytics={analytics}
            tasks={tasks}
            focusSessions={focusSessions}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Clock(props: any) {
  return <Activity {...props} />;
}
