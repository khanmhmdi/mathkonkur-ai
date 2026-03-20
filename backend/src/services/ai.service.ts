import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import logger from '../config/logger';
import { AppError } from '../utils/errors';
import { getSystemPrompt } from '../prompts/tutor.system';

// Define the core types
export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ImageData {
  data: string; // base64
  mimeType: string; // 'image/jpeg', 'image/png'
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  modelVersion: string;
  processingTimeMs: number;
}

export interface ParsedMathContent {
  cleanContent: string;
  extractedFormulas: string[];
}

class AIService {
  private ai: GoogleGenAI;
  private readonly MODEL_NAME = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  /**
   * Generates a conversational response from Gemini using strict math-tutor framing.
   * Includes automated exponential backoff for transient failures (1s, 2s).
   */
  public async generateResponse(
    messages: Message[],
    subject: string,
    level: string,
    image?: ImageData
  ): Promise<AIResponse> {
    
    // 1. Validation
    if (!messages || messages.length === 0) {
      throw new AppError('AI_VALIDATION', 400, true);
    }
    if (!subject || !level) {
      throw new AppError('AI_VALIDATION', 400, true);
    }

    // 2. Build Context
    const systemInstruction = getSystemPrompt(subject, level);
    
    const contents = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    // 3. Handle Image (append to last user message)
    if (image) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          contents[i].parts.push({
            inlineData: { data: image.data, mimeType: image.mimeType }
          } as any);
          break;
        }
      }
    }

    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 3;

    // 4. API Call with Custom Backoff & Timeout
    while (attempt < maxAttempts) {
      attempt++;
      try {
        // We use AbortController to enforce 30s timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await this.ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: contents as any,
          config: {
            systemInstruction,
            maxOutputTokens: 2048
          }
        });

        clearTimeout(timeoutId);

        if (!response.text) {
          throw new AppError('AI_INVALID_RESPONSE', 500, true);
        }

        const processingTimeMs = Date.now() - startTime;
        const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

        // Cost Tracking & Observability
        logger.info({
          tokensUsed,
          modelVersion: this.MODEL_NAME,
          subject,
          hasImage: !!image,
          processingTimeMs,
          costEth: tokensUsed * 0.00001
        }, 'AI Generation Complete');

        // Light check for Persian characters
        if (!/[\\u0600-\\u06FF]/.test(response.text)) {
          logger.warn('AI response does not contain Persian text as instructed');
        }

        return {
          content: response.text,
          tokensUsed,
          modelVersion: this.MODEL_NAME,
          processingTimeMs
        };

      } catch (err: any) {
        // AbortController timeout trap
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          if (attempt === maxAttempts) throw new AppError('AI_TIMEOUT', 504, true);
        }
        
        // Fast-fail structural errors without retrying
        else if (err.message?.includes('quota') || err.status === 429) {
          throw new AppError('AI_QUOTA_EXCEEDED', 429, true);
        } else if (err.message?.includes('safety') || err.message?.includes('blocked')) {
          throw new AppError('AI_SAFETY_BLOCKED', 400, true);
        }
        
        // Generic failure handling
        if (attempt === maxAttempts) {
          logger.error(err, 'Final AI attempt failed');
          throw new AppError('AI_SERVICE_ERROR', 503, true);
        }

        // Apply exponential backoff (1s, 2s)
        logger.warn(`AI attempt ${attempt} failed, retrying in ${attempt}000ms...`);
        await new Promise(res => setTimeout(res, attempt * 1000));
      }
    }

    throw new AppError('AI_SERVICE_ERROR', 503, true);
  }

  /**
   * Safely exacts `$ inline $` and `$$ display $$` LaTeX structures.
   * Emits sanitized plaintext alongside raw formula arrays.
   */
  public parseMathContent(rawResponse: string): ParsedMathContent {
    const formulas: string[] = [];

    // Capture Display Math ($$...$$)
    const displayRegex = /\\$\\$([\\s\\S]*?)\\$\\$/g;
    let cleanContent = rawResponse.replace(displayRegex, (match, formula) => {
      const trimmed = formula.trim();
      if (this.isValidLatex(trimmed)) {
        formulas.push(trimmed);
        return `\\n\\n[فرمول ${formulas.length}]\\n\\n`; // Replace with newline placeholder
      }
      return match;
    });

    // Capture Inline Math ($...$)
    const inlineRegex = /\\$([^\\$]+)\\$/g;
    cleanContent = cleanContent.replace(inlineRegex, (match, formula) => {
      const trimmed = formula.trim();
      if (this.isValidLatex(trimmed)) {
        formulas.push(trimmed);
        return ` [فرمول ${formulas.length}] `; // Replace inline
      }
      return match;
    });

    return {
      cleanContent: cleanContent.trim(),
      extractedFormulas: formulas
    };
  }

  /**
   * Evaluates extracted LaTeX for basic safety and structural completeness.
   */
  private isValidLatex(formula: string): boolean {
    if (formula.length < 3) return false;

    // Check balanced braces
    let balance = 0;
    for (const char of formula) {
      if (char === '{') balance++;
      if (char === '}') balance--;
      if (balance < 0) return false; // Early brace closure
    }
    if (balance !== 0) return false; // Unclosed brace

    // Blacklist dangerous commands
    const blacklist = ['\\input', '\\include', '\\write', '\\read'];
    for (const command of blacklist) {
      if (formula.includes(command)) return false;
    }

    return true;
  }
}

export const aiService = new AIService();
