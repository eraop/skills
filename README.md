# Skills

这是一个 multi-agent skill toolchain：在仓库里维护一份中立的 skill 源文件，构建成通用 `SKILL.md`，并一键安装到全局或当前项目的 `.agents` 目录。

## 先看结论

如果你只是想把现有 skill 安装到本机 agent，不需要拉取这个仓库：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails
```

`curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name>` 默认会：

- 从 GitHub 下载这个 skill
- 生成通用 `SKILL.md`
- 安装到全局 `~/.agents/skills/<skill-name>`

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
    <skill-name>/SKILL.md
  packages/
    cli/
    core/
```

你平时主要改 `skills/<skill-name>/skill.yaml` 和 `skills/<skill-name>/body.md`。

`dist/` 是生成目录。如果你没看到生成的 `SKILL.md`，先运行：

```bash
npm run build
node packages/cli/dist/index.js build code-generation-guardrails
```

然后查看：

```bash
find dist -maxdepth 3 -type f | sort
```

注意：当前只生成一份 `SKILL.md`，并共用同一份模板：
frontmatter 包含 `name`、`description`、`triggers`；
正文来自 `body.md`，不会根据 `triggers` 自动补充段落；需要“适用场景”时请直接写进 `body.md`。

| 生成入口文件 | 示例路径 |
| --- | --- |
| `SKILL.md` | `dist/code-generation-guardrails/SKILL.md` |

## 安装到 Agent

不需要 clone 仓库，直接运行：

默认全局安装：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails
```

安装到当前项目，而不是全局目录：

```bash
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --scope project
```

支持的参数：

- `--scope global|project`，默认 `global`

## 安装位置

全局安装会写入：

| 安装方式 | 全局路径 |
| --- | --- |
| 通用 | `~/.agents/skills/<skill-name>` |

项目安装会写入当前仓库：

| 安装方式 | 项目路径 |
| --- | --- |
| 通用 | `.agents/skills/<skill-name>` |

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
```

写完后构建并安装：

```bash
node packages/cli/dist/index.js build <skill-name>
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name>
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
curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - code-generation-guardrails --scope global

# 启动本地站点
npm run site:dev
```

## 工作流

1. 在 `skills/<skill-name>/skill.yaml` 里维护名称、描述和触发条件。
2. 在 `skills/<skill-name>/body.md` 里维护 skill 正文。
3. 运行 `node packages/cli/dist/index.js build <skill-name>` 生成通用 `SKILL.md`。
4. 到 `dist/<skill-name>/` 查看 agent 实际会读取的文件。
5. 运行 `curl -fsSL https://raw.githubusercontent.com/eraop/skills/main/scripts/install.mjs | node - <skill-name>` 安装。

## 排查

看不到 `SKILL.md`：

- 先确认运行过 `npm run build`
- 再运行 `node packages/cli/dist/index.js build <skill-name>`
- 生成入口文件都叫 `SKILL.md`

安装后 agent 没识别：

- 确认装到了正确 scope：`global` 还是 `project`
- 确认目录是 `.agents/skills/<skill-name>`
- 重启对应 agent，让它重新扫描 skill 目录
