import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { sendTimerNotification } from '../../lib/notificationUtils';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

interface PomodoroSettings {
  focusTime: number;      // in minutes
  breakTime: number;      // in minutes
  longBreakTime: number;  // in minutes
  sessionsBeforeLongBreak: number;
}

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onStart: () => void;
  onEnd: (sessionId: number, durationMinutes: number, completed: boolean) => void;
  notificationsEnabled: boolean;
  taskName: string;
}

type TimerState = 'idle' | 'focusing' | 'break' | 'longBreak';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function PomodoroTimer({
  settings,
  onStart,
  onEnd,
  notificationsEnabled,
  taskName
}: PomodoroTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(settings.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionId, setSessionId] = useState<number>(-1);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  // Use refs to track time for accurate session duration calculation
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Maximum time for the current timer state
  const maxTime = timerState === 'focusing' 
    ? settings.focusTime * 60
    : timerState === 'break'
      ? settings.breakTime * 60
      : timerState === 'longBreak'
        ? settings.longBreakTime * 60
        : settings.focusTime * 60;
  
  // Progress percentage for the progress bar
  const progress = Math.round(((maxTime - timeRemaining) / maxTime) * 100);
  
  // Effect to handle the timer countdown
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    // Play sound or notification
    if (notificationsEnabled) {
      if (timerState === 'focusing') {
        sendTimerNotification('Focus session completed! Time for a break.');
      } else {
        sendTimerNotification('Break time is over. Ready to focus again?');
      }
    }
    
    // If we just completed a focus session
    if (timerState === 'focusing') {
      // Track focus time for session
      const focusTimeMinutes = settings.focusTime;
      setTotalFocusTime(prev => prev + focusTimeMinutes);
      
      // Increment completed sessions
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Determine if we should take a long break
      const shouldTakeLongBreak = newCompletedSessions % settings.sessionsBeforeLongBreak === 0;
      
      if (shouldTakeLongBreak) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakTime * 60);
      } else {
        setTimerState('break');
        setTimeRemaining(settings.breakTime * 60);
      }
      
      // Call onEnd with session info
      onEnd(sessionId, focusTimeMinutes, true);
      
      // Reset session ID after recording it
      setSessionId(-1);
    } else {
      // Break is over, prepare for next focus session
      setTimerState('focusing');
      setTimeRemaining(settings.focusTime * 60);
      setIsActive(false); // Pause so user can manually start the next focus session
    }
  };
  
  // Start or pause the timer
  const toggleTimer = () => {
    if (timerState === 'idle') {
      // Start a new focus session
      setTimerState('focusing');
      setTimeRemaining(settings.focusTime * 60);
      startTimeRef.current = Date.now();
      
      // Notify parent component about session start
      onStart();
      
      // For demo purposes, generate a fake sessionId
      setSessionId(Math.floor(Math.random() * 1000));
    }
    
    setIsActive(!isActive);
  };
  
  // Reset the timer
  const resetTimer = () => {
    setIsActive(false);
    
    if (timerState === 'focusing' && sessionId !== -1) {
      // Calculate how much time was actually spent in this session
      const elapsedSeconds = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      
      // Notify parent that session was interrupted
      onEnd(sessionId, elapsedMinutes, false);
    }
    
    // Reset to initial state
    setTimerState('idle');
    setTimeRemaining(settings.focusTime * 60);
    setSessionId(-1);
    startTimeRef.current = null;
  };
  
  // Skip to the next phase (from focus to break or vice versa)
  const skipToNext = () => {
    if (timerState === 'focusing') {
      // Track partial focus time
      const elapsedSeconds = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      
      // Complete focus session
      if (sessionId !== -1) {
        onEnd(sessionId, elapsedMinutes, true);
      }
      
      // Move to break
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      const shouldTakeLongBreak = newCompletedSessions % settings.sessionsBeforeLongBreak === 0;
      if (shouldTakeLongBreak) {
        setTimerState('longBreak');
        setTimeRemaining(settings.longBreakTime * 60);
      } else {
        setTimerState('break');
        setTimeRemaining(settings.breakTime * 60);
      }
      
      setSessionId(-1);
    } else {
      // Skip break, start new focus session
      setTimerState('focusing');
      setTimeRemaining(settings.focusTime * 60);
      startTimeRef.current = Date.now();
      
      // Create a new session
      onStart();
      setSessionId(Math.floor(Math.random() * 1000));
    }
    
    setIsActive(true);
  };
  
  // Determine button label based on timer state
  const buttonLabel = isActive 
    ? 'Pause' 
    : timerState === 'idle' || !isActive
      ? 'Start'
      : 'Resume';
  
  // Determine button icon based on timer state
  const buttonIcon = isActive 
    ? <Pause className="h-4 w-4 mr-2" /> 
    : <Play className="h-4 w-4 mr-2" />;
  
  // Determine timer state label for display
  const stateLabel = timerState === 'focusing' 
    ? 'Focus Time' 
    : timerState === 'break'
      ? 'Short Break'
      : timerState === 'longBreak'
        ? 'Long Break'
        : 'Ready to Focus';
  
  // Determine primary color based on timer state
  const primaryColor = timerState === 'focusing'
    ? 'bg-primary'
    : timerState === 'break' || timerState === 'longBreak'
      ? 'bg-cyan-500'
      : 'bg-primary';
  
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Task name display */}
      <h3 className="font-semibold text-xl">{taskName}</h3>
      
      {/* Timer display */}
      <div className="text-5xl font-bold">{formatTime(timeRemaining)}</div>
      
      {/* Timer state */}
      <div className="flex items-center">
        {timerState === 'break' || timerState === 'longBreak' ? (
          <Coffee className="h-5 w-5 mr-2 text-cyan-500" />
        ) : null}
        <span className={`text-sm font-medium ${
          timerState === 'break' || timerState === 'longBreak' ? 'text-cyan-500' : ''
        }`}>
          {stateLabel}
        </span>
      </div>
      
      {/* Progress bar */}
      <Progress value={progress} className="w-full" />
      
      {/* Control buttons */}
      <div className="flex space-x-3">
        <Button
          variant={isActive ? "outline" : "default"}
          onClick={toggleTimer}
        >
          {buttonIcon}
          {buttonLabel}
        </Button>
        
        <Button
          variant="outline"
          onClick={resetTimer}
          disabled={timerState === 'idle'}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          variant="outline"
          onClick={skipToNext}
          disabled={timerState === 'idle'}
        >
          Skip
        </Button>
      </div>
      
      {/* Session counter */}
      <div className="text-sm text-muted-foreground">
        Completed sessions: {completedSessions}
        {completedSessions > 0 && ` (${totalFocusTime} minutes focused)`}
      </div>
    </div>
  );
}