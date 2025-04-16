import { Link } from "wouter";
import { 
  CalendarDays,
  Clock,
  BookOpen,
  BarChart2,
  CheckSquare,
  Users,
  Settings,
  Home
} from "lucide-react";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/timetable", label: "Timetable", icon: CalendarDays },
    { path: "/deadlines", label: "Deadlines", icon: CheckSquare },
    { path: "/materials", label: "Materials", icon: BookOpen },
    { path: "/focus", label: "Focus", icon: Clock },
    { path: "/analytics", label: "Analytics", icon: BarChart2 },
    { path: "/collaboration", label: "Collaborate", icon: Users },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-between overflow-x-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex flex-1 flex-col items-center justify-center py-2 min-w-[4rem] transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
