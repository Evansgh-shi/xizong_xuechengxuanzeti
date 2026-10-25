# 学成选择题 · 西综知识配伍题库

[打开在线题库](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/)

当前版本 **v1.0**，下一次内容或功能更新为 v1.1。内科、外科、生理、生化、病理合计 6,622 题。

| 课程 | 题数 | 在线入口 |
| --- | ---: | --- |
| 内科 | 2,214 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/) |
| 外科 | 1,398 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/surgery.html) |
| 生理 | 1,401 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/physiology.html) |
| 生化 | 729 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/biochemistry.html) |
| 病理 | 880 | [开始练习](https://evansgh-shi.github.io/xizong_xuechengxuanzeti/pathology.html) |

支持拖拽配伍、ABC 选择、整专题练习、答后解析与讲义口诀、固定操作栏、跨科错题本与收藏。

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

检查更改后提交 `web/` 和 `docs/` 并推送到 `main`。GitHub Pages 使用 `main` 分支的 `/docs` 目录。重建或重新部署不自动增加版本；下一次正式更新时调整 `web/src/release.json`。

题干、选项、答案、题号与内容版本本次均未改动。来源和覆盖范围见 `web/README.md`、`docs/*-coverage.json` 与审计报告。扫描全文不等同于每个边角知识点均已单独设题。

## 记录与使用范围

无账户、无答题上传；作答、错题和收藏只保存在当前浏览器。同一 GitHub Pages 站点的五科可共用错题本，但不能跨设备自动同步。旧 Sites 网页和 GitHub Pages 是不同网址，原网址的浏览器记录不会自动转移；旧站仍可使用。

题库仅用于个人考试复习，不替代临床诊疗、急救指导或病理诊断。讲义原始 PDF 未上传。
