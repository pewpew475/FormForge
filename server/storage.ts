import { type Form, type InsertForm, type Response, type InsertResponse } from "@shared/schema";
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

export const storage = new MemStorage();
