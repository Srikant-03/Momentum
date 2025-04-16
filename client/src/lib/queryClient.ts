import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Mock data for demo mode
const mockData = {
  timetables: Array(3).fill(0).map((_, i) => ({
    id: i + 1,
    name: `Class Schedule ${i + 1}`,
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    year: 2025,
    semester: i % 2 === 0 ? 'Fall' : 'Spring',
    isActive: i === 0
  })),
  
  scheduleEntries: Array(15).fill(0).map((_, i) => ({
    id: i + 1,
    timetableId: 1,
    subject: ['Mathematics', 'Physics', 'Computer Science', 'History', 'Literature'][i % 5],
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i % 5],
    startTime: `${8 + Math.floor(i / 5) * 2}:00`,
    endTime: `${9 + Math.floor(i / 5) * 2}:00`,
    location: `Room ${100 + i}`,
    professor: `Dr. ${['Smith', 'Johnson', 'Williams', 'Jones', 'Brown'][i % 5]}`,
    color: ['#ff5733', '#33ff57', '#3357ff', '#f3ff33', '#ff33f3'][i % 5]
  })),
  
  tasks: Array(8).fill(0).map((_, i) => ({
    id: i + 1,
    userId: 'demo-user',
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    dueDate: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    priority: ['High', 'Medium', 'Low'][i % 3],
    status: ['Not Started', 'In Progress', 'Completed'][i % 3],
    category: ['Homework', 'Exam', 'Project', 'Reading'][i % 4],
    completed: i % 3 === 2
  })),
  
  materials: Array(6).fill(0).map((_, i) => ({
    id: i + 1,
    userId: 'demo-user',
    title: `Study Material ${i + 1}`,
    description: `Description for study material ${i + 1}`,
    category: ['Notes', 'Book', 'Article', 'Video', 'Website'][i % 5],
    subject: ['Mathematics', 'Physics', 'Computer Science', 'History', 'Literature'][i % 5],
    url: i % 2 === 0 ? `https://example.com/material${i}` : null,
    uploadDate: new Date().toISOString(),
    fileContent: null,
    tags: ['important', 'review']
  })),
  
  focusSessions: Array(5).fill(0).map((_, i) => ({
    id: i + 1,
    userId: 'demo-user',
    startTime: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    endTime: new Date(Date.now() - (i + 1) * 3600000 + 25 * 60000).toISOString(),
    duration: 25,
    technique: 'Pomodoro',
    taskId: i + 1,
    notes: `Session ${i + 1} notes`,
    completed: true
  })),
  
  analytics: Array(7).fill(0).map((_, i) => ({
    id: i + 1,
    userId: 'demo-user',
    date: new Date(Date.now() - i * 86400000).toISOString(),
    insights: ['Productive day', 'Focus improving', 'Consider more breaks'][i % 3],
    tasksCompleted: Math.floor(Math.random() * 5) + 1,
    studyMinutes: Math.floor(Math.random() * 120) + 30,
    productivityScore: Math.floor(Math.random() * 10) + 1,
  })),
  
  workspaces: Array(2).fill(0).map((_, i) => ({
    id: i + 1,
    name: `Study Group ${i + 1}`,
    description: `Description for study group ${i + 1}`,
    ownerId: 'demo-user',
    createdAt: new Date().toISOString(),
    joinCode: `JOIN${i}123`,
  })),
  
  workspaceMembers: Array(4).fill(0).map((_, i) => ({
    id: i + 1,
    workspaceId: Math.floor(i / 2) + 1,
    userId: i === 0 ? 'demo-user' : `member-${i}`,
    role: i % 2 === 0 ? 'admin' : 'member',
    joinedAt: new Date().toISOString()
  })),
  
  sharedTasks: Array(5).fill(0).map((_, i) => ({
    id: i + 1,
    workspaceId: Math.floor(i / 3) + 1,
    createdById: i % 2 === 0 ? 'demo-user' : `member-${i % 3 + 1}`,
    title: `Shared Task ${i + 1}`,
    description: `Description for shared task ${i + 1}`,
    dueDate: new Date(Date.now() + (i + 2) * 86400000).toISOString(),
    priority: ['High', 'Medium', 'Low'][i % 3],
    status: ['Not Started', 'In Progress', 'Completed'][i % 3],
    assignedTo: i % 3 === 0 ? 'demo-user' : (i % 3 === 1 ? `member-${i % 3}` : null)
  }))
};

// Determine if user is in demo mode
const isDemoMode = () => {
  try {
    const storedDemoUser = localStorage.getItem('momentum_demo_user');
    return Boolean(storedDemoUser && JSON.parse(storedDemoUser)?.isDemo);
  } catch (error) {
    return false;
  }
};

// Get mock data based on the API path
const getMockData = (path: string) => {
  if (path.includes('/users/') && path.includes('/timetables')) {
    return mockData.timetables;
  }
  if (path.includes('/timetables/') && path.includes('/entries')) {
    return mockData.scheduleEntries;
  }
  if (path.includes('/users/') && path.includes('/tasks')) {
    return mockData.tasks;
  }
  if (path.includes('/users/') && path.includes('/materials')) {
    return mockData.materials;
  }
  if (path.includes('/users/') && path.includes('/focus-sessions')) {
    return mockData.focusSessions;
  }
  if (path.includes('/users/') && path.includes('/analytics')) {
    return mockData.analytics;
  }
  if (path.includes('/users/') && path.includes('/workspaces')) {
    return mockData.workspaces;
  }
  if (path.includes('/workspaces/') && path.includes('/members')) {
    return mockData.workspaceMembers;
  }
  if (path.includes('/workspaces/') && path.includes('/tasks')) {
    return mockData.sharedTasks;
  }
  
  // Handle individual item lookups by ID
  const parts = path.split('/');
  const id = parseInt(parts[parts.length - 1], 10);
  
  if (!isNaN(id)) {
    if (path.includes('/timetables/')) {
      return mockData.timetables.find(t => t.id === id) || null;
    }
    if (path.includes('/entries/')) {
      return mockData.scheduleEntries.find(e => e.id === id) || null;
    }
    if (path.includes('/tasks/')) {
      return mockData.tasks.find(t => t.id === id) || null;
    }
    if (path.includes('/materials/')) {
      return mockData.materials.find(m => m.id === id) || null;
    }
    if (path.includes('/focus-sessions/')) {
      return mockData.focusSessions.find(s => s.id === id) || null;
    }
    if (path.includes('/workspaces/')) {
      return mockData.workspaces.find(w => w.id === id) || null;
    }
    if (path.includes('/workspace-members/')) {
      return mockData.workspaceMembers.find(m => m.id === id) || null;
    }
    if (path.includes('/shared-tasks/')) {
      return mockData.sharedTasks.find(t => t.id === id) || null;
    }
  }
  
  return null;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // If in demo mode and it's a GET request, return mock data
  if (isDemoMode() && method.toUpperCase() === 'GET') {
    const mockResponse = getMockData(url);
    
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // If in demo mode and it's not a GET request, simulate success
  if (isDemoMode()) {
    // For mutation operations (POST, PUT, PATCH, DELETE), return success with mock data
    if (method.toUpperCase() === 'POST') {
      // Simulate creating a new item
      const newId = Math.floor(Math.random() * 1000) + 100;
      const mockItem = { id: newId, ...(data as object || {}) };
      
      return new Response(JSON.stringify(mockItem), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT') {
      // Simulate updating an item
      return new Response(JSON.stringify({ ...(data as object || {}), updated: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (method.toUpperCase() === 'DELETE') {
      // Simulate deleting an item
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  // If not in demo mode or not handled above, proceed with real API request
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle demo mode for queries
    if (isDemoMode()) {
      const mockData = getMockData(queryKey[0] as string);
      return mockData as T;
    }
    
    // Normal API request for non-demo mode
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});