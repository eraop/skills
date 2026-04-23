export type PublishedSkill = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  platforms: Array<"codex" | "copilot" | "cursor">;
  body: string;
  bodyExcerpt: string;
  artifacts: Array<{ platform: "codex" | "copilot" | "cursor"; entryFile: string }>;
};
