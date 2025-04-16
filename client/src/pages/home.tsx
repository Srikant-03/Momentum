import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user } = useAuth();

  // Main features of the app for the dashboard
  const features = [
    {
      title: 'Timetable',
      description: 'Manage your academic schedule',
      icon: '📅',
      path: '/timetable',
    },
    {
      title: 'Deadlines',
      description: 'Track assignments and exams',
      icon: '⏰',
      path: '/deadlines',
    },
    {
      title: 'Study Materials',
      description: 'Organize your learning resources',
      icon: '📚',
      path: '/materials',
    },
    {
      title: 'Analytics',
      description: 'Visualize your academic performance',
      icon: '📊',
      path: '/analytics',
    },
    {
      title: 'Focus Mode',
      description: 'Enhanced concentration with Pomodoro',
      icon: '🎯',
      path: '/focus',
    },
    {
      title: 'Collaboration',
      description: 'Work together with classmates',
      icon: '👥',
      path: '/collaboration',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
        <p className="text-muted-foreground">
          Your personal academic productivity dashboard
        </p>
      </div>
      
      {/* Quick stats summary (placeholder) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Nearest in 2 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Next: Math at 2:00 PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5h 30m</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Features */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.path} href={feature.path}>
            <a className="block h-full">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="px-0">
                    Open <span className="ml-1">→</span>
                  </Button>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}