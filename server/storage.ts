import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import {
  users, tasks, timetables, scheduleEntries, studyMaterials, focusSessions,
  collaborationWorkspaces, workspaceMembers, sharedTasks, analytics,
  type User, type Task, type Timetable, type ScheduleEntry, type StudyMaterial,
  type FocusSession, type CollaborationWorkspace, type WorkspaceMember,
  type SharedTask, type Analytics, type InsertUser, type InsertTask,
  type InsertTimetable, type InsertScheduleEntry, type InsertStudyMaterial,
  type InsertFocusSession, type InsertCollaborationWorkspace, type InsertWorkspaceMember,
  type InsertSharedTask, type InsertAnalytics
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Timetable operations
  getTimetables(userId: number): Promise<Timetable[]>;
  getTimetable(id: number): Promise<Timetable | undefined>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  updateTimetable(id: number, data: Partial<InsertTimetable>): Promise<Timetable | undefined>;
  deleteTimetable(id: number): Promise<boolean>;
  
  // Schedule entry operations
  getScheduleEntries(timetableId: number): Promise<ScheduleEntry[]>;
  getScheduleEntry(id: number): Promise<ScheduleEntry | undefined>;
  createScheduleEntry(entry: InsertScheduleEntry): Promise<ScheduleEntry>;
  updateScheduleEntry(id: number, data: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | undefined>;
  deleteScheduleEntry(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(userId: number, section?: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study material operations
  getStudyMaterials(userId: number, section?: string): Promise<StudyMaterial[]>;
  getStudyMaterial(id: number): Promise<StudyMaterial | undefined>;
  createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  updateStudyMaterial(id: number, data: Partial<InsertStudyMaterial>): Promise<StudyMaterial | undefined>;
  deleteStudyMaterial(id: number): Promise<boolean>;
  
  // Focus session operations
  getFocusSessions(userId: number): Promise<FocusSession[]>;
  getFocusSession(id: number): Promise<FocusSession | undefined>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, data: Partial<InsertFocusSession>): Promise<FocusSession | undefined>;
  deleteFocusSession(id: number): Promise<boolean>;
  
  // Collaboration workspace operations
  getWorkspaces(userId: number): Promise<CollaborationWorkspace[]>;
  getWorkspace(id: number): Promise<CollaborationWorkspace | undefined>;
  createWorkspace(workspace: InsertCollaborationWorkspace): Promise<CollaborationWorkspace>;
  updateWorkspace(id: number, data: Partial<InsertCollaborationWorkspace>): Promise<CollaborationWorkspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  
  // Workspace member operations
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember>;
  updateWorkspaceMember(id: number, data: Partial<InsertWorkspaceMember>): Promise<WorkspaceMember | undefined>;
  removeWorkspaceMember(id: number): Promise<boolean>;
  
  // Shared task operations
  getSharedTasks(workspaceId: number): Promise<SharedTask[]>;
  getSharedTask(id: number): Promise<SharedTask | undefined>;
  createSharedTask(task: InsertSharedTask): Promise<SharedTask>;
  updateSharedTask(id: number, data: Partial<InsertSharedTask>): Promise<SharedTask | undefined>;
  deleteSharedTask(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalytics(userId: number): Promise<Analytics[]>;
  createAnalytics(data: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: number, data: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Timetable operations
  async getTimetables(userId: number): Promise<Timetable[]> {
    return db.select().from(timetables).where(eq(timetables.userId, userId));
  }

  async getTimetable(id: number): Promise<Timetable | undefined> {
    const [timetable] = await db.select().from(timetables).where(eq(timetables.id, id));
    return timetable;
  }

  async createTimetable(insertTimetable: InsertTimetable): Promise<Timetable> {
    const [timetable] = await db
      .insert(timetables)
      .values(insertTimetable)
      .returning();
    return timetable;
  }

  async updateTimetable(id: number, data: Partial<InsertTimetable>): Promise<Timetable | undefined> {
    const [updatedTimetable] = await db
      .update(timetables)
      .set(data)
      .where(eq(timetables.id, id))
      .returning();
    return updatedTimetable;
  }

  async deleteTimetable(id: number): Promise<boolean> {
    const result = await db
      .delete(timetables)
      .where(eq(timetables.id, id));
    return true; // If no error was thrown, deletion was successful
  }

  // Schedule entry operations
  async getScheduleEntries(timetableId: number): Promise<ScheduleEntry[]> {
    return db.select().from(scheduleEntries).where(eq(scheduleEntries.timetableId, timetableId));
  }

  async getScheduleEntry(id: number): Promise<ScheduleEntry | undefined> {
    const [entry] = await db.select().from(scheduleEntries).where(eq(scheduleEntries.id, id));
    return entry;
  }

  async createScheduleEntry(insertEntry: InsertScheduleEntry): Promise<ScheduleEntry> {
    const [entry] = await db
      .insert(scheduleEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateScheduleEntry(id: number, data: Partial<InsertScheduleEntry>): Promise<ScheduleEntry | undefined> {
    const [updatedEntry] = await db
      .update(scheduleEntries)
      .set(data)
      .where(eq(scheduleEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteScheduleEntry(id: number): Promise<boolean> {
    await db
      .delete(scheduleEntries)
      .where(eq(scheduleEntries.id, id));
    return true;
  }

  // Task operations
  async getTasks(userId: number, section?: string): Promise<Task[]> {
    if (section) {
      return db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.section, section)));
    }
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
    return true;
  }

  // Study material operations
  async getStudyMaterials(userId: number, section?: string): Promise<StudyMaterial[]> {
    if (section) {
      return db
        .select()
        .from(studyMaterials)
        .where(and(eq(studyMaterials.userId, userId), eq(studyMaterials.section, section)));
    }
    return db.select().from(studyMaterials).where(eq(studyMaterials.userId, userId));
  }

  async getStudyMaterial(id: number): Promise<StudyMaterial | undefined> {
    const [material] = await db.select().from(studyMaterials).where(eq(studyMaterials.id, id));
    return material;
  }

  async createStudyMaterial(insertMaterial: InsertStudyMaterial): Promise<StudyMaterial> {
    const [material] = await db
      .insert(studyMaterials)
      .values(insertMaterial)
      .returning();
    return material;
  }

  async updateStudyMaterial(id: number, data: Partial<InsertStudyMaterial>): Promise<StudyMaterial | undefined> {
    const [updatedMaterial] = await db
      .update(studyMaterials)
      .set(data)
      .where(eq(studyMaterials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteStudyMaterial(id: number): Promise<boolean> {
    await db
      .delete(studyMaterials)
      .where(eq(studyMaterials.id, id));
    return true;
  }

  // Focus session operations
  async getFocusSessions(userId: number): Promise<FocusSession[]> {
    return db.select().from(focusSessions).where(eq(focusSessions.userId, userId));
  }

  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    const [session] = await db.select().from(focusSessions).where(eq(focusSessions.id, id));
    return session;
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const [session] = await db
      .insert(focusSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateFocusSession(id: number, data: Partial<InsertFocusSession>): Promise<FocusSession | undefined> {
    const [updatedSession] = await db
      .update(focusSessions)
      .set(data)
      .where(eq(focusSessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteFocusSession(id: number): Promise<boolean> {
    await db
      .delete(focusSessions)
      .where(eq(focusSessions.id, id));
    return true;
  }

  // Collaboration workspace operations
  async getWorkspaces(userId: number): Promise<CollaborationWorkspace[]> {
    const workspaceMembers = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));
    
    const workspaceIds = workspaceMembers.map(m => m.workspaceId);
    
    // Get workspaces where user is owner OR a member
    return db
      .select()
      .from(collaborationWorkspaces)
      .where(
        sql`${collaborationWorkspaces.id} IN ${workspaceIds} OR ${collaborationWorkspaces.ownerId} = ${userId}`
      );
  }

  async getWorkspace(id: number): Promise<CollaborationWorkspace | undefined> {
    const [workspace] = await db.select().from(collaborationWorkspaces).where(eq(collaborationWorkspaces.id, id));
    return workspace;
  }

  async createWorkspace(insertWorkspace: InsertCollaborationWorkspace): Promise<CollaborationWorkspace> {
    const [workspace] = await db
      .insert(collaborationWorkspaces)
      .values(insertWorkspace)
      .returning();
    return workspace;
  }

  async updateWorkspace(id: number, data: Partial<InsertCollaborationWorkspace>): Promise<CollaborationWorkspace | undefined> {
    const [updatedWorkspace] = await db
      .update(collaborationWorkspaces)
      .set(data)
      .where(eq(collaborationWorkspaces.id, id))
      .returning();
    return updatedWorkspace;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    await db
      .delete(collaborationWorkspaces)
      .where(eq(collaborationWorkspaces.id, id));
    return true;
  }

  // Workspace member operations
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
  }

  async addWorkspaceMember(insertMember: InsertWorkspaceMember): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembers)
      .values(insertMember)
      .returning();
    return member;
  }

  async updateWorkspaceMember(id: number, data: Partial<InsertWorkspaceMember>): Promise<WorkspaceMember | undefined> {
    const [updatedMember] = await db
      .update(workspaceMembers)
      .set(data)
      .where(eq(workspaceMembers.id, id))
      .returning();
    return updatedMember;
  }

  async removeWorkspaceMember(id: number): Promise<boolean> {
    await db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, id));
    return true;
  }

  // Shared task operations
  async getSharedTasks(workspaceId: number): Promise<SharedTask[]> {
    return db.select().from(sharedTasks).where(eq(sharedTasks.workspaceId, workspaceId));
  }

  async getSharedTask(id: number): Promise<SharedTask | undefined> {
    const [task] = await db.select().from(sharedTasks).where(eq(sharedTasks.id, id));
    return task;
  }

  async createSharedTask(insertTask: InsertSharedTask): Promise<SharedTask> {
    const [task] = await db
      .insert(sharedTasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateSharedTask(id: number, data: Partial<InsertSharedTask>): Promise<SharedTask | undefined> {
    const [updatedTask] = await db
      .update(sharedTasks)
      .set(data)
      .where(eq(sharedTasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteSharedTask(id: number): Promise<boolean> {
    await db
      .delete(sharedTasks)
      .where(eq(sharedTasks.id, id));
    return true;
  }

  // Analytics operations
  async getAnalytics(userId: number): Promise<Analytics[]> {
    return db.select().from(analytics).where(eq(analytics.userId, userId));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsEntry] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsEntry;
  }

  async updateAnalytics(id: number, data: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const [updatedAnalytics] = await db
      .update(analytics)
      .set(data)
      .where(eq(analytics.id, id))
      .returning();
    return updatedAnalytics;
  }
}

// Use database storage
export const storage = new DatabaseStorage();