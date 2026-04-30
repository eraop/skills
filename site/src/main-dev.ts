import "./styles.css";
import { renderArchiveShell } from "./components/archive-shell.js";
import { supportsWorkbenchMode } from "./lib/mode.js";
import type { SkillDraft } from "./lib/skill-schema.js";
import { renderDetailPage } from "./pages/detail.js";
import { renderHomePage } from "./pages/home.js";
import { renderNotFoundPage } from "./pages/not-found.js";
import { parseRoute } from "./router.js";
import type { PublishedSkill } from "./lib/types.js";
import { handleCopyCommandClick } from "./lib/copy-command.js";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing #app root");
const appRoot = root;
const workbenchAvailable = import.meta.env.DEV && supportsWorkbenchMode();
const skillRepoNameKey = "skill-repo-name";

type WorkbenchModules = {
  deleteSkill: typeof import("./lib/workbench-actions.js").deleteSkill;
  isValidRepoLayout: typeof import("./lib/repo-fs.js").isValidRepoLayout;
  loadStoredRepoHandle: typeof import("./lib/repo-handle-store.js").loadStoredRepoHandle;
  parsePastedSkill: typeof import("./lib/skill-parser.js").parsePastedSkill;
  persistRepoHandle: typeof import("./lib/repo-handle-store.js").persistRepoHandle;
  pickRepoRoot: typeof import("./lib/repo-fs.js").pickRepoRoot;
  rebuildSkill: typeof import("./lib/workbench-actions.js").rebuildSkill;
  renderEditPage: typeof import("./pages/edit.js").renderEditPage;
  renderWorkbenchPanel: typeof import("./components/workbench-panel.js").renderWorkbenchPanel;
  saveSkillDraft: typeof import("./lib/workbench-actions.js").saveSkillDraft;
  scanRepoSkills: typeof import("./lib/live-repo.js").scanRepoSkills;
}

async function loadWorkbenchModules(): Promise<WorkbenchModules> {
  const [
    workbenchActions,
    repoFs,
    repoHandleStore,
    skillParser,
    editPage,
    workbenchPanel,
    liveRepo,
  ] = await Promise.all([
    import("./lib/workbench-actions.js"),
    import("./lib/repo-fs.js"),
    import("./lib/repo-handle-store.js"),
    import("./lib/skill-parser.js"),
    import("./pages/edit.js"),
    import("./components/workbench-panel.js"),
    import("./lib/live-repo.js"),
  ]);

  return {
    deleteSkill: workbenchActions.deleteSkill,
    isValidRepoLayout: repoFs.isValidRepoLayout,
    loadStoredRepoHandle: repoHandleStore.loadStoredRepoHandle,
    parsePastedSkill: skillParser.parsePastedSkill,
    persistRepoHandle: repoHandleStore.persistRepoHandle,
    pickRepoRoot: repoFs.pickRepoRoot,
    rebuildSkill: workbenchActions.rebuildSkill,
    renderEditPage: editPage.renderEditPage,
    renderWorkbenchPanel: workbenchPanel.renderWorkbenchPanel,
    saveSkillDraft: workbenchActions.saveSkillDraft,
    scanRepoSkills: liveRepo.scanRepoSkills,
  };
}

async function bootstrap() {
  try {
    const workbench = workbenchAvailable ? await loadWorkbenchModules() : null;
    const response = await fetch(new URL("data/skills.json", document.baseURI));
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    let skills = (await response.json()) as PublishedSkill[];
    let selectedRepoHandle: FileSystemDirectoryHandle | null = null;
    let skillSource = "";
    let skillDraft: SkillDraft | null = null;
    let skillValidationMessage = "Paste a complete wrapped skill to validate it locally.";
    let homeQuery = "";
    let lastRouteKey: string | null = null;

    function focusHomeSearch() {
      const searchField = document.querySelector<HTMLInputElement>("#skill-search");
      if (!searchField) return;

      searchField.focus();
      searchField.setSelectionRange(searchField.value.length, searchField.value.length);
    }

    async function canReuseStoredHandle(handle: FileSystemDirectoryHandle) {
      if (!workbench) {
        return false;
      }

      const permissionHandle = handle as FileSystemDirectoryHandle & {
        queryPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
      }

      if (typeof permissionHandle.queryPermission === "function") {
        const permission = await permissionHandle.queryPermission({ mode: "readwrite" })
        if (permission !== "granted") {
          return false
        }
      }

      return workbench.isValidRepoLayout(handle)
    }

    function setSkillSource(source: string) {
      if (!workbench) {
        return;
      }

      skillSource = source;

      if (!source.trim()) {
        skillDraft = null;
        skillValidationMessage =
          "Paste a complete wrapped skill to validate it locally.";
        return;
      }

      try {
        skillDraft = workbench.parsePastedSkill(source);
        skillValidationMessage = `Ready to save "${skillDraft.name}" and build SKILL.md.`;
      } catch (error) {
        skillDraft = null;
        skillValidationMessage =
          error instanceof Error ? error.message : "Could not parse the skill text.";
      }
    }

    function syncSkillEditor() {
      if (!workbench) {
        return;
      }

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
      if (workbench) {
        skills = await workbench.scanRepoSkills(handle)
      }
    }

    function routeKey(route: ReturnType<typeof parseRoute>) {
      if (route.kind === "detail") {
        return `${route.kind}:${route.skillName}:${route.language ?? ""}`;
      }

      return route.kind;
    }

    function syncRouteScroll(route: ReturnType<typeof parseRoute>) {
      const nextRouteKey = routeKey(route);
      if (nextRouteKey === lastRouteKey) return;

      lastRouteKey = nextRouteKey;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function render() {
      const route = parseRoute(window.location.hash);
      const rememberedRepoLabel = workbench
        ? window.localStorage.getItem(skillRepoNameKey) ?? undefined
        : undefined;
      const sidebar = workbench
        ? workbench.renderWorkbenchPanel({
            enabled: selectedRepoHandle !== null,
            ...(selectedRepoHandle ? { repoLabel: selectedRepoHandle.name } : {}),
            ...(rememberedRepoLabel ? { rememberedRepoLabel } : {}),
          })
        : "";

      if (route.kind === "home") {
        appRoot.innerHTML = renderArchiveShell(
          renderHomePage(skills, {
            workbenchAvailable: workbench !== null,
            query: homeQuery,
          }),
          sidebar,
        );
        syncSkillEditor();
        syncRouteScroll(route);
        return;
      }

      if (route.kind === "detail") {
        const skill = skills.find((entry) => entry.name === route.skillName);
        appRoot.innerHTML = renderArchiveShell(
          skill
            ? renderDetailPage(skill, {
                workbenchAvailable: workbench !== null,
                repoConnected: selectedRepoHandle !== null,
                selectedLanguage: route.language,
              })
            : renderNotFoundPage(),
          sidebar,
        );
        syncSkillEditor();
        syncRouteScroll(route);
        return;
      }

      if (route.kind === "edit" && workbench) {
        appRoot.innerHTML = renderArchiveShell(
          workbench.renderEditPage({
            repoConnected: selectedRepoHandle !== null,
          }),
          sidebar,
        );
        syncSkillEditor();
        syncRouteScroll(route);
        return;
      }

      appRoot.innerHTML = renderArchiveShell(renderNotFoundPage(), sidebar);
      syncSkillEditor();
      syncRouteScroll(route);
    }

    document.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.id !== "skill-search") return;

      homeQuery = target.value;
      render();
      focusHomeSearch();
    });

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      void handleCopyCommandClick(event);
    });

    if (workbench) {
      document.addEventListener("click", async (event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

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
              draftToSave = workbench.parsePastedSkill(currentSource);
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
            await workbench.saveSkillDraft(selectedRepoHandle, draftToSave);
            await syncSkillsFromRepo(selectedRepoHandle);
            setSkillSource("");
            window.location.hash = `#/skill/${draftToSave.name}`;
          } catch (error) {
            window.alert(
              error instanceof Error ? error.message : "Could not save the skill.",
            );
          }

          return;
        }

        if (target.id === "rebuild-skill") {
          if (!selectedRepoHandle) {
            window.alert("Connect a local repository before rebuilding a skill.");
            return;
          }

          const name = target.dataset.skill
          if (!name) return

          const liveSkill = skills.find((entry) => entry.name === name)
          if (!liveSkill) {
            window.alert(`Could not find live skill "${name}" to rebuild.`)
            return
          }

          try {
            await workbench.rebuildSkill(selectedRepoHandle, liveSkill)
            await syncSkillsFromRepo(selectedRepoHandle)
            render()
          } catch (error) {
            window.alert(
              error instanceof Error ? error.message : "Could not rebuild the skill.",
            )
          }

          return
        }

        if (target.id === "delete-skill") {
          if (!selectedRepoHandle) {
            window.alert("Connect a local repository before deleting a skill.");
            return;
          }

          const name = target.dataset.skill
          if (!name) return

          const confirmed = window.confirm(
            `Delete skills/${name} and dist artifacts for ${name}?`,
          )
          if (!confirmed) return

          try {
            await workbench.deleteSkill(selectedRepoHandle, name)
            await syncSkillsFromRepo(selectedRepoHandle)
            window.location.hash = "#/"
            render()
          } catch (error) {
            window.alert(
              error instanceof Error ? error.message : "Could not delete the skill.",
            )
          }

          return
        }

        if (target.id !== "connect-repo") return;

        let handle: FileSystemDirectoryHandle;
        try {
          handle = await workbench.pickRepoRoot();
        } catch {
          return;
        }

        if (!(await workbench.isValidRepoLayout(handle))) {
          window.alert("Selected directory is not a valid skill repository.");
          return;
        }

        selectedRepoHandle = handle;
        await syncSkillsFromRepo(handle);
        window.localStorage.setItem(skillRepoNameKey, handle.name);
        try {
          await workbench.persistRepoHandle(handle);
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

      try {
        const restoredHandle = await workbench.loadStoredRepoHandle();
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
      <section class="command-empty">
        <p class="section-kicker">Archive offline</p>
        <h1 class="mt-4 font-display text-5xl leading-none text-porcelain sm:text-6xl">The archive could not be loaded.</h1>
        <p class="mt-6 text-lg leading-8 text-mist">Please refresh and try again in a moment.</p>
      </section>
    `);
  }
}

void bootstrap();
