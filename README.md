# 学成选择题 · 西综知识配伍题库

[打开在线题库](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/)

当前版本 **v1.1**，下一次内容或功能更新为 v1.2。内科、外科、生理、生化、病理合计 6,622 题。首页可选择全部课程、章节或知识专题。

| 课程 | 题数 | 在线入口 |
| --- | ---: | --- |
| 内科 | 2,214 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/internal.html) |
| 外科 | 1,398 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/surgery.html) |
| 生理 | 1,401 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/physiology.html) |
| 生化 | 729 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/biochemistry.html) |
| 病理 | 880 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/pathology.html) |

支持拖拽配伍、ABC 选择、整专题练习、答后解析与讲义口诀、固定操作栏、跨科错题本与收藏。

## v1.1 界面更新

- 题库首页：按五科、系统、章节选择，支持搜索和直接进入知识专题；也可继续上次练习。
- 快刷模式：设置内开关；单选选定后立即判分，多选选齐后点击题内“确认答案”。只批改本题，不暴露邻题答案，不自动跳题，不重复计次。
- 电脑：保留原布局，新用户默认整专题同屏、拖拽作答、手动提交；已有明确偏好保留。
- 手机：默认快刷与选项模式，一次一题，题目在上、选项池在下；左上返回题库首页，底部只有上一组、下一组、重新做题三个按钮。左右按钮逐题前后遍历，不跳过选项组末题。
- 手机可在题干区域左滑下一题、右滑上一题；纵向滚动、选项操作、读图缩放、弹窗和多指手势不会触发切题。
- 手机与电脑分别保存界面偏好，五科仍共用本机错题本。题干、选项、答案、稳定题号和原作答记录未改动。
- `index.html` 现为首页，内科练习移至 `internal.html`；原 `index.html?chapter=...` 等练习深链接兼容跳转，记录存储名不变。

## 目录

- `SKILL.md`、`agents/`、`references/`：原有学成选择题技能，保持不变。
- `web/`：五科网页源码与可重复构建的题库规则。
- `docs/`：GitHub Pages 发布文件，来自完整五科统一构建。
- `scripts/publish.cjs`：构建并更新发布文件。

## 更新网页

需要 Node.js，无需安装额外依赖。在仓库根目录执行：

```sh
node scripts/publish.cjs
```

检查更改后提交 `web/` 和 `docs/` 并推送到 `main`。GitHub Pages 使用 `main` 分支的 `/docs` 目录。重建或重新部署不自动增加版本；下一次正式更新时调整 `web/src/release.json`。本仓库的网页源码为 GitHub Pages 发布源；旧 Sites 托管地址不会因推送本仓库自动更新。

题干、选项、答案、题号与内容版本本次均未改动。来源和覆盖范围见 `web/README.md`、`docs/*-coverage.json` 与审计报告。扫描全文不等同于每个边角知识点均已单独设题。

## 记录与使用范围

无账户、无答题上传；作答、错题和收藏只保存在当前浏览器。同一 GitHub Pages 站点的五科可共用错题本，但不能跨设备自动同步。旧 Sites 网页和 GitHub Pages 是不同网址，原网址的浏览器记录不会自动转移；旧站仍可使用。

题库仅用于个人考试复习，不替代临床诊疗、急救指导或病理诊断。讲义原始 PDF 未上传。
