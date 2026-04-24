# Skills

这是一个 multi-agent skill toolchain：在仓库里维护一份中立的 skill 源文件，然后构建成 Codex、GitHub Copilot、Cursor 各自能读取的目录结构，并一键安装到全局或当前项目。

## 先看结论

如果你只是想把现有 skill 安装到本机 agent，不需要拉取这个仓库：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails
```

`curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name>` 默认会：

- 从 GitHub 下载这个 skill
- 安装到 `codex`、`copilot`、`cursor` 三个平台中该 skill 声明支持的平台
- 使用全局安装路径

当前已有 skill：

- `code-generation-guardrails`

## 仓库结构

```text
skills/
  skills/
    <skill-name>/
      skill.yaml       # 中立元数据，人工维护
      body.md          # 中立正文，人工维护
  dist/
    codex/
      <skill-name>/SKILL.md
    copilot/
      <skill-name>/SKILL.md
    cursor/
      <skill-name>/SKILL.md
  packages/
    cli/
    core/
    adapter-codex/
    adapter-copilot/
    adapter-cursor/
```

你平时主要改 `skills/<skill-name>/skill.yaml` 和 `skills/<skill-name>/body.md`。

`dist/` 是生成目录。如果你没看到各个 AI agent 对应的 `SKILL.md`，先运行：

```bash
npm run build
node packages/cli/dist/index.js build code-generation-guardrails
```

然后查看：

```bash
find dist -maxdepth 3 -type f | sort
```

注意：当前三个平台的入口文件都叫 `SKILL.md`。

| 平台 | 生成入口文件 | 示例路径 |
| --- | --- | --- |
| Codex | `SKILL.md` | `dist/codex/code-generation-guardrails/SKILL.md` |
| GitHub Copilot | `SKILL.md` | `dist/copilot/code-generation-guardrails/SKILL.md` |
| Cursor | `SKILL.md` | `dist/cursor/code-generation-guardrails/SKILL.md` |

## 安装到 Agent

不需要 clone 仓库，直接运行：

安装全部支持的平台，默认全局安装：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails
```

只安装到某一个平台：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --target codex
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --target copilot
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --target cursor
```

安装到当前项目，而不是全局目录：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --target codex --scope project
```

支持的参数：

- `--target codex|copilot|cursor|all`，默认 `all`
- `--scope global|project`，默认 `global`

## 安装位置

全局安装会写入：

| 平台 | 全局路径 |
| --- | --- |
| Codex | `~/.codex/skills/<skill-name>` |
| GitHub Copilot | `~/.config/copilot/skills/<skill-name>` |
| Cursor | `~/.cursor/skills/<skill-name>` |

项目安装会写入当前仓库：

| 平台 | 项目路径 |
| --- | --- |
| Codex | `.codex/skills/<skill-name>` |
| GitHub Copilot | `.github/copilot/skills/<skill-name>` |
| Cursor | `.cursor/skills/<skill-name>` |

安装命令成功时当前 CLI 可能不会打印摘要；可以直接检查上面的目标目录。

## 创建新 Skill

交互式创建：

```bash
node packages/cli/dist/index.js create
```

它会生成：

```text
skills/<skill-name>/skill.yaml
skills/<skill-name>/body.md
```

`skill.yaml` 的基本格式：

```yaml
name: code-generation-guardrails
title: Code Generation Guardrails
description: Keep generated code simple, consistent, and narrowly scoped.
version: 0.1.0
tags:
  - workflow
triggers:
  - user asks to start a task
platforms:
  - codex
  - copilot
  - cursor
```

写完后构建并安装：

```bash
node packages/cli/dist/index.js build <skill-name>
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name> --target codex
```

## 常用命令

下面这些命令是维护这个仓库时使用的，需要先 clone 仓库。

```bash
# 编译 monorepo packages
npm run build

# 跑测试
npm test

# TypeScript 检查
npm run lint

# 列出当前仓库里的 skills
node packages/cli/dist/index.js list

# 构建某个 skill 到 dist/
node packages/cli/dist/index.js build code-generation-guardrails

# 安装某个 skill
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --target codex --scope global

# 启动本地站点
npm run site:dev
```

## 工作流

1. 在 `skills/<skill-name>/skill.yaml` 里维护名称、描述、触发条件和目标平台。
2. 在 `skills/<skill-name>/body.md` 里维护 skill 正文。
3. 运行 `node packages/cli/dist/index.js build <skill-name>` 生成平台产物。
4. 到 `dist/<platform>/<skill-name>/` 查看每个 agent 实际会读取的文件。
5. 运行 `curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name> --target <platform>` 安装。

## 排查

看不到 `SKILL.md`：

- 先确认运行过 `npm run build`
- 再运行 `node packages/cli/dist/index.js build <skill-name>`
- Codex/Copilot/Cursor 的文件都叫 `SKILL.md`

安装后 agent 没识别：

- 确认装到了正确 scope：`global` 还是 `project`
- 确认 skill 的 `platforms` 包含目标平台
- 重启对应 agent，让它重新扫描 skill 目录
