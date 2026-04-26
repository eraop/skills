type WorkbenchModeInput = {
  dev: boolean;
  hasDirectoryPicker: boolean;
  protocol: string;
}

function getDefaultWorkbenchModeInput(): WorkbenchModeInput {
  const meta = import.meta as ImportMeta & { env?: { DEV?: boolean } };

  return {
    dev: meta.env?.DEV === true,
    hasDirectoryPicker:
      typeof window !== "undefined" &&
      "showDirectoryPicker" in (window as Window & { showDirectoryPicker?: unknown }),
    protocol: typeof window !== "undefined" ? window.location.protocol : "",
  };
}

export function supportsWorkbenchMode(
  input: WorkbenchModeInput = getDefaultWorkbenchModeInput(),
) {
  return input.dev && input.hasDirectoryPicker && input.protocol.startsWith("http");
}
