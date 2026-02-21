# 通知系统 API 设计

## 1. 数据库结构

### 1.1 通知表结构

#### notifications 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY DEFAULT uuid_generate_v4() | 通知ID |
| user_id | UUID | NOT NULL REFERENCES public.profiles(id) | 接收通知的用户ID |
| type | TEXT | NOT NULL CHECK (type IN ('trip_invitation', 'trip_update', 'friend_request', 'friend_accepted', 'system')) | 通知类型 |
| title | TEXT | NOT NULL | 通知标题 |
| content | TEXT | NOT NULL | 通知内容 |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| related_id | UUID | | 相关资源ID（如行程ID、用户ID等） |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT TIMEZONE('utc'::text, NOW()) | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT TIMEZONE('utc'::text, NOW()) | 更新时间 |

### 1.2 索引设计

| 索引名 | 表名 | 字段 | 类型 | 描述 |
|--------|------|------|------|------|
| idx_notifications_user | notifications | user_id | B-tree | 按用户ID查询通知 |
| idx_notifications_read | notifications | user_id, is_read | B-tree | 按用户ID和已读状态查询通知 |
| idx_notifications_created | notifications | user_id, created_at | B-tree | 按用户ID和创建时间查询通知 |

### 1.3 权限设置

#### 通知表权限

| 权限名称 | 操作 | 条件 | 描述 |
|---------|------|------|------|
| Users can view own notifications | SELECT | auth.uid() = user_id | 用户可以查看自己的通知 |
| Users can update own notifications | UPDATE | auth.uid() = user_id | 用户可以更新自己的通知（如标记为已读） |
| Users can delete own notifications | DELETE | auth.uid() = user_id | 用户可以删除自己的通知 |

## 2. API 设计

### 2.1 通知管理 API

#### 2.1.1 通知操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/notifications` | GET | 获取通知列表 | N/A | 通知列表 |
| `/api/notifications/unread` | GET | 获取未读通知 | N/A | 未读通知列表 |
| `/api/notifications/:id` | GET | 获取通知详情 | N/A | 通知详情 |
| `/api/notifications/:id/read` | PUT | 标记通知为已读 | N/A | 标记结果 |
| `/api/notifications/read-all` | PUT | 标记所有通知为已读 | N/A | 标记结果 |
| `/api/notifications/:id` | DELETE | 删除通知 | N/A | 删除结果 |
| `/api/notifications/delete-all` | DELETE | 删除所有通知 | N/A | 删除结果 |

### 2.2 通知创建 API

#### 2.2.1 内部通知创建

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/notifications` | POST | 创建通知（内部使用） | 通知信息 | 创建的通知 |

## 3. 数据模型

### 3.1 通知模型

```typescript
interface Notification {
  id: string
  user_id: string
  type: 'trip_invitation' | 'trip_update' | 'friend_request' | 'friend_accepted' | 'system'
  title: string
  content: string
  is_read: boolean
  related_id?: string
  created_at: string
  updated_at: string
}

interface CreateNotificationInput {
  user_id: string
  type: 'trip_invitation' | 'trip_update' | 'friend_request' | 'friend_accepted' | 'system'
  title: string
  content: string
  related_id?: string
}

interface NotificationWithUser {
  id: string
  type: 'trip_invitation' | 'trip_update' | 'friend_request' | 'friend_accepted' | 'system'
  title: string
  content: string
  is_read: boolean
  related_id?: string
  created_at: string
  user?: {
    id: string
    username: string
    avatar_url?: string
  }
}
```

## 4. 通知类型

### 4.1 通知类型说明

| 类型 | 描述 | 相关ID | 示例内容 |
|------|------|--------|----------|
| trip_invitation | 行程邀请 | 行程ID | "[用户名] 邀请你加入行程 [行程名称]" |
| trip_update | 行程更新 | 行程ID | "行程 [行程名称] 有更新" |
| friend_request | 好友请求 | 用户ID | "[用户名] 发送了好友请求" |
| friend_accepted | 好友请求已接受 | 用户ID | "[用户名] 接受了你的好友请求" |
| system | 系统通知 | 无 | "系统维护通知" |

## 5. API 实现

### 5.1 获取通知列表

**请求**：
- 方法：GET
- 端点：`/api/notifications`
- 查询参数：
  - `limit`：限制返回数量（默认 20）
  - `offset`：偏移量（默认 0）
  - `type`：按类型过滤
  - `is_read`：按已读状态过滤

**响应**：
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "trip_invitation",
      "title": "行程邀请",
      "content": "[用户名] 邀请你加入行程 [行程名称]",
      "is_read": false,
      "related_id": "trip_uuid",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z"
    }
  ],
  "error": null
}
```

### 5.2 获取未读通知

**请求**：
- 方法：GET
- 端点：`/api/notifications/unread`

**响应**：
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "friend_request",
      "title": "好友请求",
      "content": "[用户名] 发送了好友请求",
      "is_read": false,
      "related_id": "user_uuid",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z"
    }
  ],
  "error": null
}
```

### 5.3 标记通知为已读

**请求**：
- 方法：PUT
- 端点：`/api/notifications/:id/read`

**响应**：
```json
{
  "data": {
    "id": "uuid",
    "is_read": true
  },
  "error": null
}
```

### 5.4 标记所有通知为已读

**请求**：
- 方法：PUT
- 端点：`/api/notifications/read-all`

**响应**：
```json
{
  "data": {
    "updated": 5
  },
  "error": null
}
```

### 5.5 删除通知

**请求**：
- 方法：DELETE
- 端点：`/api/notifications/:id`

**响应**：
```json
{
  "data": {
    "deleted": true
  },
  "error": null
}
```

### 5.6 创建通知

**请求**：
- 方法：POST
- 端点：`/api/notifications`
- 请求体：
```json
{
  "user_id": "user_uuid",
  "type": "trip_invitation",
  "title": "行程邀请",
  "content": "[用户名] 邀请你加入行程 [行程名称]",
  "related_id": "trip_uuid"
}
```

**响应**：
```json
{
  "data": {
    "id": "uuid",
    "user_id": "user_uuid",
    "type": "trip_invitation",
    "title": "行程邀请",
    "content": "[用户名] 邀请你加入行程 [行程名称]",
    "is_read": false,
    "related_id": "trip_uuid",
    "created_at": "2026-02-16T10:00:00Z",
    "updated_at": "2026-02-16T10:00:00Z"
  },
  "error": null
}
```

## 6. 通知触发场景

### 6.1 行程邀请

当用户被邀请加入行程时，系统自动创建通知。

**触发条件**：
- 用户点击 "邀请" 按钮邀请其他用户加入行程
- 系统调用通知创建 API 创建通知

### 6.2 行程更新

当行程信息更新时，系统自动创建通知给所有行程参与者。

**触发条件**：
- 行程所有者更新行程信息
- 系统调用通知创建 API 为所有参与者创建通知

### 6.3 好友请求

当用户收到好友请求时，系统自动创建通知。

**触发条件**：
- 用户发送好友请求
- 系统调用通知创建 API 为目标用户创建通知

### 6.4 好友请求已接受

当用户的好友请求被接受时，系统自动创建通知。

**触发条件**：
- 用户接受好友请求
- 系统调用通知创建 API 为发送请求的用户创建通知

### 6.5 系统通知

当系统需要发送通知给用户时，管理员手动创建通知。

**触发条件**：
- 管理员通过管理界面创建系统通知
- 系统调用通知创建 API 为目标用户或所有用户创建通知

## 7. 前端实现

### 7.1 通知中心

#### 功能
- 显示通知列表
- 标记通知为已读
- 删除通知
- 按类型过滤通知
- 按已读状态过滤通知

#### 组件结构
- `NotificationCenter.vue`：通知中心主组件
- `NotificationItem.vue`：单个通知组件
- `NotificationFilter.vue`：通知过滤器组件

### 7.2 通知徽章

#### 功能
- 显示未读通知数量
- 点击打开通知中心

#### 组件结构
- `NotificationBadge.vue`：通知徽章组件

### 7.3 通知设置

#### 功能
- 设置通知偏好
- 开启/关闭邮件通知
- 开启/关闭特定类型的通知

#### 组件结构
- `NotificationSettings.vue`：通知设置组件

## 8. 邮件通知

### 8.1 邮件通知配置

| 通知类型 | 默认开启 | 描述 |
|---------|---------|------|
| trip_invitation | 开启 | 行程邀请邮件 |
| trip_update | 开启 | 行程更新邮件 |
| friend_request | 开启 | 好友请求邮件 |
| friend_accepted | 开启 | 好友请求已接受邮件 |
| system | 开启 | 系统通知邮件 |

### 8.2 邮件模板

#### 行程邀请邮件
```html
<h1>行程邀请</h1>
<p>你好，{{ username }}！</p>
<p>{{ inviter_name }} 邀请你加入行程 <strong>{{ trip_name }}</strong>。</p>
<p>点击下方链接查看行程详情：</p>
<a href="{{ trip_url }}">查看行程</a>
<p>如果不是你操作，请忽略此邮件。</p>
<p>此致，<br>Wocon 团队</p>
```

#### 好友请求邮件
```html
<h1>好友请求</h1>
<p>你好，{{ username }}！</p>
<p>{{ requester_name }} 发送了好友请求。</p>
<p>点击下方链接查看请求：</p>
<a href="{{ profile_url }}">查看请求</a>
<p>如果不是你操作，请忽略此邮件。</p>
<p>此致，<br>Wocon 团队</p>
```

## 9. 安全性考虑

1. **认证和授权**：
   - 使用 Supabase Auth 进行用户认证
   - 确保用户只能访问自己的通知

2. **数据验证**：
   - 前端数据验证
   - 后端数据验证

3. **防止滥用**：
   - 限制通知创建频率
   - 限制单个用户的通知数量

4. **隐私保护**：
   - 确保通知内容不包含敏感信息
   - 确保相关ID不会泄露用户隐私

## 10. 性能优化

1. **数据库优化**：
   - 使用合适的索引
   - 分页查询

2. **API 优化**：
   - 实现缓存
   - 批量操作

3. **前端优化**：
   - 懒加载通知
   - 组件缓存
   - 减少 HTTP 请求

## 11. 测试

1. **API 测试**：
   - 测试所有 API 端点
   - 测试错误处理
   - 测试权限验证

2. **前端测试**：
   - 测试通知中心组件
   - 测试通知徽章组件
   - 测试通知设置组件

3. **集成测试**：
   - 测试通知触发场景
   - 测试邮件通知
   - 测试通知与其他功能的集成

## 12. 总结

本设计文档详细说明了通知系统的 API 和数据库结构，包括通知类型、触发场景、前端实现和邮件通知。通过实现这些功能，用户可以及时收到行程邀请、行程更新、好友请求等通知，提高用户体验和系统互动性。

该设计考虑了安全性和性能优化，确保系统的稳定运行和良好的用户体验。