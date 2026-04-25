import { z } from "zod";
import type { SkillDocument } from "./models.js";

const skillDocumentSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  tags: z.array(z.string()).default([]),
  triggers: z.array(z.string()).min(1)
}).strict();

export function parseSkillDocument(input: unknown): SkillDocument {
  const parsed = skillDocumentSchema.parse(input);

  return {
    name: parsed.name,
    title: parsed.title,
    description: parsed.description,
    version: parsed.version,
    tags: parsed.tags,
    triggers: parsed.triggers
  };
}
