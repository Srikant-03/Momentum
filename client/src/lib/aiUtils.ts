import { Task, FocusSession, Analytics, StudyMaterial } from "@shared/schema";

/**
 * Generate insights from user data using OpenAI
 */
export async function generateInsights(
  tasks: Task[],
  focusSessions: FocusSession[],
  analytics: Analytics[]
): Promise<string[]> {
  try {
    // Format data for OpenAI
    const completedTasks = tasks.filter(task => task.completed);
    const taskCompletionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
    
    const totalStudyMinutes = focusSessions.reduce((total, session) => {
      if (session.completed && session.duration) {
        return total + session.duration;
      }
      return total;
    }, 0);
    
    // Prepare data to send to API
    const userData = {
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        completionRate: taskCompletionRate
      },
      focusSessions: {
        total: focusSessions.length,
        totalMinutes: totalStudyMinutes
      },
      analytics: analytics.map(a => ({
        category: a.category,
        value: a.value,
        date: a.date
      }))
    };
    
    // Call OpenAI API
    const response = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate AI insights');
    }
    
    const data = await response.json();
    return data.insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    // Fallback insights if API call fails
    return [
      "Start tracking your tasks and study sessions to receive personalized insights.",
      "Set specific goals for each study session to improve focus and productivity.",
      "Consider breaking down your tasks into smaller steps to improve completion rate."
    ];
  }
}

/**
 * Generate study recommendations based on materials and performance
 */
export async function generateStudyRecommendations(
  materials: StudyMaterial[],
  focusSessions: FocusSession[],
  tasks: Task[]
): Promise<{ title: string, content: string }[]> {
  try {
    // Format the data for OpenAI
    const userData = {
      materials: materials.map(m => ({
        title: m.title,
        subject: m.subject,
        type: m.type
      })),
      focusSessions: focusSessions.map(s => ({
        duration: s.duration,
        subject: s.subject,
        productivity: s.productivity
      })),
      tasks: tasks.map(t => ({
        title: t.title,
        completed: t.completed,
        dueDate: t.dueDate,
        priority: t.priority
      }))
    };
    
    // Call OpenAI API
    const response = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate study recommendations');
    }
    
    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    
    // Fallback recommendations if API call fails
    return [
      {
        title: "Create a consistent study schedule",
        content: "Establish a regular study routine to build good habits and improve retention."
      },
      {
        title: "Use active recall techniques",
        content: "Instead of passively re-reading materials, test yourself on the content to improve memory."
      },
      {
        title: "Take effective breaks",
        content: "Use the Pomodoro technique with short breaks to maintain focus and prevent burnout."
      }
    ];
  }
}

/**
 * Ask a question to AI tutor
 */
export async function askAITutor(question: string, context?: {
  subject?: string,
  recentMaterials?: StudyMaterial[]
}): Promise<string> {
  try {
    // Call OpenAI API
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question,
        context: context || {}
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get AI tutor response');
    }
    
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error asking AI tutor:', error);
    return "I'm sorry, I'm having trouble connecting to the AI tutor service. Please try again later.";
  }
}