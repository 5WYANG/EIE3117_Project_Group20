# FindIt 数据库结构文档

## 概述

FindIt 使用 MySQL 8.0 作为关系型数据库，采用 utf8mb4 字符集以支持完整的 Unicode 字符（包括 emoji）。数据库名称为 `findit`。

---

## 数据库架构图

```
┌─────────────┐
│   users     │
│  (用户表)    │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│  notices    │  │  responses  │
│ (失物招领表) │  │  (回复表)   │
└──────┬──────┘  └─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│notice_images│
│ (图片表)     │
└─────────────┘
```

---

## 表结构详解

### 1. `users` - 用户表

存储注册用户的基本信息和认证凭据。

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 用户唯一标识 |
| `name` | VARCHAR(120) | NOT NULL | 用户姓名 |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 用户邮箱（登录账号） |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt 加密的密码哈希 |
| `avatar_url` | TEXT | NULL | 用户头像 URL（可选） |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 账号创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 最后更新时间 |

**索引：**
- PRIMARY KEY: `id`
- UNIQUE INDEX: `email`

**示例数据：**
```sql
id: 1
name: "Sarah Jenkins"
email: "sarah@example.com"
password_hash: "$2b$10$bp6fo5oArHV5Ukm0FVr67ecqx52MkyTG1d4J4GAZafCFHYLXLN94e"
```

---

### 2. `notices` - 失物招领信息表

存储用户发布的失物（lost）或拾物（found）信息。

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 信息唯一标识 |
| `user_id` | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | 发布者用户 ID |
| `type` | ENUM('lost', 'found') | NOT NULL | 类型：lost=寻物启事，found=拾物招领 |
| `title` | VARCHAR(255) | NOT NULL | 标题（如"金色婚戒"） |
| `description` | TEXT | NOT NULL | 详细描述 |
| `category` | VARCHAR(100) | NOT NULL | 主分类（如"珠宝"、"电子产品"） |
| `subcategory` | VARCHAR(100) | NULL | 子分类（可选） |
| `location_text` | VARCHAR(255) | NOT NULL | 地点描述（如"中央公园，纽约"） |
| `occurred_at` | DATE | NOT NULL | 丢失/拾取日期 |
| `reward_amount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 悬赏金额 |
| `status` | VARCHAR(30) | NOT NULL, DEFAULT 'active' | 状态（active/resolved/closed） |
| `view_count` | INT UNSIGNED | NOT NULL, DEFAULT 0 | 浏览次数 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 发布时间 |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 最后更新时间 |

**外键约束：**
- `fk_notices_user`: `user_id` REFERENCES `users(id)` ON DELETE RESTRICT ON UPDATE CASCADE

**索引：**
- PRIMARY KEY: `id`
- INDEX: `idx_notices_user_id` ON `user_id`
- INDEX: `idx_notices_created_at` ON `created_at`
- INDEX: `idx_notices_type_status` ON `(type, status)`

**示例数据：**
```sql
id: 1
user_id: 1
type: "lost"
title: "Gold Wedding Band"
description: "Plain gold band with engraving 'Forever 2020' on the inside."
category: "Jewelry"
location_text: "Central Park, NY"
occurred_at: "2023-10-24"
reward_amount: 50.00
status: "active"
```

---

### 3. `notice_images` - 失物招领图片表

存储每条失物招领信息关联的图片 URL（支持多图）。

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 图片记录唯一标识 |
| `notice_id` | INT UNSIGNED | NOT NULL, FOREIGN KEY → notices(id) | 关联的失物招领信息 ID |
| `image_url` | TEXT | NOT NULL | 图片 URL |
| `sort_order` | INT UNSIGNED | NOT NULL, DEFAULT 1 | 显示顺序（用于多图排序） |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 上传时间 |

**外键约束：**
- `fk_notice_images_notice`: `notice_id` REFERENCES `notices(id)` ON DELETE CASCADE ON UPDATE CASCADE

**索引：**
- PRIMARY KEY: `id`
- INDEX: `idx_notice_images_notice_order` ON `(notice_id, sort_order)`

**说明：**
- 当 `notices` 记录被删除时，相关的图片记录会自动级联删除（CASCADE）

**示例数据：**
```sql
id: 1
notice_id: 1
image_url: "https://lh3.googleusercontent.com/..."
sort_order: 1
```

---

### 4. `responses` - 回复/留言表

存储用户对失物招领信息的回复和线索。

| 字段名 | 数据类型 | 约束 | 说明 |
|--------|---------|------|------|
| `id` | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 回复唯一标识 |
| `notice_id` | INT UNSIGNED | NOT NULL, FOREIGN KEY → notices(id) | 关联的失物招领信息 ID |
| `user_id` | INT UNSIGNED | NULL, FOREIGN KEY → users(id) | 回复者用户 ID（可为空，支持匿名） |
| `message` | TEXT | NOT NULL | 回复内容 |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 回复时间 |

**外键约束：**
- `fk_responses_notice`: `notice_id` REFERENCES `notices(id)` ON DELETE CASCADE ON UPDATE CASCADE
- `fk_responses_user`: `user_id` REFERENCES `users(id)` ON DELETE SET NULL ON UPDATE CASCADE

**索引：**
- PRIMARY KEY: `id`
- INDEX: `idx_responses_notice_created` ON `(notice_id, created_at)`

**说明：**
- 当 `notices` 记录被删除时，相关回复会自动级联删除
- 当 `users` 记录被删除时，该用户的回复会保留，但 `user_id` 会被设置为 NULL（匿名化）

**示例数据：**
```sql
id: 1
notice_id: 1
user_id: 2
message: "Hi Sarah, I was walking my dog near there around 3 PM..."
created_at: "2023-10-24 16:30:00"
```

---

## 关系说明

### 一对多关系 (1:N)

1. **users → notices**
   - 一个用户可以发布多条失物招领信息
   - 删除限制：用户有发布记录时无法删除（RESTRICT）

2. **notices → notice_images**
   - 一条失物招领信息可以有多张图片
   - 级联删除：删除信息时自动删除所有关联图片

3. **notices → responses**
   - 一条失物招领信息可以有多条回复
   - 级联删除：删除信息时自动删除所有回复

4. **users → responses**
   - 一个用户可以发表多条回复
   - 匿名化：删除用户时回复保留但 user_id 设为 NULL

---

## 数据完整性策略

### 外键删除规则

| 父表 | 子表 | 删除规则 | 说明 |
|------|------|---------|------|
| users | notices | RESTRICT | 有发布记录的用户无法删除 |
| users | responses | SET NULL | 删除用户时回复保留但匿名化 |
| notices | notice_images | CASCADE | 删除信息时自动删除图片 |
| notices | responses | CASCADE | 删除信息时自动删除回复 |

### 更新规则

所有外键约束的更新规则均为 `ON UPDATE CASCADE`，确保主键变更时自动同步。

---

## 初始化与种子数据

### 初始化命令

```bash
# 执行 schema（建表）
npm run db:schema

# 执行 seed（插入测试数据）
npm run db:seed

# 一键初始化（schema + seed）
npm run db:init
```

### 测试账号

| 姓名 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| Sarah Jenkins | sarah@example.com | password | 测试用户1，有3条发布记录 |
| Mike K. | mike@example.com | password | 测试用户2，有1条回复记录 |

### 测试数据概览

- **用户**：2 个测试账号
- **失物招领信息**：3 条（1条 lost，2条 found）
- **图片**：3 张（每条信息1张）
- **回复**：2 条（针对第1条信息的对话）

---

## 查询示例

### 获取用户的所有发布

```sql
SELECT n.*, ni.image_url
FROM notices n
LEFT JOIN notice_images ni ON n.id = ni.notice_id
WHERE n.user_id = 1
ORDER BY n.created_at DESC;
```

### 获取某条信息的完整详情（含图片和回复）

```sql
SELECT 
    n.*,
    u.name as author_name,
    u.avatar_url as author_avatar,
    GROUP_CONCAT(DISTINCT ni.image_url ORDER BY ni.sort_order) as images,
    COUNT(DISTINCT r.id) as response_count
FROM notices n
JOIN users u ON n.user_id = u.id
LEFT JOIN notice_images ni ON n.id = ni.notice_id
LEFT JOIN responses r ON n.id = r.notice_id
WHERE n.id = 1
GROUP BY n.id;
```

### 获取最新的失物招领列表

```sql
SELECT 
    n.id,
    n.type,
    n.title,
    n.category,
    n.location_text,
    n.occurred_at,
    n.reward_amount,
    u.name as author_name,
    (SELECT image_url FROM notice_images WHERE notice_id = n.id ORDER BY sort_order LIMIT 1) as first_image
FROM notices n
JOIN users u ON n.user_id = u.id
WHERE n.status = 'active'
ORDER BY n.created_at DESC
LIMIT 20;
```

### 搜索功能（按标题或描述）

```sql
SELECT n.*, u.name as author_name
FROM notices n
JOIN users u ON n.user_id = u.id
WHERE (n.title LIKE '%wallet%' OR n.description LIKE '%wallet%')
  AND n.status = 'active'
ORDER BY n.created_at DESC;
```

---

## 性能优化建议

### 已实施的优化

1. ✅ 为常用查询字段创建了索引（user_id, created_at, type+status）
2. ✅ 使用 UNSIGNED INT 减少存储空间
3. ✅ 为 email 字段创建唯一索引，加速登录查询
4. ✅ 使用复合索引 (notice_id, sort_order) 优化图片排序

### 未来可考虑的优化

- 📌 为 `notices.title` 和 `notices.description` 添加全文索引（FULLTEXT）以支持高效搜索
- 📌 为 `notices.location_text` 添加地理位置索引（如集成 PostGIS）
- 📌 实现图片 CDN 缓存策略
- 📌 添加 Redis 缓存热门查询结果

---

## 安全性说明

### 密码存储

- 使用 `bcryptjs` 进行密码哈希（cost factor = 10）
- 密码哈希格式：`$2b$10$...`（60字符）
- 绝不存储明文密码

### SQL 注入防护

- 所有数据库查询使用参数化查询（prepared statements）
- 通过 `mysql2/promise` 的 `pool.query(sql, [params])` 自动转义

### 会话管理

- 使用 `express-session` 管理用户会话
- Session 数据存储在服务器内存（生产环境建议使用 Redis）
- Cookie 配置：`httpOnly: true`, `sameSite: 'lax'`

---

## 备份与恢复

### 备份数据库

```bash
# 备份整个数据库
mysqldump -u root -p findit > backup_findit_$(date +%Y%m%d).sql

# 仅备份结构（不含数据）
mysqldump -u root -p --no-data findit > schema_only.sql

# 仅备份数据（不含结构）
mysqldump -u root -p --no-create-info findit > data_only.sql
```

### 恢复数据库

```bash
# 从备份文件恢复
mysql -u root -p findit < backup_findit_20231024.sql
```

---

## 环境配置

数据库连接配置存储在 `.env` 文件中：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=findit
DB_PORT=3306
```

连接池配置（`src/config/db.js`）：
- 最大连接数：10
- 连接超时：10秒
- 字符集：utf8mb4

---

## 相关文件

- **Schema 定义**: `src/db/schema.sql`
- **种子数据**: `src/db/seed.sql`
- **数据库连接**: `src/config/db.js`
- **用户模型**: `src/models/userModel.js`
- **失物招领模型**: `src/models/noticeModel.js`
- **初始化脚本**: `scripts/db-schema.js`, `scripts/db-seed.js`

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0 | 2026-02-27 | 初始版本：用户认证、失物招领核心功能 |

---

## 联系方式

如有数据库相关问题，请联系项目维护者。
