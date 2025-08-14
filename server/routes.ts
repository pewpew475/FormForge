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

  // Responses API with scoring
  app.post("/api/forms/:id/responses", async (req, res) => {
    try {
      const { id: formId } = req.params;
      const { answers } = req.body;
      
      // Get form to calculate score
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Calculate score
      const score = calculateScore(form.questions, answers);
      
      const responseData = insertResponseSchema.parse({ 
        formId, 
        answers, 
        score 
      });
      
      const response = await storage.createResponse(responseData);
      res.status(201).json({ ...response, score });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save response" });
    }
  });
  
  // Helper function to calculate score
  function calculateScore(questions: any[], answers: Record<string, any>) {
    let totalQuestions = 0;
    let correctAnswers = 0;
    const questionScores: Record<string, { correct: boolean, total: number, earned: number }> = {};
    
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;
      
      if (question.type === "categorize") {
        // For categorize questions, we can't automatically score without correct answers
        // This would need to be manually graded or have predefined correct categorizations
        questionScores[question.id] = { correct: false, total: 1, earned: 0 };
        totalQuestions += 1;
      } else if (question.type === "cloze") {
        let questionTotal = question.blanks?.length || 0;
        let questionCorrect = 0;
        
        question.blanks?.forEach((blank: any) => {
          if (userAnswer[blank.id] === blank.correctAnswer) {
            questionCorrect++;
          }
        });
        
        questionScores[question.id] = { 
          correct: questionCorrect === questionTotal, 
          total: questionTotal, 
          earned: questionCorrect 
        };
        totalQuestions += questionTotal;
        correctAnswers += questionCorrect;
      } else if (question.type === "comprehension") {
        let questionTotal = question.subQuestions?.length || 0;
        let questionCorrect = 0;
        
        question.subQuestions?.forEach((subQ: any) => {
          if (typeof subQ.correctAnswer === 'number' && userAnswer[subQ.id] === subQ.correctAnswer) {
            questionCorrect++;
          }
        });
        
        questionScores[question.id] = { 
          correct: questionCorrect === questionTotal, 
          total: questionTotal, 
          earned: questionCorrect 
        };
        totalQuestions += questionTotal;
        correctAnswers += questionCorrect;
      }
    });
    
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      correctAnswers,
      percentage,
      questionScores
    };
  }

  app.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const { id: formId } = req.params;
      const responses = await storage.getResponses(formId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // File upload endpoint with Supabase Storage
  app.post("/api/upload", async (req, res) => {
    try {
      const { file, fileName } = req.body;
      
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      // Validate file size (base64 encoded, so approximately 4/3 of original size)
      const estimatedSize = (file.length * 3) / 4;
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (estimatedSize > maxSize) {
        return res.status(413).json({ message: "File too large. Maximum size is 5MB." });
      }

      // For development, use data URLs; for production, you'd use Supabase Storage
      if (process.env.NODE_ENV === 'production' && process.env.SUPABASE_URL) {
        try {
          const { supabase, STORAGE_BUCKET } = await import('./supabase');
          
          // Generate unique filename
          const timestamp = Date.now();
          const extension = fileName ? fileName.split('.').pop() : 'jpg';
          const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
          
          // Convert base64 to buffer
          const buffer = Buffer.from(file, 'base64');
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(uniqueFileName, buffer, {
              contentType: `image/${extension}`,
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Supabase upload error:', error);
            throw error;
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

          res.json({ url: publicUrlData.publicUrl });
        } catch (supabaseError) {
          console.error('Supabase upload failed, falling back to data URL:', supabaseError);
          // Fallback to data URL if Supabase fails
          const extension = fileName ? fileName.split('.').pop() : 'jpg';
          const imageUrl = `data:image/${extension};base64,${file}`;
          res.json({ url: imageUrl });
        }
      } else {
        // Development mode - use data URLs
        const extension = fileName ? fileName.split('.').pop() : 'jpg';
        const imageUrl = `data:image/${extension};base64,${file}`;
        res.json({ url: imageUrl });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file. Please try a smaller image." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
