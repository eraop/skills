import { describe, expect, it, vi } from "vitest";
import { handleCopyCommandClick } from "../../site/src/lib/copy-command.js";

describe("handleCopyCommandClick", () => {
  it("copies the command and marks the button as copied", async () => {
    const button = {
      dataset: { copyCommand: "npm run test" } as Record<string, string>,
      setAttribute: vi.fn(),
      closest: vi.fn(),
      querySelector: vi.fn(),
    };
    const status = { textContent: "Copy command" };
    button.closest.mockReturnValue(button);
    button.querySelector.mockReturnValue(status);
    const clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };

    const handled = await handleCopyCommandClick(
      { target: button } as unknown as Event,
      { clipboard, resetDelayMs: 0 },
    );

    expect(handled).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith("npm run test");
    expect(button.dataset.copyState).toBe("copied");
    expect(status.textContent).toBe("Copied");
  });
});
