export function supportsWorkbenchMode() {
  return (
    typeof window !== "undefined" &&
    "showDirectoryPicker" in (window as Window & { showDirectoryPicker?: unknown }) &&
    window.location.protocol.startsWith("http")
  );
}
