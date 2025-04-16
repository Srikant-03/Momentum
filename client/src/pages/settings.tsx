import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Monitor, User2, Lock, Moon, Sun, Cloud, Search, Download, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

// Create custom icons
function GoogleIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22L3 13.5 12 5l9 8.5z" /></svg>;
}

function CustomAppleIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 18 5c-2.25 0-3 1.31-4.5 1.31S13.25 5 11 5a4.93 4.93 0 0 0-4 4.79C7 14 10 22 12 22Z" /><path d="M10 2c1 .5 2 2 2 5" /></svg>;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    bio: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    deadlineReminders: true,
    classReminders: true,
    weeklyReports: true,
    collaborationUpdates: true
  });
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/users/${user?.uid}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    updateUserMutation.mutate({
      displayName: profileForm.fullName,
      email: profileForm.email
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) return;
    
    updateUserMutation.mutate({
      password: securityForm.newPassword
    });
    
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    // and then delete the account if confirmed
    toast({
      title: "Account deletion",
      description: "Account deletion is disabled in the demo",
      variant: "destructive",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-auto">
          <TabsTrigger value="profile">
            <User2 className="h-4 w-4 mr-2 md:mr-0 md:mb-1" />
            <span className="hidden md:inline md:mt-1">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Monitor className="h-4 w-4 mr-2 md:mr-0 md:mb-1" />
            <span className="hidden md:inline md:mt-1">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2 md:mr-0 md:mb-1" />
            <span className="hidden md:inline md:mt-1">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2 md:mr-0 md:mb-1" />
            <span className="hidden md:inline md:mt-1">Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    className="resize-none"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    placeholder="Tell us a little about yourself"
                  />
                </div>
                
                <Button type="submit">Save Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how Momentum looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {theme === 'light' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                      <span>{theme === 'light' ? 'Light' : 'Dark'} Theme</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleTheme}
                    >
                      Toggle
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Default Section</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      Academic
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      Professional
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="deadline-reminders" className="flex-1">
                    Deadline reminders
                    <p className="text-sm font-normal text-muted-foreground">
                      Get notified before deadlines are due
                    </p>
                  </Label>
                  <Switch
                    id="deadline-reminders"
                    checked={notificationSettings.deadlineReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, deadlineReminders: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="class-reminders" className="flex-1">
                    Class reminders
                    <p className="text-sm font-normal text-muted-foreground">
                      Get notified before classes start
                    </p>
                  </Label>
                  <Switch
                    id="class-reminders"
                    checked={notificationSettings.classReminders}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, classReminders: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="weekly-reports" className="flex-1">
                    Weekly progress reports
                    <p className="text-sm font-normal text-muted-foreground">
                      Get weekly summaries of your productivity
                    </p>
                  </Label>
                  <Switch
                    id="weekly-reports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, weeklyReports: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="collaboration-updates" className="flex-1">
                    Collaboration updates
                    <p className="text-sm font-normal text-muted-foreground">
                      Get notified about changes in shared workspaces
                    </p>
                  </Label>
                  <Switch
                    id="collaboration-updates"
                    checked={notificationSettings.collaborationUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, collaborationUpdates: checked})
                    }
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                    />
                  </div>
                  
                  <Button type="submit">Update Password</Button>
                </form>
              </div>
              
              <Separator />
              
              {/* External Accounts */}
              <div className="space-y-4">
                <h3 className="font-medium">Connected Accounts</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GoogleIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-xs text-muted-foreground">Calendar & Drive</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CustomAppleIcon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Apple</p>
                        <p className="text-xs text-muted-foreground">iCloud Calendar</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Data Management */}
              <div className="space-y-4">
                <h3 className="font-medium">Data Management</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <Button variant="outline" className="w-full" onClick={logout}>
                Log Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
