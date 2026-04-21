import { z } from "zod";
import type { SkillDocument } from "./models.js";

const platformSchema = z.enum(["codex", "copilot", "cursor"]);

const overrideSchema = z.object({
  notes: z.array(z.string()).optional()
}).strict();

const skillDocumentSchema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  tags: z.array(z.string()).default([]),
  triggers: z.array(z.string()).min(1),
  platforms: z.array(platformSchema).min(1),
  platform_overrides: z
    .object({
      codex: overrideSchema.optional(),
      copilot: overrideSchema.optional(),
      cursor: overrideSchema.optional()
    })
    .optional()
})
  .strict()
  .superRefine((document, ctx) => {
    const overrides = document.platform_overrides;

    if (!overrides) {
      return;
    }

    for (const platform of Object.keys(overrides) as Array<keyof typeof overrides>) {
      if (overrides[platform] && !document.platforms.includes(platform)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `platform_overrides.${platform} requires ${platform} to be declared in platforms`,
          path: ["platform_overrides", platform]
        });
      }
    }
  });

export function parseSkillDocument(input: unknown): SkillDocument {
  const parsed = skillDocumentSchema.parse(input);
  const platformOverrides = parsed.platform_overrides
    ? Object.fromEntries(
        Object.entries(parsed.platform_overrides).flatMap(([platform, override]) =>
          override
            ? [
                [
                  platform,
                  {
                    ...(override.notes ? { notes: override.notes } : {})
                  }
                ]
              ]
            : []
        )
      )
    : undefined;

  return {
    name: parsed.name,
    title: parsed.title,
    description: parsed.description,
    version: parsed.version,
    tags: parsed.tags,
    triggers: parsed.triggers,
    platforms: parsed.platforms,
    ...(platformOverrides ? { platform_overrides: platformOverrides } : {})
  };
}
