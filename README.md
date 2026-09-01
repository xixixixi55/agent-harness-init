# Agent Harness Init

[![CI](https://github.com/xixixixi55/agent-harness-init/actions/workflows/ci.yml/badge.svg)](https://github.com/xixixixi55/agent-harness-init/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/agent-harness-init)](https://www.npmjs.com/package/agent-harness-init)
[![license](https://img.shields.io/npm/l/agent-harness-init)](LICENSE)

**把 AI Agent 的项目约束、验证门控和安全边界，安装到任何已有软件项目中。**

Agent Harness Init 是一个独立、开源、Provider-neutral 的项目级 Harness 安装器。
它不是新的 Agent、模型或编程 IDE，而是位于 Agent 与代码仓库之间的一层可版本化
治理协议：先识别项目事实，再生成适配该项目的规则、Skills、验证配置和所有权清单，
让 Codex、Claude Code 等 Agent 知道“改什么、不能做什么、完成前要验证什么”。

用户不需要理解 Harness 的内部结构。安装 Bootstrap Skill 后，在目标仓库中直接告诉
Agent“帮我安装并适配 Harness”，Agent 就能调用确定性的 CLI 完成分析、预览、安装和检查。

> 当前公开版本：[`agent-harness-init@0.1.0`](https://www.npmjs.com/package/agent-harness-init)，要求 Node.js 20 或更高版本。

## 为什么需要它

Agent 很擅长理解代码，但仅靠一段聊天提示并不能形成稳定的项目治理。常见问题包括：

| 没有 Harness 时 | Agent Harness Init 的处理 |
|---|---|
| 每次对话都要重新解释目录、命令和规则 | 把项目事实写入 `harness.config.yaml` 和项目级说明 |
| Agent 猜测构建、测试或类型检查命令 | 只运行发现并记录在配置中的命令 |
| 不同 Agent 各自复制模板，规则逐渐漂移 | Codex 与 Claude 使用同一份项目 Harness 事实源 |
| 安装器覆盖已有 `AGENTS.md` 或用户修改 | 先输出只读计划，遇到未托管文件或哈希变化就报告冲突 |
| 不清楚 Agent 是否真正完成验证 | `verify` 运行项目门控，`doctor` 检查 Harness 文件完整性 |
| 模板安装后无法安全升级或卸载 | manifest 记录 SHA-256，只更新或删除仍由框架拥有的文件 |

## 安装后究竟得到了什么

框架会在目标项目内建立四层约束：

1. **Agent 操作合同**：`AGENT_HARNESS.md` 规定先读相关代码、保留用户工作、按风险验证，
   并禁止 Agent 未经授权自行 commit、push、发布或调用外部服务。
2. **项目适配配置**：`harness.config.yaml` 保存项目类型、源码/测试目录、工作流和可执行门控命令。
3. **Provider 入口**：为 Codex 和 Claude Code 生成项目级 Skill，让不同 Agent 读取同一套规则。
4. **安全生命周期**：`.harness/manifest.json` 记录托管文件与哈希，为更新、漂移检查和卸载提供所有权依据。

更完整地说，安装的是一套通用治理架构，而不只是几份提示词：

```text
项目自有根规则
  └─ Harness 规则与事实源
      ├─ 项目安全、架构与资产策略（项目自有、可配置）
      ├─ Level 1 / 2 / 3 风险路由
      ├─ OpenSpec-compatible 需求与变更工件
      ├─ 渐进式上下文与任务驱动开发
      ├─ 工程验证 + Spec 语义审查 + 独立代码审查
      ├─ 候选冻结、反馈解冻与最终门控
      └─ Spec 同步、熵治理、归档与迭代经验反哺
```

其中 OpenSpec 负责“要做什么”的正式工件，Harness 负责“如何做对”的执行约束与门控。
OpenSpec CLI 可以辅助创建和归档，但不是运行依赖；即使 CLI 不存在，Level 2/3 仍必须
遵守相同的 `openspec/changes/` 文件协议，不能降级为只有聊天记录的开发。

默认生成结构：

```text
target-project/
├── AGENT_HARNESS.md                  # Agent 的项目级操作合同
├── AGENTS.md                         # 仅当项目原本不存在时创建
├── INSTALL_AGENT.md                  # 给 Agent 阅读的确定性安装协议
├── harness.config.yaml               # 项目适配与验证命令
├── harness/
│   ├── architecture.md               # 检测到的源码/测试边界
│   ├── verification.md               # 风险相称的验证策略
│   ├── iteration-guide.md             # Level 1/2/3 与 OpenSpec 生命周期
│   ├── workflow-protocols.md           # 九个生命周期 Skill 的统一可执行协议
│   ├── code-review-agent.md           # 独立评估者协议
│   ├── entropy-rules.md               # 文档、同步与归档熵治理
│   ├── templates/                      # 严格 review 与 iteration 记录模板
│   ├── project-architecture.md        # 项目自有架构政策
│   └── repository-assets.md           # 项目自有资产与敏感数据政策
├── openspec/config.yaml              # OpenSpec-compatible 工件规则
├── .agents/skills/harness-*/         # Codex 全生命周期 Skills
├── .claude/skills/harness-*/         # Claude Code 对等 Skills
└── .harness/
    ├── manifest.json                 # 托管文件 SHA-256 与框架版本
    └── backups/                      # 更新托管文件时按需创建
```

如果项目已有 `AGENTS.md`，CLI 不会接管或覆盖它，也不会自动修改其内容。Bootstrap
Skill 会要求 Agent 先阅读现有规则；若确实需要建立入口，只能在用户审阅后添加指向
`AGENT_HARNESS.md` 的最小引用，原项目更严格的规则始终优先。

## 一个具体例子

假设现有项目包含：

```text
package.json        # scripts: build、typecheck、test
src/
tests/
AGENTS.md           # 团队已经维护的规则
```

执行只读计划后，CLI 会识别它是 JavaScript 项目、发现 `src/` 和 `tests/`，并把可用命令
适配为类似配置：

```yaml
schemaVersion: 1
project:
  name: example-app
  profile: javascript
agents:
  - codex
  - claude
workflow:
  provider: openspec
architecture:
  sourceRoots:
    - src
  testRoots:
    - tests
commands:
  build: npm run build
  typecheck: npm run typecheck
  test: npm run test
```

之后 Agent 收到“修复登录问题”时，项目 Harness 会要求它读取相关源码和测试、保留无关
改动，并使用配置中的真实命令完成风险相称的验证；它不能把“测试应该能过”当作完成证据。

## 工作流程

```text
用户自然语言请求
        │
        ▼
Bootstrap Skill 识别安装意图
        │
        ▼
只读发现项目事实 ──> plan 展示 CREATE / UPDATE / CONFLICT
        │                              │
        │                    有冲突：停止并交给用户决定
        │
        └── 无冲突且获得授权
                        │
                        ▼
              原子写入 + manifest
                        │
                        ▼
              doctor 检查缺失与漂移
                        │
                        ▼
              verify 执行项目门控
```

Agent 的判断力负责理解上下文和向用户解释计划；CLI 负责可重复的项目发现、冲突分类、
文件渲染、哈希所有权和原子写入。两者职责分开，避免让自然语言直接承担文件系统安全。

## 五分钟开始使用

### 方式一：直接运行 CLI

在目标项目根目录执行：

```bash
# 1. 只读预览；不会写入项目
npx agent-harness-init plan --root .

# 2. 审阅计划后应用无冲突安装
npx agent-harness-init init --root . --yes

# 3. 检查所有托管文件是否完整、未被修改
npx agent-harness-init doctor --root .

# 4. 运行 harness.config.yaml 中配置的项目门控
npx agent-harness-init verify --root .
```

不带 `--yes` 的 `init` 和 `update` 只显示计划，不执行写入。

### 方式二：让 Agent 自己部署

先安装一次用户级 Bootstrap Skill：

```bash
# Codex
npx agent-harness-init install-skill --provider codex

# Claude Code
npx agent-harness-init install-skill --provider claude
```

然后打开任意目标项目，对 Agent 说：

> 帮我安装并适配 Agent Harness Init。先做只读计划，不覆盖已有规则，安装后运行 doctor 并报告结果。

Skill 会引导 Agent 执行 `plan → 审阅 → init --yes → doctor`。安装用户级 Skill 和修改
具体项目属于两个独立授权范围；项目内安装不会自动授权全局写入、Git 推送或远程发布。

## CLI 命令

| 命令 | 具体作用 | 是否改变项目 |
|---|---|:---:|
| `plan` | 发现项目并显示每个文件的 `CREATE`、`UPDATE`、`UNCHANGED` 或 `CONFLICT` | 否 |
| `init --yes` | 应用首次安装的无冲突计划并建立 manifest | 是 |
| `update --yes` | 更新哈希仍与旧 manifest 一致的托管文件 | 是 |
| `doctor` | 报告托管文件为 `OK`、`MISSING` 或 `MODIFIED` | 否 |
| `status` | 展示活跃变更、Level 和任务进度 | 否 |
| `gate` | 校验 Level/阶段所需工件、任务、review 与 sync 声明 | 否 |
| `verify` | 按配置中的真实命令顺序执行命名门控，首次失败即停止 | 运行项目命令 |
| `uninstall --yes` | 删除未被用户修改的托管文件，保留修改过的文件 | 是 |
| `install-skill` | 安装 Codex 或 Claude 的用户级 Bootstrap Skill | 是，项目外 |

所有项目命令均支持 `--root <path>`。

## 项目识别与适配范围

0.1 版本提供五种 Profile：

| Profile | 识别依据 |
|---|---|
| `javascript` | 根目录存在 `package.json` |
| `python` | 存在 `pyproject.toml`、`requirements.txt` 或 `setup.py` |
| `fullstack` | 同时发现 JavaScript 与 Python 标记 |
| `monorepo` | 发现 package workspaces、`pnpm-workspace.yaml` 或 `lerna.json` |
| `custom` | 无内置 Profile 命中，由用户配置实际目录和命令 |

源码根目录当前检测 `src`、`app`、`packages`、`lib`；测试目录检测 `tests`、`test`、
`__tests__`、`e2e`。JavaScript 命令来自 `package.json` 中已有的 `build`、`typecheck`、
`lint` 和 `test` scripts；框架不会为缺失命令虚构替代品。

“可用于任意项目”指未知技术栈可以通过 `custom` Profile 和 `harness.config.yaml` 接入，
不代表 0.1 版本已经内置所有语言、构建系统或业务架构的自动识别器。

## 安全与所有权模型

- `plan` 阶段只读取有限的项目标记、配置和 Git 状态，不扫描无关业务源码。
- 所有目标路径解析后必须位于用户指定的项目根目录内。
- 首次安装遇到同名、未托管文件时报告冲突；没有“强制覆盖整个项目”的捷径。
- manifest 为每个托管文件记录 SHA-256 和框架版本。
- `update` 仅修改当前哈希仍与旧 manifest 一致的文件，并在写入前创建备份。
- 写入通过同目录临时文件与 rename 完成；事务失败时回滚本次创建和更新。
- `uninstall` 仅删除哈希未变化的托管文件，保留用户修改、缺失项和项目拥有的配置。
- 工具不上传代码、不包含遥测，也不会因为项目安装而获得 commit、push 或发布权限。

## 它不是什么

- 不是 Agent Runtime、模型路由器、MCP Server 或多 Agent 编排引擎。
- 不是替代项目自身 `AGENTS.md`、安全策略或组织流程的通用规则集。
- 不理解用户的业务含义，也不会凭目录名称推断正式需求。
- 不保证项目本身的测试正确；它负责确定性地调用项目声明的验证入口。
- OpenSpec-compatible 工件是 Level 2/3 的正式协议；OpenSpec CLI 本身不是运行依赖。

## 开发与发布

```bash
git clone https://github.com/xixixixi55/agent-harness-init.git
cd agent-harness-init
npm install
npm run typecheck
npm test
npm run build
npm run release:check
```

正式行为定义位于 `openspec/`。实现依赖方向为：

```text
types -> discovery -> planning -> rendering -> filesystem -> commands -> cli
```

仓库 CI 在 Node.js 20 和 22 上运行验证。维护者发布前执行：

通用安装、三级工作流、严格归档、单/双 Provider、旧版升级与命名门控的可复现
SYNTHETIC 验收步骤见 [`docs/synthetic-e2e.md`](docs/synthetic-e2e.md)。

```bash
npm version <patch|minor|major>
npm run release:check
npm publish --access public
git push --follow-tags
```

`.github/workflows/npm-publish.yml` 支持在 GitHub Release 发布时使用仓库的
`NPM_TOKEN` secret 自动发布；未配置凭据时不会获得 npm 发布权限。

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
