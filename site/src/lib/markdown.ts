import { marked } from "marked";

export function renderMarkdown(source: string) {
  return marked.parse(source) as string;
}
