import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, FocusSession, Analytics } from '@shared/schema';

interface PerformanceGraphProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  analytics: Analytics[];
  isLoading: boolean;
}

export default function PerformanceGraph({ 
  tasks, 
  focusSessions, 
  analytics, 
  isLoading 
}: PerformanceGraphProps) {
  // This is just a placeholder component
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
            <p className="text-muted-foreground">Performance graph visualization will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}