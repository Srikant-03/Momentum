import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Timetable', path: '/timetable', icon: '📅' },
    { label: 'Deadlines', path: '/deadlines', icon: '⏰' },
    { label: 'Study Materials', path: '/materials', icon: '📚' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'Focus Mode', path: '/focus', icon: '🎯' },
    { label: 'Collaboration', path: '/collaboration', icon: '👥' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  // Check if the user is authenticated
  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please log in to access this app.</p>
          <div className="flex space-x-4">
            <Link href="/login">
              <a className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Login
              </a>
            </Link>
            <Link href="/register">
              <a className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
                Register
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 bg-background border-b h-14 flex items-center justify-between px-4 lg:hidden z-10">
        <div className="flex items-center">
          <Link href="/">
            <a className="font-semibold text-xl">Momentum</a>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => logout()}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Logout"
          >
            👤
          </button>
        </div>
      </header>

      {/* Sidebar navigation (desktop) */}
      <nav className="hidden lg:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <div className="p-6">
          <Link href="/">
            <a className="font-semibold text-xl">Momentum</a>
          </Link>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    location === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-auto p-4 border-t flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user.displayName?.[0].toUpperCase() || user.email?.[0].toUpperCase() || '👤'}
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user.displayName || user.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t h-14 flex items-center justify-around lg:hidden z-10">
        {navItems.slice(0, 5).map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-md ${
                location === item.path ? 'text-primary' : 'text-foreground'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </a>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-16 lg:py-6 lg:px-6 pb-20 lg:pb-6">
        {children}
      </main>
    </div>
  );
}