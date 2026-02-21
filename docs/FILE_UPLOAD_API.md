# 文件上传 API 设计

## 1. 存储结构

### 1.1 Supabase Storage 配置

#### 存储桶配置

| 存储桶名称 | 权限 | 描述 |
|-----------|------|------|
| avatars | 公开 | 用户头像存储 |
| trip-covers | 公开 | 行程封面图存储 |
| marker-images | 公开 | 地图标记图片存储 |
| user-files | 私有 | 用户私有文件存储 |
| trip-files | 私有 | 行程相关文件存储 |

### 1.2 存储路径结构

#### avatars 存储桶
```
avatars/
└── {user_id}/
    └── {timestamp}.{extension}
```

#### trip-covers 存储桶
```
trip-covers/
└── {trip_id}/
    └── {timestamp}.{extension}
```

#### marker-images 存储桶
```
marker-images/
└── {marker_id}/
    └── {timestamp}.{extension}
```

#### user-files 存储桶
```
user-files/
└── {user_id}/
    ├── documents/
    ├── images/
    └── other/
```

#### trip-files 存储桶
```
trip-files/
└── {trip_id}/
    ├── documents/
    ├── images/
    └── other/
```

## 2. API 设计

### 2.1 文件上传 API

#### 2.1.1 上传操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/upload/avatar` | POST | 上传用户头像 | 头像文件 | 上传结果 |
| `/api/upload/trip-cover` | POST | 上传行程封面 | 封面文件 | 上传结果 |
| `/api/upload/marker-image` | POST | 上传标记图片 | 图片文件 | 上传结果 |
| `/api/upload/user-file` | POST | 上传用户文件 | 文件 | 上传结果 |
| `/api/upload/trip-file` | POST | 上传行程文件 | 文件 | 上传结果 |

### 2.2 文件管理 API

#### 2.2.1 文件操作

| API 端点 | 方法 | 功能 | 请求体 | 响应 |
|---------|------|------|-------|------|
| `/api/files/user` | GET | 获取用户文件列表 | N/A | 文件列表 |
| `/api/files/trip/:id` | GET | 获取行程文件列表 | N/A | 文件列表 |
| `/api/files/:id` | GET | 获取文件详情 | N/A | 文件详情 |
| `/api/files/:id` | DELETE | 删除文件 | N/A | 删除结果 |
| `/api/files/:id/download` | GET | 下载文件 | N/A | 文件内容 |

## 3. 数据模型

### 3.1 文件模型

```typescript
interface FileInfo {
  id: string
  name: string
  path: string
  bucket_id: string
  size: number
  mime_type: string
  created_at: string
  updated_at: string
  url?: string
}

interface UploadFileResponse {
  data: {
    id: string
    path: string
    url: string
    size: number
    mime_type: string
  }
  error: any
}

interface FileListResponse {
  data: FileInfo[]
  error: any
}
```

## 4. API 实现

### 4.1 上传用户头像

**请求**：
- 方法：POST
- 端点：`/api/upload/avatar`
- 请求体：FormData
  - `file`：头像文件

**响应**：
```json
{
  "data": {
    "id": "file_id",
    "path": "avatars/user_id/timestamp.jpg",
    "url": "https://storage.googleapis.com/bucket/avatars/user_id/timestamp.jpg",
    "size": 102400,
    "mime_type": "image/jpeg"
  },
  "error": null
}
```

### 4.2 上传行程封面

**请求**：
- 方法：POST
- 端点：`/api/upload/trip-cover`
- 请求体：FormData
  - `file`：封面文件
  - `trip_id`：行程ID

**响应**：
```json
{
  "data": {
    "id": "file_id",
    "path": "trip-covers/trip_id/timestamp.jpg",
    "url": "https://storage.googleapis.com/bucket/trip-covers/trip_id/timestamp.jpg",
    "size": 204800,
    "mime_type": "image/jpeg"
  },
  "error": null
}
```

### 4.3 上传标记图片

**请求**：
- 方法：POST
- 端点：`/api/upload/marker-image`
- 请求体：FormData
  - `file`：图片文件
  - `marker_id`：标记ID

**响应**：
```json
{
  "data": {
    "id": "file_id",
    "path": "marker-images/marker_id/timestamp.jpg",
    "url": "https://storage.googleapis.com/bucket/marker-images/marker_id/timestamp.jpg",
    "size": 153600,
    "mime_type": "image/jpeg"
  },
  "error": null
}
```

### 4.4 上传用户文件

**请求**：
- 方法：POST
- 端点：`/api/upload/user-file`
- 请求体：FormData
  - `file`：文件
  - `category`：文件类别（documents/images/other）

**响应**：
```json
{
  "data": {
    "id": "file_id",
    "path": "user-files/user_id/documents/timestamp.pdf",
    "url": "https://storage.googleapis.com/bucket/user-files/user_id/documents/timestamp.pdf",
    "size": 512000,
    "mime_type": "application/pdf"
  },
  "error": null
}
```

### 4.5 上传行程文件

**请求**：
- 方法：POST
- 端点：`/api/upload/trip-file`
- 请求体：FormData
  - `file`：文件
  - `trip_id`：行程ID
  - `category`：文件类别（documents/images/other）

**响应**：
```json
{
  "data": {
    "id": "file_id",
    "path": "trip-files/trip_id/documents/timestamp.pdf",
    "url": "https://storage.googleapis.com/bucket/trip-files/trip_id/documents/timestamp.pdf",
    "size": 512000,
    "mime_type": "application/pdf"
  },
  "error": null
}
```

### 4.6 获取用户文件列表

**请求**：
- 方法：GET
- 端点：`/api/files/user`
- 查询参数：
  - `category`：文件类别（可选）
  - `limit`：限制返回数量（默认 20）
  - `offset`：偏移量（默认 0）

**响应**：
```json
{
  "data": [
    {
      "id": "file_id",
      "name": "document.pdf",
      "path": "user-files/user_id/documents/timestamp.pdf",
      "bucket_id": "user-files",
      "size": 512000,
      "mime_type": "application/pdf",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z",
      "url": "https://storage.googleapis.com/bucket/user-files/user_id/documents/timestamp.pdf"
    }
  ],
  "error": null
}
```

### 4.7 获取行程文件列表

**请求**：
- 方法：GET
- 端点：`/api/files/trip/:id`
- 查询参数：
  - `category`：文件类别（可选）
  - `limit`：限制返回数量（默认 20）
  - `offset`：偏移量（默认 0）

**响应**：
```json
{
  "data": [
    {
      "id": "file_id",
      "name": "itinerary.pdf",
      "path": "trip-files/trip_id/documents/timestamp.pdf",
      "bucket_id": "trip-files",
      "size": 512000,
      "mime_type": "application/pdf",
      "created_at": "2026-02-16T10:00:00Z",
      "updated_at": "2026-02-16T10:00:00Z",
      "url": "https://storage.googleapis.com/bucket/trip-files/trip_id/documents/timestamp.pdf"
    }
  ],
  "error": null
}
```

### 4.8 删除文件

**请求**：
- 方法：DELETE
- 端点：`/api/files/:id`

**响应**：
```json
{
  "data": {
    "deleted": true
  },
  "error": null
}
```

## 3. 前端实现

### 3.1 文件上传组件

#### 功能
- 拖拽上传
- 文件选择器
- 上传进度显示
- 上传结果反馈
- 文件类型验证
- 文件大小验证

#### 组件结构
- `FileUploader.vue`：文件上传主组件
- `DragAndDrop.vue`：拖拽上传组件
- `FileInput.vue`：文件选择器组件
- `UploadProgress.vue`：上传进度组件

### 3.2 文件管理组件

#### 功能
- 文件列表显示
- 文件预览
- 文件下载
- 文件删除
- 文件夹管理

#### 组件结构
- `FileManager.vue`：文件管理主组件
- `FileList.vue`：文件列表组件
- `FileItem.vue`：单个文件组件
- `FilePreview.vue`：文件预览组件

### 3.3 头像上传组件

#### 功能
- 头像预览
- 头像裁剪
- 头像上传

#### 组件结构
- `AvatarUploader.vue`：头像上传组件
- `AvatarCropper.vue`：头像裁剪组件

### 3.4 行程封面上传组件

#### 功能
- 封面预览
- 封面上传
- 封面管理

#### 组件结构
- `TripCoverUploader.vue`：行程封面上传组件

## 4. 安全性考虑

1. **文件类型验证**：
   - 前端验证文件类型
   - 后端验证文件类型
   - 限制允许的文件类型

2. **文件大小限制**：
   - 前端限制文件大小
   - 后端限制文件大小
   - 不同类型文件设置不同的大小限制

3. **文件路径安全**：
   - 使用安全的文件命名方式
   - 避免路径遍历攻击
   - 验证文件路径权限

4. **文件内容安全**：
   - 扫描上传文件内容
   - 防止恶意文件上传
   - 限制可执行文件上传

5. **访问控制**：
   - 验证用户权限
   - 确保用户只能访问自己的文件
   - 确保用户只能访问有权限的行程文件

## 5. 性能优化

1. **上传优化**：
   - 实现分块上传
   - 实现断点续传
   - 优化上传速度

2. **存储优化**：
   - 压缩图片文件
   - 优化文件存储
   - 实现文件缓存

3. **前端优化**：
   - 懒加载文件列表
   - 组件缓存
   - 减少 HTTP 请求

4. **后端优化**：
   - 实现文件处理队列
   - 优化文件存储操作
   - 实现文件元数据缓存

## 6. 文件类型限制

### 6.1 允许的文件类型

#### 图片文件
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

#### 文档文件
- PDF (.pdf)
- DOCX (.docx)
- DOC (.doc)
- XLSX (.xlsx)
- XLS (.xls)
- PPTX (.pptx)
- PPT (.ppt)
- TXT (.txt)
- MD (.md)

#### 其他文件
- ZIP (.zip)
- RAR (.rar)
- MP4 (.mp4)
- MP3 (.mp3)

### 6.2 文件大小限制

| 文件类型 | 大小限制 |
|---------|----------|
| 头像 | 5MB |
| 行程封面 | 10MB |
| 标记图片 | 5MB |
| 文档 | 20MB |
| 其他文件 | 50MB |

## 7. 错误处理

### 7.1 常见错误

| 错误代码 | 描述 | 处理方式 |
|---------|------|----------|
| FILE_TOO_LARGE | 文件过大 | 显示错误信息，提示用户上传更小的文件 |
| INVALID_FILE_TYPE | 文件类型无效 | 显示错误信息，提示用户上传允许的文件类型 |
| UPLOAD_FAILED | 上传失败 | 显示错误信息，提示用户重试 |
| PERMISSION_DENIED | 权限不足 | 显示错误信息，提示用户登录或请求权限 |
| STORAGE_ERROR | 存储错误 | 显示错误信息，提示用户联系管理员 |

### 7.2 错误处理流程

1. **前端错误处理**：
   - 验证文件类型和大小
   - 显示友好的错误信息
   - 提供重试选项

2. **后端错误处理**：
   - 验证文件类型和大小
   - 验证用户权限
   - 返回标准化的错误响应

## 8. 测试

1. **API 测试**：
   - 测试文件上传
   - 测试文件下载
   - 测试文件删除
   - 测试文件列表
   - 测试错误处理

2. **前端测试**：
   - 测试文件上传组件
   - 测试文件管理组件
   - 测试头像上传组件
   - 测试行程封面上传组件

3. **集成测试**：
   - 测试完整的文件上传流程
   - 测试文件权限控制
   - 测试文件与其他功能的集成

## 9. 总结

本设计文档详细说明了文件上传系统的 API 和存储结构，包括用户头像、行程封面、地图标记图片和其他文件的上传和管理功能。通过实现这些功能，用户可以上传和管理各种类型的文件，为行程规划和用户互动提供更多的可能性。

该设计考虑了安全性和性能优化，确保系统的稳定运行和良好的用户体验。