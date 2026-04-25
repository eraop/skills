#!/usr/bin/env node
import { Command } from "commander";
import { runBuildCommand } from "./commands/build.js";
import { runCreateCommand } from "./commands/create.js";
import { runInstallCommand } from "./commands/install.js";
import { runListCommand } from "./commands/list.js";

const program = new Command();
const repoRoot = process.cwd();

program.command("create").action(() => runCreateCommand(repoRoot));

program
  .command("build")
  .argument("<skillName>")
  .action(async (skillName: string) => {
    await runBuildCommand(repoRoot, skillName);
  });

program
  .command("install")
  .argument("<skillName>")
  .option("--scope <scope>", "install scope", "global")
  .action(
    async (
      skillName: string,
      options: { scope: "global" | "project" }
    ) => {
      await runInstallCommand(repoRoot, skillName, options.scope);
    }
  );

program.command("list").action(() => runListCommand(repoRoot).then(console.log));

program.parseAsync(process.argv);
