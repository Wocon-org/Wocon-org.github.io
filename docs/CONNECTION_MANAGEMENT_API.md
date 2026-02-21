# 连接管理 API 设计

## 1. 数据库结构

### 1.1 连接表结构

#### friends 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | 连接ID |
| user_id | UUID | NOT NULL REFERENCES public.profiles(id) | 发起连接的用户ID |
| friend_id | UUID | NOT NULL REFERENCES public.profiles(id) | 接收连接的用户ID |
| status | TEXT | NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')) | 连接状态 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT TIMEZONE('utc'::text, NOW()) | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT TIMEZONE('utc'::text, NOW()) | 更新时间 |
| UNIQUE(user_id, friend_id) | | | 确保用户之间只有一条连接记录 |

### 1.2 索引设计

| 索引名 | 表名 | 字段 | 类型 | 描述 |
|--------|------|------|------|------|
| idx_friends_user | friends | user_id | B-tree | 按用户ID查询连接 |
| idx_friends_friend | friends | friend_id | B-tree | 按好友ID查询连接 |
| idx_friends_status | friends | status | B-tree | 按状态查询连接 |
| idx_friends_user_status | friends | user_id, status | B-tree | 按用户ID和状态查询连接 |
| idx_friends_friend_status | friends | friend_id, status | B-tree | 按好友ID和状态查询连接 |

### 1.3 视图设计

#### user_friends 视图

```sql
CREATE OR REPLACE VIEW public.user_friends AS
SELECT
  f.id,
  f.status,
  f.created_at,
  f.updated_at,
  CASE
    WHEN f.user_id = auth.uid() THEN f.friend_id
    ELSE f.user_id
  END AS friend_id,
  CASE
    WHEN f.user_id = auth.uid() THEN p.username
    ELSE p.username
  END AS username,
  CASE
    WHEN f.user_id = auth.uid() THEN p.nickname
    ELSE p.nickname
  END AS nickname,
  CASE
    WHEN f.user_id = auth.uid() THEN p.avatar_url
    ELSE p.avatar_url
  END AS avatar_url,
  CASE
    WHEN f.user_id = auth.uid() THEN p.bio
    ELSE p.bio
  END AS bio,
  CASE
    WHEN f.user_id = auth.uid() THEN 'sent'
    WHEN f.friend_id = auth.uid() THEN 'received'
    ELSE 'accepted'
  END AS request_status
FROM public.friends f
JOIN public.profiles p ON (
  (f.user_id = auth.uid() AND p.id = f.friend_id)
  OR (f.friend_id = auth.uid() AND p.id = f.user_id)
)
WHERE
  f.user_id = auth.uid()
  OR f.friend_id = auth.uid();
```

## 2. API 设计

### 2.1 连接管理 API

#### 2.1.1 连接操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/connections` | GET | 获取连接列表 | N/A | 连接列表 |
| `/api/connections/requests` | GET | 获取连接请求 | N/A | 请求列表 |
| `/api/connections/sent` | GET | 获取已发送的请求 | N/A | 已发送请求列表 |
| `/api/connections` | POST | 发送连接请求 | `{ "friend_id": "user_uuid" }` | 请求结果 |
| `/api/connections/:id/accept` | PUT | 接受连接请求 | N/A | 接受结果 |
| `/api/connections/:id/decline` | PUT | 拒绝连接请求 | N/A | 拒绝结果 |
| `/api/connections/:id` | DELETE | 删除连接 | N/A | 删除结果 |
| `/api/connections/search` | GET | 搜索用户 | `{ "query": "username" }` | 搜索结果 |

### 2.2 连接状态管理

#### 2.2.1 状态转换

| 当前状态 | 操作 | 新状态 | 描述 |
|---------|------|--------|------|
| pending | 接受 | accepted | 连接请求被接受 |
| pending | 拒绝 | blocked | 连接请求被拒绝 |
| accepted | 删除 | - | 连接被删除 |
| blocked | 重新发送请求 | pending | 重新发送连接请求 |

## 3. 数据模型

### 3.1 连接模型

```typescript
interface Connection {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

interface ConnectionInfo {
  id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  friend_id: string
  username: string
  nickname?: string
  avatar_url?: string
  bio?: string
  request_status: 'sent' | 'received' | 'accepted' | 'blocked'
}

interface CreateConnectionInput {
  friend_id: string
}
```

## 4. API 实现

### 4.1 获取连接列表

**请求**：
- 方法：GET
- 端点：`/api/connections`
- 查询参数：
  - `status`：按状态过滤（可选）
  - `limit`：限制返回数量（默认 20）
  - `offset`：偏移量（默认 0）

**响应**：
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "accepted",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z",
      "friend_id": "user_uuid",
      "username": "user1",
      "nickname": "User One",
      "avatar_url": "https://example.com/avatar.jpg",
      "bio": "Travel enthusiast",
      "request_status": "accepted"
    }
  ],
  "error": null
}
```

### 4.2 获取连接请求

**请求**：
- 方法：GET
- 端点：`/api/connections/requests`

**响应**：
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "pending",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z",
      "friend_id": "user_uuid",
      "username": "user2",
      "nickname": "User Two",
      "avatar_url": "https://example.com/avatar2.jpg",
      "bio": "Adventure seeker",
      "request_status": "received"
    }
  ],
  "error": null
}
```

### 4.3 发送连接请求

**请求**：
- 方法：POST
- 端点：`/api/connections`
- 请求体：
```json
{
  "friend_id": "user_uuid"
}
```

**响应**：
```json
{
  "data": {
    "id": "uuid",
    "user_id": "current_user_uuid",
    "friend_id": "user_uuid",
    "status": "pending",
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "error": null
}
```

### 4.4 接受连接请求

**请求**：
- 方法：PUT
- 端点：`/api/connections/:id/accept`

**响应**：
```json
{
  "data": {
    "id": "uuid",
    "status": "accepted",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "error": null
}
```

### 4.5 拒绝连接请求

**请求**：
- 方法：PUT
- 端点：`/api/connections/:id/decline`

**响应**：
```json
{
  "data": {
    "id": "uuid",
    "status": "blocked",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "error": null
}
```

### 4.6 删除连接

**请求**：
- 方法：DELETE
- 端点：`/api/connections/:id`

**响应**：
```json
{
  "data": {
    "deleted": true
  },
  "error": null
}
```

### 4.7 搜索用户

**请求**：
- 方法：GET
- 端点：`/api/connections/search`
- 查询参数：
  - `query`：搜索关键词（用户名或昵称）
  - `limit`：限制返回数量（默认 20）

**响应**：
```json
{
  "data": [
    {
      "id": "user_uuid",
      "username": "user3",
      "nickname": "User Three",
      "avatar_url": "https://example.com/avatar3.jpg",
      "bio": "Travel blogger"
    }
  ],
  "error": null
}
```

## 5. 连接状态管理

### 5.1 状态说明

| 状态 | 描述 | 操作权限 |
|------|------|----------|
| pending | 连接请求已发送，等待对方接受 | 发送方：可以取消请求<br>接收方：可以接受或拒绝 |
| accepted | 连接已建立，双方成为好友 | 双方：可以删除连接 |
| blocked | 连接请求被拒绝或连接被阻止 | 双方：可以重新发送请求 |

### 5.2 状态转换

#### 发送连接请求
- 状态：无 → pending
- 条件：用户之间不存在连接记录
- 操作：创建连接记录，状态为 pending

#### 接受连接请求
- 状态：pending → accepted
- 条件：连接状态为 pending，且当前用户是接收方
- 操作：更新连接记录，状态为 accepted

#### 拒绝连接请求
- 状态：pending → blocked
- 条件：连接状态为 pending，且当前用户是接收方
- 操作：更新连接记录，状态为 blocked

#### 删除连接
- 状态：accepted → 无
- 条件：连接状态为 accepted
- 操作：删除连接记录

#### 重新发送请求
- 状态：blocked → pending
- 条件：连接状态为 blocked
- 操作：更新连接记录，状态为 pending

## 6. 前端实现

### 6.1 连接管理页面

#### 功能
- 显示连接列表
- 显示连接请求
- 发送连接请求
- 接受/拒绝连接请求
- 删除连接
- 搜索用户

#### 组件结构
- `ConnectionManagement.vue`：连接管理主组件
- `ConnectionList.vue`：连接列表组件
- `ConnectionRequestList.vue`：连接请求列表组件
- `ConnectionSearch.vue`：用户搜索组件

### 6.2 连接卡片

#### 功能
- 显示用户信息
- 显示连接状态
- 提供操作按钮（接受/拒绝/删除）

#### 组件结构
- `ConnectionCard.vue`：连接卡片组件

### 6.3 连接请求通知

#### 功能
- 显示新的连接请求通知
- 提供快速操作（接受/拒绝）

#### 组件结构
- `ConnectionRequestNotification.vue`：连接请求通知组件

## 7. 安全性考虑

1. **认证和授权**：
   - 使用 Supabase Auth 进行用户认证
   - 确保用户只能访问自己的连接

2. **数据验证**：
   - 前端数据验证
   - 后端数据验证

3. **防止滥用**：
   - 限制连接请求发送频率
   - 限制单个用户的连接数量

4. **隐私保护**：
   - 确保用户信息不被未授权访问
   - 提供连接隐私设置

## 8. 性能优化

1. **数据库优化**：
   - 使用合适的索引
   - 使用视图优化查询

2. **API 优化**：
   - 实现缓存
   - 分页查询

3. **前端优化**：
   - 懒加载连接列表
   - 组件缓存
   - 减少 HTTP 请求

## 9. 测试

1. **API 测试**：
   - 测试所有 API 端点
   - 测试错误处理
   - 测试权限验证

2. **前端测试**：
   - 测试连接管理页面
   - 测试连接卡片组件
   - 测试连接请求通知组件

3. **集成测试**：
   - 测试连接流程
   - 测试连接状态转换
   - 测试与其他功能的集成

## 10. 总结

本设计文档详细说明了连接管理系统的 API 和数据库结构，包括连接状态管理、API 实现、前端实现和安全性考虑。通过实现这些功能，用户可以发送和接受连接请求，管理自己的连接列表，以及搜索其他用户。

该设计考虑了安全性和性能优化，确保系统的稳定运行和良好的用户体验。