import { type Form, type InsertForm, type Response, type InsertResponse, forms, responses } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createForm(form: InsertForm): Promise<Form>;
  getForm(id: string): Promise<Form | undefined>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: string): Promise<boolean>;
  getForms(): Promise<Form[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  getResponses(formId: string): Promise<Response[]>;
}

export class DatabaseStorage implements IStorage {
  async createForm(insertForm: InsertForm): Promise<Form> {
    const [form] = await db
      .insert(forms)
      .values({
        title: insertForm.title,
        description: insertForm.description || null,
        headerImage: insertForm.headerImage || null,
        questions: insertForm.questions,
        isPublished: insertForm.isPublished || false,
      })
      .returning();
    return form as Form;
  }

  async getForm(id: string): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form as Form | undefined;
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    const [form] = await db
      .update(forms)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, id))
      .returning();
    return form as Form | undefined;
  }

  async deleteForm(id: string): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getForms(): Promise<Form[]> {
    const allForms = await db.select().from(forms).orderBy(forms.createdAt);
    return allForms as Form[];
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponses(formId: string): Promise<Response[]> {
    const formResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.formId, formId))
      .orderBy(responses.submittedAt);
    return formResponses;
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
}

export const storage = new DatabaseStorage();
