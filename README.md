# FindIt - 失物招领平台

一个基于 Node.js + Express + MySQL 的现代化失物招领 Web 应用，帮助用户发布和查找丢失物品。

## 功能特性

- 用户注册与登录（Session + Cookie 认证）
- 发布失物/招领信息（支持多图片上传）
- 浏览和搜索物品列表
- 物品详情页与回复功能
- 个人物品管理
- 响应式设计，支持深色模式

## 技术栈

- **后端**: Node.js, Express.js
- **数据库**: MySQL 8.0
- **模板引擎**: EJS
- **认证**: express-session + bcryptjs
- **文件上传**: multer
- **前端**: Tailwind CSS, Material Symbols

## 快速开始

### 前置要求

- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并修改为你的本地配置：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=findit
DB_PORT=3306
SESSION_SECRET=your-secret-key-here
PORT=3000
```

### 3. 初始化数据库

确保 MySQL 服务已启动，然后运行：

```bash
npm run db:init
```

这会自动创建数据库表并导入测试数据。

### 4. 启动服务

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## 测试账号

数据库初始化后可使用以下测试账号：

- **邮箱**: `sarah@example.com` | **密码**: `password`
- **邮箱**: `mike@example.com` | **密码**: `password`

## 主要页面

| 路由 | 说明 | 需要登录 |
|------|------|---------|
| `/listings` | 物品列表（首页） | ❌ |
| `/items/:id` | 物品详情 | ❌ |
| `/notices/new` | 发布新物品 | ✅ |
| `/my-notices` | 我的发布 | ✅ |
| `/login` | 登录 | ❌ |
| `/signup` | 注册 | ❌ |
| `/help` | 帮助中心 | ❌ |
| `/contact` | 联系我们 | ❌ |
| `/about` | 关于/法律 | ❌ |

## API 接口

| 方法 | 路由 | 说明 |
|------|------|------|
| `GET` | `/api/notices` | 获取物品列表 |
| `GET` | `/api/notices/:id` | 获取物品详情 |
| `POST` | `/api/notices` | 创建物品（需登录） |
| `POST` | `/api/notices/:id/responses` | 添加回复（需登录） |

## 项目结构

```
├── public/              # 静态资源
│   └── uploads/         # 用户上传的图片
├── scripts/             # 数据库初始化脚本
├── src/
│   ├── config/          # 配置文件（数据库连接）
│   ├── controllers/     # 业务逻辑控制器
│   ├── db/              # SQL schema 和 seed 文件
│   ├── middlewares/     # Express 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   └── views/           # EJS 模板
│       ├── pages/       # 页面模板
│       └── partials/    # 可复用组件
├── .env.example         # 环境变量示例
├── server.js            # 应用入口
└── package.json         # 项目配置

```

## 开发命令

```bash
npm start          # 启动服务器
npm run dev        # 启动服务器（开发模式）
npm run db:schema  # 创建数据库表
npm run db:seed    # 导入测试数据
npm run db:init    # 初始化数据库（schema + seed）
```

## 详细文档

- [数据库结构说明](DATABASE.md) - 完整的数据库 schema、关系和查询示例
- [项目启动指南](SETUP.md) - 从零开始的详细安装和配置步骤

## 常见问题

### 端口 3000 被占用

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或修改端口
set PORT=3001
npm start
```

### 数据库连接失败

1. 确认 MySQL 服务已启动
2. 检查 `.env` 文件中的数据库配置
3. 确认数据库 `findit` 已创建

### 图片上传失败

确保 `public/uploads` 目录存在且有写入权限。

