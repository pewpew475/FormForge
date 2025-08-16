import { type Form, type InsertForm, type Response, type InsertResponse, forms, responses } from "@shared/schema";
import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createForm(form: InsertForm & { userId?: string }): Promise<Form>;
  getForm(id: string, userId?: string): Promise<Form | undefined>;
  updateForm(id: string, form: Partial<InsertForm>, userId?: string): Promise<Form | undefined>;
  deleteForm(id: string, userId?: string): Promise<boolean>;
  getForms(userId?: string): Promise<Form[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  getResponses(formId: string): Promise<Response[]>;
  getUserResponse(formId: string, userId: string): Promise<Response | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createForm(insertForm: InsertForm & { userId?: string }): Promise<Form> {
    const db = getDb();
    const [form] = await db
      .insert(forms)
      .values({
        title: insertForm.title,
        description: insertForm.description || null,
        headerImage: insertForm.headerImage || null,
        questions: insertForm.questions,
        isPublished: insertForm.isPublished || false,
        userId: insertForm.userId || null,
      })
      .returning();
    return form as Form;
  }

  async getForm(id: string, userId?: string): Promise<Form | undefined> {
    const db = getDb();
    let query = db.select().from(forms).where(eq(forms.id, id));

    // If userId is provided, filter by user ownership for private access
    // For public form access (form filling), userId can be undefined
    if (userId) {
      query = query.where(and(eq(forms.id, id), eq(forms.userId, userId)));
    }

    const [form] = await query;
    return form as Form | undefined;
  }

  async updateForm(id: string, updateData: Partial<InsertForm>, userId?: string): Promise<Form | undefined> {
    const db = getDb();
    let whereCondition = eq(forms.id, id);

    // If userId is provided, ensure user owns the form
    if (userId) {
      whereCondition = and(eq(forms.id, id), eq(forms.userId, userId));
    }

    const [form] = await db
      .update(forms)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(whereCondition)
      .returning();
    return form as Form | undefined;
  }

  async deleteForm(id: string, userId?: string): Promise<boolean> {
    const db = getDb();
    let whereCondition = eq(forms.id, id);

    // If userId is provided, ensure user owns the form
    if (userId) {
      whereCondition = and(eq(forms.id, id), eq(forms.userId, userId));
    }

    const result = await db.delete(forms).where(whereCondition);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getForms(userId?: string): Promise<Form[]> {
    const db = getDb();
    let query = db.select().from(forms);

    // If userId is provided, filter by user ownership
    if (userId) {
      query = query.where(eq(forms.userId, userId));
    }

    const allForms = await query.orderBy(forms.createdAt);
    return allForms as Form[];
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const db = getDb();
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponses(formId: string): Promise<Response[]> {
    const db = getDb();
    const formResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.formId, formId))
      .orderBy(responses.submittedAt);
    return formResponses;
  }

  async getUserResponse(formId: string, userId: string): Promise<Response | undefined> {
    const db = getDb();
    const [response] = await db
      .select()
      .from(responses)
      .where(and(eq(responses.formId, formId), eq(responses.userId, userId)))
      .limit(1);
    return response;
  }
}

export class MemStorage implements IStorage {
  private forms: Map<string, Form>;
  private responses: Map<string, Response>;

  constructor() {
    this.forms = new Map();
    this.responses = new Map();
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const id = randomUUID();
    const now = new Date();
    const form: Form = {
      id,
      title: insertForm.title,
      description: insertForm.description || null,
      headerImage: insertForm.headerImage || null,
      questions: insertForm.questions,
      isPublished: insertForm.isPublished || false,
      createdAt: now,
      updatedAt: now,
    };
    this.forms.set(id, form);
    return form;
  }

  async getForm(id: string): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    const existingForm = this.forms.get(id);
    if (!existingForm) return undefined;

    const updatedForm: Form = {
      ...existingForm,
      ...updateData,
      updatedAt: new Date(),
    };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async deleteForm(id: string): Promise<boolean> {
    return this.forms.delete(id);
  }

  async getForms(): Promise<Form[]> {
    return Array.from(this.forms.values());
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      ...insertResponse,
      id,
      submittedAt: new Date(),
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponses(formId: string): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.formId === formId
    );
  }

  async getUserResponse(formId: string, userId: string): Promise<Response | undefined> {
    return Array.from(this.responses.values()).find(
      (response) => response.formId === formId && response.userId === userId
    );
  }
}

export const storage = new DatabaseStorage();
