export type Route =
  | { kind: "home" }
  | { kind: "detail"; skillName: string }
  | { kind: "not-found" };

export function parseRoute(hash: string): Route {
  if (hash === "" || hash === "#" || hash === "#/") {
    return { kind: "home" };
  }

  const match = hash.match(/^#\/skill\/([a-z0-9-]+)$/);
  if (match) {
    return { kind: "detail", skillName: match[1] };
  }

  return { kind: "not-found" };
}
