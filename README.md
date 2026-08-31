# Agent Harness Init

让用户在任意软件项目中对 AI Agent 说一句“帮我安装并适配 Harness”，
Agent 就能先分析项目、生成安全计划，再部署项目级规则和验证门控。

Agent Harness Init 是一个独立、Provider-neutral 的 Harness 安装器。它把
Agent 的判断力用于识别项目，把文件生成、冲突检测、哈希所有权和写入交给
确定性的 CLI，避免不同 Agent 手工复制模板造成漂移。

> 当前版本：`0.1.0`。GitHub 仓库与 npm 包均公开发布。

## 它解决什么问题

传统模板要求用户自己复制 `AGENTS.md`、Skills、验证文档和配置，并且后续
无法安全升级。本项目提供完整生命周期：

- 自动识别 JavaScript/TypeScript、Python、全栈和 Monorepo 项目；
- 无法识别时使用 `custom`，不虚构构建或测试命令；
- 生成项目级 `AGENT_HARNESS.md`、Harness 文档和 Codex/Claude Skills；
- 使用 `.harness/manifest.json` 记录所有生成文件的 SHA-256；
- 更新和卸载只处理仍与 manifest 一致的文件；
- 已存在或被用户修改的文件绝不静默覆盖；
- OpenSpec 是可选工作流，不是运行时硬依赖；
- 不读取无关源码、不上传代码、不包含遥测。

## 工作方式

```text
自然语言请求
     │
     ▼
Bootstrap Skill
     │
     ▼
只读项目发现 ──> dry-run 安装计划 ──> 冲突检查
                                          │
                              无冲突且用户已授权
                                          │
                                          ▼
                          原子写入 + 所有权 manifest
                                          │
                                          ▼
                                       doctor
```

## 快速安装

要求 Node.js 20 或更高版本。

```bash
# 在目标项目中预览适配计划（不写入）
npx agent-harness-init plan --root .

# 应用无冲突的安装计划
npx agent-harness-init init --root . --yes

# 检查生成文件是否完整、未漂移
npx agent-harness-init doctor --root .
```

安装一次 Bootstrap Skill：

```bash
# Codex
npx agent-harness-init install-skill --provider codex

# Claude Code
npx agent-harness-init install-skill --provider claude
```

安装 Skill 是用户级写入，与在具体项目中安装 Harness 是两个独立授权范围。

## 一句话让 Agent 部署

打开目标项目后告诉 Agent：

> 帮我安装并适配 Agent Harness Init。先做只读计划，不覆盖已有规则，安装后运行 doctor 并报告结果。

Bootstrap Skill 会引导 Agent 执行：

```bash
npx agent-harness-init plan --root .
npx agent-harness-init init --root . --yes
npx agent-harness-init doctor --root .
```

如果项目已经有 `AGENTS.md`，CLI 不会接管或覆盖它。Agent 会先阅读原规则，
然后只添加一个指向 `AGENT_HARNESS.md` 的最小引用；原项目更严格的规则继续优先。

## CLI

| 命令 | 作用 | 是否写入 |
|---|---|:---:|
| `plan` | 发现项目并显示安装或升级计划 | 否 |
| `init --yes` | 应用无冲突的安装计划 | 是 |
| `update --yes` | 更新仍未被用户修改的托管文件 | 是 |
| `doctor` | 检查托管文件缺失和漂移 | 否 |
| `verify` | 按配置依次执行项目门控 | 运行项目命令 |
| `uninstall --yes` | 删除未被修改的托管文件 | 是 |
| `install-skill` | 安装用户级 Bootstrap Skill | 是，项目外 |

所有项目命令都支持 `--root <path>`。`init` 和 `update` 在不带 `--yes` 时只
显示计划。

## 目标项目中生成的内容

```text
target-project/
├── AGENT_HARNESS.md
├── AGENTS.md                         # 仅在原项目不存在时生成
├── INSTALL_AGENT.md
├── harness.config.yaml
├── harness/
│   ├── architecture.md
│   └── verification.md
├── .agents/skills/agent-harness/     # Codex 项目 Skill
├── .claude/skills/agent-harness/     # Claude 项目 Skill
└── .harness/
    ├── manifest.json
    └── backups/                      # 仅升级托管文件时使用
```

`harness.config.yaml` 是适配层，保存检测到的项目类型、源码和测试目录、Agent
Provider、工作流以及验证命令。框架源码不硬编码用户项目的包名和目录。

## 安全模型

- 计划阶段完全只读。
- 目标路径必须解析在用户指定的项目根目录内。
- 首次安装遇到同名文件会报告冲突，不使用覆盖开关绕过。
- manifest 记录每个托管文件的 SHA-256。
- 升级前当前哈希必须与旧 manifest 一致。
- 文件通过同目录临时文件和 rename 原子替换。
- 安装事务失败时回滚本次新建和已备份的托管文件。
- 卸载保留项目拥有的 `harness.config.yaml`、缺失项和已修改文件，只删除确认未变的托管内容。
- 项目内安装不授权全局 Skill、Git commit/push、远程建仓或 npm 发布。

## 支持范围

0.1 版本内置以下 Profile：

- `javascript`
- `python`
- `fullstack`
- `monorepo`
- `custom`

“支持任意项目”意味着未知项目可以通过 `harness.config.yaml` 配置接入，
而不是框架声称能够自动理解所有业务架构。更多技术栈应通过配置和适配器扩展。

## 开发

```bash
git clone https://github.com/xixixixi55/agent-harness-init.git
cd agent-harness-init
npm install
npm run typecheck
npm test
npm run build
npm run verify
npm run release:check
```

## npm 发布维护

仓库的 `publishConfig` 固定使用官方 npm registry 并公开发布。维护者发布前应：

```bash
npm version <patch|minor|major>
npm run release:check
npm publish --access public
git push --follow-tags
```

`.github/workflows/ci.yml` 会在提交和 Pull Request 上验证 Node.js 20/22。
`.github/workflows/npm-publish.yml` 可在 GitHub Release 发布时使用仓库的
`NPM_TOKEN` secret 自动发布；首次配置 token 前不会执行外部发布。

正式行为位于 `openspec/`。核心依赖方向为：

```text
types -> discovery -> planning -> rendering -> filesystem -> commands -> cli
```

## 独立性、致谢与许可证

Agent Harness Init 是独立开发和维护的项目，不隶属于、不代表、也未获得
Harness-OSPX 的官方背书。

本项目早期设计参考了
[Harness-OSPX](https://github.com/pxp995/harness-ospx) 将 Harness Engineering、
项目级 Agent 指令、验证门控与 OpenSpec 工作流结合的思路。Harness-OSPX 由
pxp995 及其贡献者维护，并以 MIT License 发布。对应版权和许可文本保存在
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) 与
[`licenses/harness-ospx-MIT.txt`](licenses/harness-ospx-MIT.txt)。

本项目自身以 [MIT License](LICENSE) 发布。
