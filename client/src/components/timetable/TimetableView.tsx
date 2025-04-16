import { useState, useEffect } from "react";
import { Timetable, ScheduleEntry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimetableViewProps {
  timetable: Timetable;
  entries: ScheduleEntry[];
  isLoading?: boolean;
}

export default function TimetableView({ timetable, entries, isLoading }: TimetableViewProps) {
  const [currentDay, setCurrentDay] = useState<string>('');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get current day on component mount
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setCurrentDay(today);
  }, []);

  // Group schedule entries by day
  const entriesByDay = daysOfWeek.reduce<Record<string, ScheduleEntry[]>>((acc, day) => {
    acc[day] = entries.filter(entry => entry.day === day)
      .sort((a, b) => {
        // Sort by start time
        const aTime = a.startTime.split(':').map(Number);
        const bTime = b.startTime.split(':').map(Number);
        
        const aMinutes = aTime[0] * 60 + aTime[1];
        const bMinutes = bTime[0] * 60 + bTime[1];
        
        return aMinutes - bMinutes;
      });
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{timetable.name}</h2>
        <Badge variant="outline" className="h-6 px-2 text-xs whitespace-nowrap">
          {timetable.section === 'academic' ? 'Academic' : 'Professional'}
        </Badge>
      </div>

      <Tabs defaultValue={currentDay || daysOfWeek[0]}>
        <TabsList className="w-full overflow-x-auto flex-wrap">
          {daysOfWeek.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className={
                day === currentDay ? "border-b-2 border-primary" : ""
              }
            >
              {day.substring(0, 3)}
              {entriesByDay[day]?.length > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1 rounded-full text-[10px]">
                  {entriesByDay[day].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {daysOfWeek.map((day) => (
          <TabsContent key={day} value={day} className="pt-4">
            <ScrollArea className="h-[60vh] md:h-[70vh]">
              {entriesByDay[day]?.length > 0 ? (
                <div className="space-y-4">
                  {entriesByDay[day].map((entry) => (
                    <Card key={entry.id} className={`border-l-4 ${entry.color ? `border-l-[${entry.color}]` : 'border-l-primary'}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{entry.title}</h3>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {entry.startTime} - {entry.endTime}
                              </div>
                              {entry.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {entry.location}
                                </div>
                              )}
                            </div>
                          </div>
                          {entry.recurring && (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs whitespace-nowrap">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-48">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No classes scheduled for {day}</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
