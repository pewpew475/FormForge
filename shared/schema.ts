import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  headerImage: text("header_image"),
  questions: jsonb("questions").notNull().default([]),
  isPublished: boolean("is_published").notNull().default(false),
  userId: text("user_id"), // Supabase auth user ID
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => forms.id),
  answers: jsonb("answers").notNull(),
  score: jsonb("score"), // Store scoring results
  userId: text("user_id"), // Supabase auth user ID
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
});

// Question type schemas
export const categorizeQuestionSchema = z.object({
  type: z.literal("categorize"),
  id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  items: z.array(z.string()),
  categories: z.array(z.string()),
});

export const clozeQuestionSchema = z.object({
  type: z.literal("cloze"),
  id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  text: z.string(),
  blanks: z.array(z.object({
    id: z.string(),
    correctAnswer: z.string(),
  })),
  options: z.array(z.string()),
});

export const comprehensionQuestionSchema = z.object({
  type: z.literal("comprehension"),
  id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  passage: z.string(),
  subQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number().optional(),
  })),
});

export const questionSchema = z.union([
  categorizeQuestionSchema,
  clozeQuestionSchema,
  comprehensionQuestionSchema,
]);

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  questions: z.array(questionSchema),
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  submittedAt: true,
});

export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect & {
  questions: z.infer<typeof questionSchema>[];
};
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
export type Question = z.infer<typeof questionSchema>;
export type CategorizeQuestion = z.infer<typeof categorizeQuestionSchema>;
export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;
export type ComprehensionQuestion = z.infer<typeof comprehensionQuestionSchema>;
