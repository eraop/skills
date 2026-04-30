export type Route =
  | { kind: "home" }
  | { kind: "edit" }
  | { kind: "detail"; skillName: string; language?: string }
  | { kind: "not-found" };

export function parseRoute(hash: string): Route {
  if (hash === "" || hash === "#" || hash === "#/") {
    return { kind: "home" };
  }

  if (hash === "#/edit") {
    return { kind: "edit" };
  }

  const match = hash.match(/^#\/skill\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?$/);
  const skillName = match?.[1];
  if (skillName) {
    const language = match[2];
    return language
      ? { kind: "detail", skillName, language }
      : { kind: "detail", skillName };
  }

  return { kind: "not-found" };
}
