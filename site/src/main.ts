import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Missing #app root");
}

root.innerHTML = `
  <main class="boot-shell">
    <p class="eyebrow">Skill Archive Workbench</p>
    <h1>Frontend bootstrap in progress.</h1>
  </main>
`;
