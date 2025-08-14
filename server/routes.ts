import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Forms API
  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.getForms();
      res.json(forms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const form = await storage.getForm(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch form" });
    }
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const formData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(formData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create form" });
    }
  });

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const formData = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(id, formData);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteForm(id);
      if (!deleted) {
        return res.status(404).json({ message: "Form not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete form" });
    }
  });

  // Responses API
  app.post("/api/forms/:id/responses", async (req, res) => {
    try {
      const { id: formId } = req.params;
      const responseData = insertResponseSchema.parse({ ...req.body, formId });
      const response = await storage.createResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save response" });
    }
  });

  app.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const { id: formId } = req.params;
      const responses = await storage.getResponses(formId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // File upload endpoint (simplified for demo)
  app.post("/api/upload", async (req, res) => {
    try {
      // In a real implementation, you would handle file upload here
      // For now, return a mock URL
      const mockUrl = `/uploads/${Date.now()}-mock-image.jpg`;
      res.json({ url: mockUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
