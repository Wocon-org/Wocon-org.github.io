# 行程管理 API 设计

## 1. 数据库结构

### 1.1 现有表结构

#### trips 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY | 行程ID |
| name | TEXT | NOT NULL | 行程名称 |
| description | TEXT | | 行程描述 |
| type | TEXT | NOT NULL CHECK (type IN ('private', 'recruiting')) | 行程类型 |
| max_participants | INTEGER | DEFAULT 2 | 最大参与者数量 |
| is_public | BOOLEAN | DEFAULT false | 是否公开 |
| cover_image_url | TEXT | | 行程封面图URL |
| owner_id | UUID | NOT NULL REFERENCES public.profiles(id) | 行程创建者ID |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新时间 |

#### trip_participants 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY | 参与者ID |
| trip_id | UUID | NOT NULL REFERENCES public.trips(id) | 行程ID |
| user_id | UUID | NOT NULL REFERENCES public.profiles(id) | 用户ID |
| status | TEXT | NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')) | 参与状态 |
| joined_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 加入时间 |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| UNIQUE(trip_id, user_id) | | | 确保用户在同一行程中只有一条记录 |

#### map_markers 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY | 标记ID |
| trip_id | UUID | NOT NULL REFERENCES public.trips(id) | 行程ID |
| lat | FLOAT | NOT NULL | 纬度 |
| lng | FLOAT | NOT NULL | 经度 |
| title | TEXT | | 标记标题 |
| description | TEXT | | 标记描述 |
| category | TEXT | DEFAULT 'point_of_interest' | 标记类别 |
| order_index | INTEGER | DEFAULT 0 | 排序索引 |
| created_by | UUID | NOT NULL REFERENCES public.profiles(id) | 创建者ID |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新时间 |

#### routes 表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| id | UUID | PRIMARY KEY | 路线ID |
| trip_id | UUID | NOT NULL REFERENCES public.trips(id) | 行程ID |
| name | TEXT | | 路线名称 |
| description | TEXT | | 路线描述 |
| coordinates | JSONB | NOT NULL | 路线坐标 |
| distance | FLOAT | | 路线距离 |
| duration | INTEGER | | 路线时长（分钟） |
| color | TEXT | DEFAULT '#667eea' | 路线颜色 |
| order_index | INTEGER | DEFAULT 0 | 排序索引 |
| created_by | UUID | NOT NULL REFERENCES public.profiles(id) | 创建者ID |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 更新时间 |

### 1.2 新增字段和表

#### trips 表新增字段
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|---------|------|------|
| start_date | TIMESTAMP WITH TIME ZONE | | 行程开始时间 |
| end_date | TIMESTAMP WITH TIME ZONE | | 行程结束时间 |
| destination | TEXT | | 行程目的地 |
| budget | DECIMAL(10,2) | | 行程预算 |
| tags | TEXT[] | | 行程标签 |

## 2. API 设计

### 2.1 行程管理 API

#### 2.1.1 行程 CRUD 操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/trips` | GET | 获取行程列表 | N/A | 行程列表 |
| `/api/trips/:id` | GET | 获取行程详情 | N/A | 行程详情 |
| `/api/trips` | POST | 创建行程 | 行程信息 | 创建的行程 |
| `/api/trips/:id` | PUT | 更新行程 | 行程信息 | 更新后的行程 |
| `/api/trips/:id` | DELETE | 删除行程 | N/A | 删除结果 |

#### 2.1.2 行程参与者管理

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/trips/:id/participants` | GET | 获取行程参与者 | N/A | 参与者列表 |
| `/api/trips/:id/join` | POST | 加入行程 | N/A | 加入结果 |
| `/api/trips/:id/leave` | POST | 离开行程 | N/A | 离开结果 |
| `/api/participants/:id/accept` | PUT | 接受参与者 | N/A | 接受结果 |
| `/api/participants/:id/decline` | PUT | 拒绝参与者 | N/A | 拒绝结果 |

#### 2.1.3 行程标记管理

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/trips/:id/markers` | GET | 获取行程标记 | N/A | 标记列表 |
| `/api/markers` | POST | 创建标记 | 标记信息 | 创建的标记 |
| `/api/markers/:id` | PUT | 更新标记 | 标记信息 | 更新后的标记 |
| `/api/markers/:id` | DELETE | 删除标记 | N/A | 删除结果 |

#### 2.1.4 行程路线管理

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/trips/:id/routes` | GET | 获取行程路线 | N/A | 路线列表 |
| `/api/routes` | POST | 创建路线 | 路线信息 | 创建的路线 |
| `/api/routes/:id` | PUT | 更新路线 | 路线信息 | 更新后的路线 |
| `/api/routes/:id` | DELETE | 删除路线 | N/A | 删除结果 |

### 2.2 用户资料管理 API

#### 2.2.1 用户资料操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/users/:id/profile` | GET | 获取用户资料 | N/A | 用户资料 |
| `/api/users/:id/profile` | PUT | 更新用户资料 | 资料信息 | 更新后的资料 |
| `/api/users/:id/avatar` | POST | 上传用户头像 | 头像文件 | 上传结果 |

### 2.3 连接管理 API

#### 2.3.1 连接操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/connections` | GET | 获取连接列表 | N/A | 连接列表 |
| `/api/connections/requests` | GET | 获取连接请求 | N/A | 请求列表 |
| `/api/connections` | POST | 发送连接请求 | 目标用户ID | 请求结果 |
| `/api/connections/:id/accept` | PUT | 接受连接请求 | N/A | 接受结果 |
| `/api/connections/:id/decline` | PUT | 拒绝连接请求 | N/A | 拒绝结果 |
| `/api/connections/:id` | DELETE | 删除连接 | N/A | 删除结果 |

### 2.4 通知系统 API

#### 2.4.1 通知操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/notifications` | GET | 获取通知列表 | N/A | 通知列表 |
| `/api/notifications/:id` | PUT | 标记通知为已读 | N/A | 标记结果 |
| `/api/notifications/read-all` | PUT | 标记所有通知为已读 | N/A | 标记结果 |
| `/api/notifications/:id` | DELETE | 删除通知 | N/A | 删除结果 |

### 2.5 文件上传 API

#### 2.5.1 文件操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/upload/avatar` | POST | 上传头像 | 头像文件 | 上传结果 |
| `/api/upload/trip-cover` | POST | 上传行程封面 | 封面文件 | 上传结果 |
| `/api/upload/marker-image` | POST | 上传标记图片 | 图片文件 | 上传结果 |

## 3. 数据模型

### 3.1 行程模型

```typescript
interface Trip {
  id: string
  name: string
  description?: string
  type: 'private' | 'recruiting'
  max_participants: number
  is_public: boolean
  cover_image_url?: string
  owner_id: string
  created_at: string
  updated_at: string
  start_date?: string
  end_date?: string
  destination?: string
  budget?: number
  tags?: string[]
  participants?: TripParticipant[]
  markers?: MapMarker[]
  routes?: Route[]
}

interface CreateTripInput {
  name: string
  description?: string
  type: 'private' | 'recruiting'
  max_participants?: number
  is_public?: boolean
  cover_image_url?: string
  start_date?: string
  end_date?: string
  destination?: string
  budget?: number
  tags?: string[]
}

interface UpdateTripInput {
  name?: string
  description?: string
  type?: 'private' | 'recruiting'
  max_participants?: number
  is_public?: boolean
  cover_image_url?: string
  start_date?: string
  end_date?: string
  destination?: string
  budget?: number
  tags?: string[]
}
```

### 3.2 用户模型

```typescript
interface Profile {
  id: string
  username: string
  nickname?: string
  email?: string
  score?: number
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface UpdateProfileInput {
  username?: string
  nickname?: string
  bio?: string
  avatar_url?: string
}
```

### 3.3 连接模型

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
  friend_id: string
  username: string
  nickname?: string
  avatar_url?: string
  bio?: string
  request_status: 'sent' | 'received' | 'accepted' | 'blocked'
}
```

### 3.4 通知模型

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
```

### 3.5 标记和路线模型

```typescript
interface MapMarker {
  id: string
  trip_id: string
  lat: number
  lng: number
  title?: string
  description?: string
  category: string
  order_index: number
  created_by: string
  created_at: string
  updated_at: string
}

interface Route {
  id: string
  trip_id: string
  name?: string
  description?: string
  coordinates: any[]
  distance?: number
  duration?: number
  color: string
  order_index: number
  created_by: string
  created_at: string
  updated_at: string
}
```

## 4. 实现计划

1. **数据库结构更新**：
   - 为 trips 表添加新字段
   - 创建 notifications 表

2. **API 实现**：
   - 完善行程 CRUD 操作
   - 实现行程参与者管理
   - 实现行程标记和路线管理
   - 完善用户资料管理
   - 完善连接管理
   - 实现通知系统
   - 完善文件上传功能

3. **前端实现**：
   - 行程管理页面
   - 用户资料页面
   - 连接管理页面
   - 通知中心页面
   - 文件上传组件

4. **测试**：
   - API 测试
   - 前端测试
   - 集成测试

## 5. 安全性考虑

1. **认证和授权**：
   - 使用 Supabase Auth 进行用户认证
   - 实现基于角色的访问控制

2. **数据验证**：
   - 前端数据验证
   - 后端数据验证

3. **文件上传安全**：
   - 限制文件类型
   - 限制文件大小
   - 使用安全的文件存储路径

4. **API 安全**：
   - 防止 SQL 注入
   - 防止 XSS 攻击
   - 防止 CSRF 攻击

## 6. 性能优化

1. **数据库优化**：
   - 创建合适的索引
   - 使用视图优化查询

2. **API 优化**：
   - 实现缓存
   - 分页查询
   - 批量操作

3. **前端优化**：
   - 懒加载
   - 组件缓存
   - 减少 HTTP 请求

## 7. 总结

本设计文档详细说明了行程管理系统的 API 和数据库结构，包括行程 CRUD 操作、用户资料管理、连接管理、通知系统和文件上传功能。通过实现这些功能，用户可以创建和管理行程，邀请朋友参与，添加标记和路线，接收通知，以及上传文件。

该设计考虑了安全性和性能优化，确保系统的稳定运行和良好的用户体验。