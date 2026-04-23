import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { renderWorkbenchPanel } from "./components/workbench-panel.js";
import { scanRepoSkills } from "./lib/live-repo.js";
import { supportsWorkbenchMode } from "./lib/mode.js";
import { parsePastedSkill } from "./lib/skill-parser.js";
import { isValidRepoLayout, pickRepoRoot } from "./lib/repo-fs.js";
import { loadStoredRepoHandle, persistRepoHandle } from "./lib/repo-handle-store.js";
import type { SkillDraft } from "./lib/skill-schema.js";
import { saveSkillDraft } from "./lib/workbench-actions.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderHomePage } from "./pages/home.js";
import { renderNotFoundPage } from "./pages/not-found.js";
import { parseRoute } from "./router.js";
import type { PublishedSkill } from "./lib/types.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
const appRoot = root;
const workbenchAvailable = supportsWorkbenchMode();
const skillRepoNameKey = "skill-repo-name";

async function canReuseStoredHandle(handle: FileSystemDirectoryHandle) {
  const permissionHandle = handle as FileSystemDirectoryHandle & {
    queryPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  }

  if (typeof permissionHandle.queryPermission === "function") {
    const permission = await permissionHandle.queryPermission({ mode: "readwrite" })
    if (permission !== "granted") {
      return false
    }
  }

  return isValidRepoLayout(handle)
}

async function bootstrap() {
  try {
    const response = await fetch(new URL("data/skills.json", document.baseURI));
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    let skills = (await response.json()) as PublishedSkill[];
    let selectedRepoHandle: FileSystemDirectoryHandle | null = null;
    let skillEditorOpen = false;
    let skillSource = "";
    let skillDraft: SkillDraft | null = null;
    let skillValidationMessage = "Paste a complete wrapped skill to validate it locally.";

    function toPublishedSkill(draft: SkillDraft): PublishedSkill {
      const firstParagraph =
        draft.body.replace(/^# .+\n+/m, "").split(/\n\s*\n/)[0]?.trim() ?? "";

      return {
        name: draft.name,
        title: draft.title,
        description: draft.description,
        version: draft.version,
        tags: [...draft.tags],
        triggers: [...draft.triggers],
        platforms: [...draft.platforms],
        body: draft.body,
        bodyExcerpt: firstParagraph,
        artifacts: draft.platforms.map((platform) => ({
          platform,
          entryFile: platform === "copilot" ? "README.md" : "SKILL.md",
        })),
      };
    }

    function setSkillSource(source: string) {
      skillSource = source;

      if (!source.trim()) {
        skillDraft = null;
        skillValidationMessage =
          "Paste a complete wrapped skill to validate it locally.";
        return;
      }

      try {
        skillDraft = parsePastedSkill(source);
        skillValidationMessage = `Ready to save "${skillDraft.name}" and build ${skillDraft.platforms.join(", ")} artifacts.`;
      } catch (error) {
        skillDraft = null;
        skillValidationMessage =
          error instanceof Error ? error.message : "Could not parse the skill text.";
      }
    }

    function syncSkillEditor() {
      const sourceField =
        document.querySelector<HTMLTextAreaElement>("#skill-source");
      if (sourceField && sourceField.value !== skillSource) {
        sourceField.value = skillSource;
      }

      const validation = document.querySelector<HTMLPreElement>("#skill-validation");
      if (validation) {
        validation.textContent = skillValidationMessage;
      }

      const saveButton =
        document.querySelector<HTMLButtonElement>("#save-skill");
      if (saveButton) {
        saveButton.disabled = !selectedRepoHandle || skillDraft === null;
      }

      const previewName = document.querySelector<HTMLElement>("#skill-preview-name");
      if (previewName) {
        previewName.textContent = skillDraft?.name ?? "Not parsed yet.";
      }

      const previewPlatforms = document.querySelector<HTMLElement>(
        "#skill-preview-platforms",
      );
      if (previewPlatforms) {
        previewPlatforms.textContent =
          skillDraft?.platforms.join(", ") ?? "-";
      }

      const previewDescription = document.querySelector<HTMLElement>(
        "#skill-preview-description",
      );
      if (previewDescription) {
        previewDescription.textContent = skillDraft?.description ?? "-";
      }

      const previewBody =
        document.querySelector<HTMLPreElement>("#skill-body-preview");
      if (previewBody) {
        previewBody.textContent = skillDraft?.body ?? "";
      }
    }

    async function syncSkillsFromRepo(handle: FileSystemDirectoryHandle) {
      skills = await scanRepoSkills(handle)
    }

    function render() {
      const route = parseRoute(window.location.hash);
      const rememberedRepoLabel = workbenchAvailable
        ? window.localStorage.getItem(skillRepoNameKey) ?? undefined
        : undefined;
      const sidebar = workbenchAvailable
        ? renderWorkbenchPanel({
            enabled: selectedRepoHandle !== null,
            ...(selectedRepoHandle ? { repoLabel: selectedRepoHandle.name } : {}),
            ...(rememberedRepoLabel ? { rememberedRepoLabel } : {}),
            editorOpen: skillEditorOpen,
          })
        : "";

      if (route.kind === "home") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, {
            workbenchAvailable,
            editorOpen: skillEditorOpen && selectedRepoHandle !== null,
          }),
          sidebar,
        );
        syncSkillEditor();
        return;
      }

      if (route.kind === "detail") {
        const skill = skills.find((entry) => entry.name === route.skillName);
        appRoot.innerHTML = renderArchiveShell(
          skill
            ? renderDetailPage(skill, { workbenchAvailable })
            : renderNotFoundPage(),
          sidebar,
        );
        syncSkillEditor();
        return;
      }

      appRoot.innerHTML = renderArchiveShell(renderNotFoundPage(), sidebar);
      syncSkillEditor();
    }

    document.addEventListener("click", async (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.id === "add-skill") {
        if (!selectedRepoHandle) return;

        skillEditorOpen = !skillEditorOpen;
        if (skillEditorOpen && window.location.hash !== "" && window.location.hash !== "#" && window.location.hash !== "#/") {
          window.location.hash = "#/";
          return;
        }

        render();
        return;
      }

      if (target.id === "refresh-skills") {
        if (selectedRepoHandle) {
          try {
            await syncSkillsFromRepo(selectedRepoHandle)
          } catch (error) {
            window.alert(
              error instanceof Error ? error.message : "Could not refresh live skills.",
            );
          }
        }

        render();
        return;
      }

      if (target.id === "save-skill") {
        if (!selectedRepoHandle) {
          window.alert("Connect a local repository before saving a skill.");
          return;
        }

        const sourceField =
          document.querySelector<HTMLTextAreaElement>("#skill-source");
        const currentSource = sourceField?.value ?? skillSource;
        let draftToSave = skillDraft;

        if (currentSource.trim()) {
          try {
            draftToSave = parsePastedSkill(currentSource);
            setSkillSource(currentSource);
            syncSkillEditor();
          } catch (error) {
            skillDraft = null;
            skillValidationMessage =
              error instanceof Error ? error.message : "Could not parse the skill text.";
            syncSkillEditor();
            window.alert(skillValidationMessage);
            return;
          }
        }

        if (!draftToSave) {
          window.alert(skillValidationMessage);
          return;
        }

        try {
          await saveSkillDraft(selectedRepoHandle, draftToSave);
          await syncSkillsFromRepo(selectedRepoHandle);
          skillEditorOpen = false;
          setSkillSource("");
          window.location.hash = `#/skill/${draftToSave.name}`;
        } catch (error) {
          window.alert(
            error instanceof Error ? error.message : "Could not save the skill.",
          );
        }

        return;
      }

      if (target.id !== "connect-repo") return;

      let handle: FileSystemDirectoryHandle;
      try {
        handle = await pickRepoRoot();
      } catch {
        return;
      }

      if (!(await isValidRepoLayout(handle))) {
        window.alert("Selected directory is not a valid skill repository.");
        return;
      }

      selectedRepoHandle = handle;
      await syncSkillsFromRepo(handle);
      skillEditorOpen = false;
      window.localStorage.setItem(skillRepoNameKey, handle.name);
      try {
        await persistRepoHandle(handle);
      } catch {
        // Ignore persistence failures after a successful live connection.
      }
      render();
    });

    document.addEventListener("input", (event) => {
      const target = event.target as HTMLTextAreaElement | null;
      if (!target || target.id !== "skill-source") return;

      setSkillSource(target.value);
      syncSkillEditor();
    });

    if (workbenchAvailable) {
      try {
        const restoredHandle = await loadStoredRepoHandle();
        if (restoredHandle && (await canReuseStoredHandle(restoredHandle))) {
          selectedRepoHandle = restoredHandle;
          await syncSkillsFromRepo(restoredHandle);
          window.localStorage.setItem(skillRepoNameKey, restoredHandle.name);
        }
      } catch {
        // Ignore restore errors and fall back to static archive data.
      }
    }

    window.addEventListener("hashchange", render);
    render();
  } catch {
    appRoot.innerHTML = renderArchiveShell(`
      <section class="not-found">
        <p class="eyebrow">Unavailable</p>
        <h1>The archive could not be loaded.</h1>
        <p class="lede">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
