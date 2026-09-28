# 家庭作业生成器

Vite、React、TypeScript、Tailwind CSS 与 Ant Design 构建的纯前端作业生成器。

## 本地运行

```sh
npm install
npm run dev
```

默认打开语文，左上角通过“语文 / 数学”单选控件切换科目。左侧为加宽的配置区，小窗口下可独立滚动；右侧显示整张 A4 打印预览，使用页码切换多页内容。“适应”将纸张缩放至当前画布可完整显示的最大比例。

切换科目会保留本次打开页面后的配置、练习内容和数学题目；刷新页面后恢复默认设置，不写入本地存储。

两科的左侧配置均实时更新右侧预览，无需点击生成。数学修改运算类型、数值范围、题量、进退位、零和重复题规则时自动重新出题；修改标题、页边距、列数、横竖式或答案页时保留当前题目。也可点击“换一批题”主动刷新。无法满足的出题规则会显示原因并暂停打印，调整配置后自动恢复。默认不附答案，可自行勾选答案页。

“打印 / 导出 PDF”打开浏览器打印对话框，选择“另存为 PDF”即可导出。纸张为 A4 竖向，打印比例使用 100%，关闭浏览器自带页眉页脚。屏幕缩放不会改变实际打印尺寸。

屏幕仅渲染当前页，进入打印时才准备全部页面；结束或取消打印后恢复单页预览。长标题、抬头开关和说明占用的空间统一参与分页计算，纯空格说明按空内容处理。

## 验证

```sh
npm test -- --run
npm run build
npx playwright install chromium
npm run test:e2e
```

浏览器测试覆盖两科切换、配置生成、不同视口下整张纸张可见、分页、缩放和打印尺寸，并将截图与打印样本输出到 `test-results/`。

## 代码结构

`src/features/chinese` 和 `src/features/math` 分别维护学科配置、生成逻辑与测试；`src/components` 维护唯一的共享导航、配置、预览及 A4 外壳。字帖使用 SVG 绘制，屏幕预览和打印复用同一份内容。当前使用说明以本 README 为准。

## Vercel 部署

公网地址：https://homework-tau-two.vercel.app

代码仓库：https://github.com/wxcios/homework

项目为 `wxc-s-projects/homework`，从 GitHub 仓库导入，生产分支为 `main`。Vercel 使用 Vite、`npm ci`、`npm run build` 和 `dist` 输出目录。后续将代码提交并推送到 `main`，即可自动构建和发布，无需手动上传：

```sh
git push origin main
```

部署状态及构建日志：https://vercel.com/wxc-s-projects/homework

`.gitignore` 排除依赖、构建与测试产物、开发辅助文件及环境变量文件，避免将这些文件上传到 GitHub；`.vercelignore` 同样排除本地部署不需要的文件。账号凭据不提交到仓库。
