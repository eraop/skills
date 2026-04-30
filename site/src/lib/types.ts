export type PublishedSkillVariant = {
  language: string;
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

export type PublishedSkill = PublishedSkillVariant & {
  variants: PublishedSkillVariant[];
};
