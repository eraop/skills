export interface BuildArtifact {
  skillName: string;
  artifactPath: string;
  manifest: Record<string, unknown>;
  installHints: string[];
}
