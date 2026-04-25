export type PublishedSkill = {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
  body: string;
  bodyExcerpt: string;
  artifacts: Array<{ entryFile: string }>;
};
