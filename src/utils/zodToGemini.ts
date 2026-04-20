import { Type } from "@google/genai";
import { z } from "zod";

/**
 * Converts a Zod schema to a format compatible with Google Gemini's responseSchema.
 * This is a surgical implementation for Echo's Narrative Simulator.
 */
export function zodToGeminiSchema(schema: z.ZodTypeAny): any {
  if (schema instanceof z.ZodObject) {
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(schema.shape)) {
      properties[key] = zodToGeminiSchema(value as z.ZodTypeAny);
      if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodNullable)) {
        required.push(key);
      }
    }

    return {
      type: Type.OBJECT,
      properties,
      required: required.length > 0 ? required : undefined,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: Type.ARRAY,
      items: zodToGeminiSchema(schema.element),
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodString) {
    return {
      type: Type.STRING,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodNumber) {
    return {
      type: Type.NUMBER,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return {
      type: Type.BOOLEAN,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: Type.STRING,
      enum: schema._def.values,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return zodToGeminiSchema(schema._def.innerType);
  }

  // Fallback
  return { type: Type.STRING };
}
