import type { PublishedSkill, PublishedSkillVariant } from "./types.js";

const languageLabels: Record<string, string> = {
  default: "Default",
  en: "English",
  zh: "中文",
};

export function getSkillVariants(skill: PublishedSkill): PublishedSkillVariant[] {
  return Array.isArray(skill.variants) && skill.variants.length > 0
    ? skill.variants
    : [skill];
}

export function getPreferredSkillVariant(
  skill: PublishedSkill,
  language?: string,
): PublishedSkillVariant {
  const variants = getSkillVariants(skill);

  return (
    variants.find((variant) => variant.language === language) ??
    variants.find((variant) => variant.language === "en") ??
    variants[0] ??
    skill
  );
}

export function getLanguageLabel(language: string) {
  return languageLabels[language] ?? language.toUpperCase();
}
