import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // "open" or "premium"
  passwordHash: text("password_hash"),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  chapterTitle: text("chapter_title").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  email: true,
  password: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  type: true,
  passwordHash: true,
  icon: true,
  description: true,
  color: true,
}).partial({ passwordHash: true });

export const insertChapterSchema = createInsertSchema(chapters).pick({
  subject: true,
  chapterTitle: true,
  pdfUrl: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const subjectPasswordSchema = z.object({
  subject: z.string().min(1),
  password: z.string().min(1),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;
