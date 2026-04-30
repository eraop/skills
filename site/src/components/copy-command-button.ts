import { escapeHtml } from "../lib/html.js";

const copyIcon = `
  <svg class="command-copy-icon copy-icon" aria-hidden="true" viewBox="0 0 24 24">
    <rect x="9" y="9" width="10" height="10" rx="2"></rect>
    <path d="M5 15V7a2 2 0 0 1 2-2h8"></path>
  </svg>
`;

const checkIcon = `
  <svg class="command-copy-icon check-icon" aria-hidden="true" viewBox="0 0 24 24">
    <path d="m5 12 4 4L19 6"></path>
  </svg>
`;

export function renderCopyCommandRow(command: string) {
  const escapedCommand = escapeHtml(command);

  return `
    <div class="command-copy-row">
      <code class="command-code"><span class="text-copper">$</span> ${escapedCommand}</code>
      <button class="command-copy-button" data-copy-command="${escapedCommand}" aria-label="Copy command" type="button">
        ${copyIcon}
        ${checkIcon}
        <span class="sr-only">Copy command</span>
      </button>
    </div>
  `;
}
