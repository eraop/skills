export interface SkillDocument {
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  triggers: string[];
}

export interface NeutralSkill {
  document: SkillDocument;
  documentSource: string;
  body: string;
  rootDir: string;
}

export interface SkillSource extends NeutralSkill {
  artifactPathSegments: string[];
  variantName?: string;
}
