# 暖课堂 · 后端接口设计文档

> 面向大学授课场景 · Flask 3.x + Flask Blueprint 风格
> 前端适配层：`src/services/repository.ts` / `httpRepository.ts`
> 本文所有端点与前端 Repository 方法一一对应，替换 `VITE_DATA_SOURCE=http` 即可切换。

---

## 1. 通用约定

### 1.1 Base URL
```
{ VITE_API_BASE_URL }   例如 http://localhost:5000/api
```

### 1.2 统一响应体
成功：
```json
{ "code": 0, "message": "ok", "data": { ... } }
```
失败：
```json
{ "code": 4001, "message": "课程名称不能为空", "data": null }
```

| code 段 | 含义 |
|---|---|
| 0 | 成功 |
| 4001 | 参数校验失败 |
| 4004 | 资源不存在 |
| 4009 | 时段冲突（HTTP 409） |
| 4101 | 未登录 |
| 4103 | 无权限 |
| 5000 | 服务端错误 |

### 1.3 认证
- 采用 Flask session（Cookie）或 JWT，前端 `fetch` 已带 `credentials: 'include'`。
- 未登录访问受保护端点返回 HTTP 401 + `code: 4101`。
- 角色：teacher / student / admin，通过 `users.role` 判定。

### 1.4 请求/响应格式
- `Content-Type: application/json`
- 字符串 ID；时间 `YYYY-MM-DD HH:mm:ss`；学期字符串见 `DATABASE.md`

### 1.5 HTTP 方法语义
| 方法 | 用途 |
|---|---|
| GET | 查询（列表/详情） |
| POST | 新建 |
| PUT | 整体/局部更新（前端发局部字段） |
| DELETE | 删除（班级为级联删除） |

---

## 2. 启动聚合

### `GET /api/bootstrap`
一次性返回全部集合，供应用启动。对应 `repository.loadAll()`。

**响应 data：**
```json
{
  "classes": [ ...ClassInfo ],
  "students": [ ...Student ],
  "teachers": [ ...Teacher ],
  "adminCourses": [ ...AdminCourse ],
  "schedule": [ ...CourseEvent ]
}
```
> 生产环境建议按角色裁剪（学生端不应拿到全校教师档案）。

---

## 3. 资源 CRUD（通用模式）

前端 Repository 的 5 个集合映射如下：

| 前端 key | REST 资源 | 说明 |
|---|---|---|
| classes | `/api/classes` | 行政班 |
| students | `/api/students` | 学生 |
| teachers | `/api/teachers` | 教师 |
| adminCourses | `/api/courses` | 课程 |
| schedule | `/api/schedules` | 课表条目 |

每个资源统一提供：

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/{resource}` | GET | 列表，支持 `?keyword=&semester=&page=&size=` |
| `/api/{resource}` | POST | 新建，body=实体 JSON |
| `/api/{resource}/<id>` | GET | 详情 |
| `/api/{resource}/<id>` | PUT | 更新，body=局部字段 |
| `/api/{resource}/<id>` | DELETE | 删除 |

### 3.1 示例：班级

**新建** `POST /api/classes`
```json
{
  "name": "计科 2201 班",
  "subject": "计算机科学与技术",
  "studentCount": 48,
  "avgScore": 86.4,
  "trend": 3.2,
  "color": "#F2654C",
  "college": "计算机学院",
  "major": "计算机科学与技术",
  "grade": "大三",
  "code": "CS2201"
}
```
成功：`{ "code":0, "message":"ok", "data": { "id":"c...", "...": "..." } }`

**删除** `DELETE /api/classes/<id>`
> 服务端在单事务内：删除班级 → 删除/解绑其学生 → 清理相关课程与课表条目。
> 对应前端 `DataContext.deleteClass` 的级联语义。

### 3.2 示例：教师

**新建** `POST /api/teachers`
```json
{
  "name": "王静怡",
  "subject": "计算机科学与技术",
  "title": "教授",
  "college": "计算机学院",
  "degree": "博士",
  "research": "分布式系统",
  "classes": 3,
  "students": 138,
  "years": 12,
  "status": "在职"
}
```

### 3.3 示例：课程（含大学字段）

**新建** `POST /api/courses`
```json
{
  "title": "数据结构与算法",
  "teacher": "王静怡",
  "className": "计科 2201 班",
  "code": "CS201",
  "credits": 4,
  "hours": 64,
  "semester": "2026-2027学年第一学期",
  "day": 0,
  "start": 1,
  "duration": 2,
  "room": "信息楼 A-301",
  "type": "lecture",
  "status": "进行中",
  "color": "#F2654C"
}
```

### 3.4 示例：课表条目（含时段冲突）

**新建** `POST /api/schedules`
```json
{
  "title": "数据结构 · 计科2201",
  "code": "CS201",
  "credits": 4,
  "hours": 64,
  "semester": "2026-2027学年第一学期",
  "day": 0, "start": 1, "duration": 2,
  "room": "信息楼 A-301",
  "classId": "c1", "color": "#F2654C", "type": "lecture"
}
```

**时段冲突响应**（对应前端 `Schedule.tsx` 冲突检测）：
```
HTTP 409
{ "code": 4009, "message": "周一第1节已有课程「数据结构」，请换个时间", "data": null }
```
> 数据库层面用 `uq_slot` 唯一约束兜底（见 `DATABASE.md`）。

### 3.5 示例：学生（含大学字段）

**新建** `POST /api/students`
```json
{
  "name": "林知夏",
  "studentNo": "202222001",
  "classId": "c1",
  "major": "计算机科学与技术",
  "grade": "大三",
  "gpa": 3.6,
  "credits": 96,
  "attendance": 95,
  "avgScore": 88,
  "homeworkRate": 92,
  "participation": 78,
  "status": "excellent",
  "trend": 2.1
}
```

---

## 4. 系统端点

### `POST /api/system/reset`
重置为初始演示数据。**仅限非生产环境**，生产应返回 403。对应 `repository.resetAll()`。

### `POST /api/system/import`
一次性导入前端 localStorage 草稿数据（迁移用）。body 为 `bootstrap` 同结构。
> 导入前需做字段校验与去重（按 id）。

### `GET /api/meta/colleges` / `GET /api/meta/majors` / `GET /api/meta/semesters`
返回下拉枚举，供表单使用。对应前端 `COLLEGES` / `MAJORS` / `SEMESTERS` 常量。
```json
{ "code":0, "data": ["计算机学院", "数学学院", "..."] }
```

---

## 5. 学情 / 成绩分析端点（可选，由后端聚合）

前端目前用静态 `mock.ts` 的分析数据。后端可提供实时聚合：

| 端点 | 说明 |
|---|---|
| `GET /api/analytics/overview?classId=&semester=` | 班级能力画像、知识点掌握度、教学建议 |
| `GET /api/analytics/scores/trend?classId=` | 历次考核趋势（对应 scoreTrend） |
| `GET /api/analytics/scores/distribution?classId=` | 分数段分布 |
| `GET /api/analytics/student/<id>/report` | 个人学情报告（雷达数据） |
| `GET /api/grades/student/<id>` | 学生成绩单（含绩点、排名、学分） |

响应结构可沿用 `mock.ts` 中同名数据的形状，前端无需改动图表组件。

---

## 6. Flask Blueprint 参考骨架

```python
# app/api/classes.py
from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Class

bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@bp.get('')
def list_classes():
    q = request.args.get('keyword', '')
    rows = Class.query.filter(Class.name.like(f'%{q}%'), Class.is_deleted == 0).all()
    return jsonify(code=0, message='ok', data=[c.to_dict() for c in rows])

@bp.post('')
def create_class():
    body = request.get_json()
    if not body.get('name') or not body.get('subject'):
        return jsonify(code=4001, message='班级名称和学科不能为空', data=None), 400
    c = Class(**body)
    db.session.add(c)
    db.session.commit()
    return jsonify(code=0, message='ok', data=c.to_dict()), 201

@bp.delete('/<cid>')
def delete_class(cid):
    c = Class.query.get_or_404(cid)
    # 级联：单事务内清理学生/课程/课表
    ...
    db.session.commit()
    return jsonify(code=0, message='ok', data=None)
```

注册：`app.register_blueprint(classes.bp)`

---

## 7. 前端切换检查清单

1. 复制 `.env.example` 为 `.env.local`，设置：
   ```
   VITE_DATA_SOURCE=http
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
2. 实现 `[2]`~`[6]` 中前端实际调用到的端点（至少 bootstrap + 5 组 CRUD + system/reset）。
3. 确认 CORS：`Flask-CORS` 允许前端域名，且 `supports_credentials=True`。
4. 确认所有端点返回统一响应体 `{code, message, data}` — `httpRepository.request()` 依赖 `json.code !== 0` 判错。
5. 打开浏览器控制台（`API_DEBUG=true` 时打印每条请求）观察调用。
6. **错误回退规则**：网络不可达 / 超时 / 5xx 会自动回退本地数据并在控制台告警，保证演示不白屏；
   但 **4xx 业务错误（如 409 时段冲突）会透传**，前端会回滚该次改动并广播 `data-error` 自定义事件，
   页面监听该事件即可展示提示（如"该时段已有课程"）。严禁把业务错误也静默回退——会造成"以为保存成功"的假象。

---

## 8. 与前端 Repository 方法对照表

| 前端方法 | HTTP | 端点 |
|---|---|---|
| `repo.loadAll()` | GET | `/api/bootstrap` |
| `repo.list('classes')` | GET | `/api/classes` |
| `repo.getById('students', id)` | GET | `/api/students/<id>` |
| `repo.create('teachers', t)` | POST | `/api/teachers` |
| `repo.update('adminCourses', id, patch)` | PUT | `/api/courses/<id>` |
| `repo.remove('schedule', id)` | DELETE | `/api/schedules/<id>` |
| `repo.resetAll()` | POST | `/api/system/reset` |
| `repo.saveSnapshot(data)` | — | 空操作（级联由后端事务保证） |
