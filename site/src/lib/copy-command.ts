type ClipboardWriter = {
  writeText: (text: string) => Promise<void>;
}

type CopyCommandOptions = {
  clipboard?: ClipboardWriter;
  resetDelayMs?: number;
}

export async function handleCopyCommandClick(
  event: Event,
  options: CopyCommandOptions = {},
) {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>("[data-copy-command]");
  if (!button) {
    return false;
  }

  const command = button.dataset.copyCommand;
  const clipboard = options.clipboard ?? navigator.clipboard;
  if (!command || !clipboard) {
    return true;
  }

  const resetDelayMs = options.resetDelayMs ?? 1200;
  const status = button.querySelector<HTMLElement>(".sr-only");

  await clipboard.writeText(command);
  button.dataset.copyState = "copied";
  button.setAttribute("aria-label", "Copied command");
  if (status) {
    status.textContent = "Copied";
  }

  if (resetDelayMs > 0) {
    window.setTimeout(() => {
      delete button.dataset.copyState;
      button.setAttribute("aria-label", "Copy command");
      if (status) {
        status.textContent = "Copy command";
      }
    }, resetDelayMs);
  }

  return true;
}
