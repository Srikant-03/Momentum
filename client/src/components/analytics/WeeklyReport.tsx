import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, FocusSession } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyReportProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  insights: string[] | null | undefined;
  isLoading: boolean;
}

export default function WeeklyReport({ tasks, focusSessions, insights, isLoading }: WeeklyReportProps) {
  // Default insights if none are provided or if insights is not an array
  const defaultInsights = [
    "Start tracking your tasks and study sessions to receive personalized insights.",
    "Set specific goals for each study session to improve focus and productivity.",
    "Consider breaking down your tasks into smaller steps to improve completion rate."
  ];
  
  // Make sure insights is an array or use defaults
  const safeInsights = Array.isArray(insights) ? insights : defaultInsights;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">AI Insights</h4>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ul className="space-y-2">
                  {safeInsights.map((insight, index) => (
                    <li key={index} className="bg-muted p-3 rounded-md text-sm">
                      {insight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}