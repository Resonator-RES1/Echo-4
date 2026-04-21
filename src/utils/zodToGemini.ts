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

    const additionalProperties = (schema as any)._def.catchall;
    let additionalPropertiesSchema: any = undefined;
    if (additionalProperties && !(additionalProperties instanceof z.ZodNever)) {
        additionalPropertiesSchema = zodToGeminiSchema(additionalProperties);
    }

    return {
      type: Type.OBJECT,
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: additionalPropertiesSchema,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodRecord) {
    return {
      type: Type.OBJECT,
      additionalProperties: zodToGeminiSchema(schema._def.valueType),
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

  if (schema instanceof z.ZodUnion) {
    // Gemini doesn't have a direct Union type in responseSchema that works like Zod's.
    // We'll take the first option that represents a non-null type, 
    // or fallback to string if it's too complex.
    const nonOptionalOption = schema._def.options.find((o: any) => !(o instanceof z.ZodOptional || o instanceof z.ZodNullable));
    if (nonOptionalOption) {
      return zodToGeminiSchema(nonOptionalOption);
    }
    return { type: Type.STRING };
  }

  if (schema instanceof z.ZodLazy) {
    return zodToGeminiSchema(schema._def.getter());
  }

  if (schema instanceof z.ZodAny) {
    return { type: Type.STRING }; // Fallback to string for ANY
  }

  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return zodToGeminiSchema(schema._def.innerType);
  }

  // Fallback
  console.warn("zodToGeminiSchema: Unhandled Zod type, falling back to STRING", schema);
  return { type: Type.STRING };
}
