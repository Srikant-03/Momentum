import { pgTable, text, serial, integer, timestamp, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  profilePicture: text("profile_picture"),
  preferences: jsonb("preferences").default({}),
  darkMode: boolean("dark_mode").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Timetable schema
export const timetables = pgTable("timetables", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  section: text("section").default("academic"), // academic or professional
});

export const insertTimetableSchema = createInsertSchema(timetables).omit({
  id: true
});

// Schedule entries - each class/event in the timetable
export const scheduleEntries = pgTable("schedule_entries", {
  id: serial("id").primaryKey(),
  timetableId: integer("timetable_id").notNull().references(() => timetables.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  day: text("day").notNull(), // Monday, Tuesday, etc.
  location: text("location"),
  color: text("color"),
  recurring: boolean("recurring").default(true),
  notifyBefore: integer("notify_before").default(15), // minutes
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true
});

// Deadlines/tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").default("medium"), // high, medium, low
  completed: boolean("completed").default(false),
  section: text("section").default("academic"), // academic or professional
  category: text("category"),
  relatedMaterials: jsonb("related_materials").default([]),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true
});

// Study materials schema
export const studyMaterials = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  type: text("type").notNull(), // pdf, image, link
  url: text("url"),
  fileContent: text("file_content"), // base64 for files stored locally
  category: text("category"),
  tags: jsonb("tags").default([]),
  uploadDate: timestamp("upload_date").defaultNow(),
  section: text("section").default("academic"), // academic or professional
});

export const insertStudyMaterialSchema = createInsertSchema(studyMaterials).omit({
  id: true,
  uploadDate: true
});

// Focus/study sessions schema
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  technique: text("technique").default("pomodoro"), // pomodoro, etc.
  taskId: integer("task_id").references(() => tasks.id),
  completed: boolean("completed").default(false),
  notes: text("notes"),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  startTime: true
});

// Collaboration workspaces
export const collaborationWorkspaces = pgTable("collaboration_workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCollaborationWorkspaceSchema = createInsertSchema(collaborationWorkspaces).omit({
  id: true,
  createdAt: true
});

// Workspace members
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => collaborationWorkspaces.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers).omit({
  id: true,
  joinedAt: true
});

// Shared tasks in collaboration
export const sharedTasks = pgTable("shared_tasks", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => collaborationWorkspaces.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").default("pending"), // pending, in-progress, completed
  assigneeId: integer("assignee_id").references(() => users.id),
  priority: text("priority").default("medium"), // high, medium, low
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSharedTaskSchema = createInsertSchema(sharedTasks).omit({
  id: true,
  createdAt: true
});

// User analytics data
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").defaultNow(),
  tasksCompleted: integer("tasks_completed").default(0),
  studyMinutes: integer("study_minutes").default(0),
  productivityScore: real("productivity_score"), // calculated score 0-100
  insights: jsonb("insights").default([]),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  date: true
});

// Type definitions for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetables.$inferSelect;

export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
export type StudyMaterial = typeof studyMaterials.$inferSelect;

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

export type InsertCollaborationWorkspace = z.infer<typeof insertCollaborationWorkspaceSchema>;
export type CollaborationWorkspace = typeof collaborationWorkspaces.$inferSelect;

export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;

export type InsertSharedTask = z.infer<typeof insertSharedTaskSchema>;
export type SharedTask = typeof sharedTasks.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
