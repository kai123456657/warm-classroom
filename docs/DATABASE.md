# 暖课堂 · 数据库设计文档

> 面向大学授课场景 · 目标技术栈 Python 3.11 + Flask + SQLAlchemy 2.x + MySQL 8.0
> 本文档与前端 `src/types/index.ts` 一一对应，前端通过 REST API（见 `API.md`）访问，不直连数据库。

---

## 1. 设计约定

| 项 | 约定 |
|---|---|
| 主键 | 统一使用 `VARCHAR(24)` 字符串 ID（与前端 `genId` 生成的风格一致），或改为 `BIGINT AUTO_INCREMENT`，二选一；本文示例用字符串 |
| 时间 | 所有表含 `created_at` / `updated_at`（`DATETIME`，默认 `CURRENT_TIMESTAMP`） |
| 软删除 | 业务表加 `is_deleted TINYINT(1) DEFAULT 0`，删除时置 1，避免误删 |
| 字符集 | `utf8mb4` / `utf8mb4_unicode_ci` |
| 外键 | 逻辑外键 + 索引；是否启用物理 FK 由部署决定（启用需在 `ON DELETE` 明确级联策略） |
| 命名 | 表名复数小写下划线，字段小写下划线 |
| 事务 | 级联操作（如删除班级）必须在单个事务内完成，对应 API 的 `DELETE /api/classes/{id}` |

---

## 2. ER 关系概览

```
College 学院 ──1:N──> Major 专业 ──1:N──> Class 行政班
                                          │
                                          ├──1:N──> Student 学生
                                          │
Teacher 教师 ──N:M──< Course 课程 >──N:M── Student（选课 Enrollment）
                         │
                         └──1:N──> Schedule 课表条目

User 账号 ──1:1──> (Teacher | Student | Admin)  角色资料
```

- 一门课程可由多位教师授课（N:M，`course_teachers`）
- 一名学生可选多门课（`enrollment`），成绩也记录在选课关系上
- 课表条目 `schedule` 归属课程 + 行政班 + 教室 + 时段

---

## 3. 表结构详述

### 3.1 `colleges` 学院

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | 如 `col_cs` |
| name | VARCHAR(64) | NOT NULL UNIQUE | 计算机学院 |
| code | VARCHAR(16) | UNIQUE | CS |
| dean | VARCHAR(32) | | 院长 |
| created_at / updated_at | DATETIME | | |

### 3.2 `majors` 专业

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | |
| college_id | VARCHAR(24) | INDEX | 所属学院 → colleges.id |
| name | VARCHAR(64) | NOT NULL | 计算机科学与技术 |
| code | VARCHAR(16) | | 专业代码 |
| degree | VARCHAR(16) | | 授予学位：工学/理学/文学 |

### 3.3 `classes` 行政班（前端 `ClassInfo`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | 前端生成的班级 ID |
| name | VARCHAR(64) | NOT NULL | 计科 2201 班 |
| code | VARCHAR(24) | | 班号 CS2201 |
| major_id | VARCHAR(24) | INDEX | → majors.id |
| college_id | VARCHAR(24) | INDEX | 冗余，便于按学院筛选 |
| grade | VARCHAR(8) | | 大一/大二/大三/大四 |
| counselor | VARCHAR(32) | | 辅导员 |
| student_count | INT | DEFAULT 0 | 人数（可由 students 统计同步） |
| avg_score | DECIMAL(5,2) | | 班级均分 |
| trend | DECIMAL(5,2) | | 趋势 |
| color | VARCHAR(16) | | UI 主题色 |
| is_deleted | TINYINT(1) | DEFAULT 0 | |

> 前端字段映射：`name→name`、`subject→majors.name(联表)`、`college/major/grade/code` 见上。
> 前端的 `subject` 是冗余展示字段，后端可由 `major_id` 联表得到；为兼容保留 `subject VARCHAR(64)`。

### 3.4 `teachers` 教师（前端 `Teacher`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | 工号或生成 ID |
| name | VARCHAR(32) | NOT NULL | |
| college_id | VARCHAR(24) | INDEX | → colleges.id |
| subject | VARCHAR(64) | | 所属学科/专业 |
| title | VARCHAR(16) | | 教授/副教授/讲师/助教 |
| degree | VARCHAR(16) | | 博士/硕士/学士 |
| research | VARCHAR(128) | | 研究方向 |
| years | INT | | 教龄 |
| status | VARCHAR(16) | | 在职/教研中/请假 |
| class_count / student_count | INT | | 工作量（可统计同步） |
| is_deleted | TINYINT(1) | DEFAULT 0 | |

### 3.5 `students` 学生（前端 `Student`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | |
| student_no | VARCHAR(24) | UNIQUE | 学号 |
| name | VARCHAR(32) | NOT NULL | |
| class_id | VARCHAR(24) | INDEX | → classes.id |
| major_id | VARCHAR(24) | INDEX | → majors.id |
| grade | VARCHAR(8) | | 年级 |
| gpa | DECIMAL(3,2) | | 平均绩点 0-4 |
| credits | INT | | 已修学分 |
| attendance | DECIMAL(5,2) | | 出勤率 % |
| homework_rate | DECIMAL(5,2) | | 作业完成率 % |
| participation | DECIMAL(5,2) | | 课堂参与 % |
| avg_score | DECIMAL(5,2) | | 平均分 |
| trend | DECIMAL(5,2) | | 趋势 |
| status | VARCHAR(16) | | excellent/good/warning/risk |
| avatar | VARCHAR(255) | | 头像 URL |
| is_deleted | TINYINT(1) | DEFAULT 0 | |

### 3.6 `courses` 课程（前端 `AdminCourse`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | |
| code | VARCHAR(24) | UNIQUE | 课程代码 CS201 |
| title | VARCHAR(128) | NOT NULL | 数据结构与算法 |
| college_id | VARCHAR(24) | INDEX | 开课学院 |
| credits | INT | | 学分 |
| hours | INT | | 总学时 |
| semester | VARCHAR(32) | | 开课学期 |
| type | VARCHAR(16) | | lecture/lab/seminar/exam |
| status | VARCHAR(16) | | 进行中/待开课/已完成 |
| color | VARCHAR(16) | | UI 色 |
| is_deleted | TINYINT(1) | DEFAULT 0 | |

### 3.7 `course_teachers` 授课关系（N:M）

| 字段 | 类型 | 约束 |
|---|---|---|
| course_id | VARCHAR(24) | PK  Part1 → courses.id |
| teacher_id | VARCHAR(24) | PK  Part2 → teachers.id |

### 3.8 `schedules` 课表条目（前端 `CourseEvent`）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | |
| course_id | VARCHAR(24) | INDEX | → courses.id |
| class_id | VARCHAR(24) | INDEX | → classes.id，可空（教研活动） |
| teacher_id | VARCHAR(24) | INDEX | → teachers.id |
| day | TINYINT | | 0-6 周一至周日 |
| start_period | TINYINT | | 起始节次 1-8 |
| duration | TINYINT | | 持续节次 |
| room | VARCHAR(64) | | 教室 |
| semester | VARCHAR(32) | | 学期 |
| color | VARCHAR(16) | | |
| is_deleted | TINYINT(1) | DEFAULT 0 | |

> **唯一性约束**（防时段冲突，对应前端 `Schedule.tsx` 的冲突检测）：
> `UNIQUE KEY uq_slot (teacher_id, day, start_period, semester, is_deleted)`
> 即同一教师同一学期同一时段只能有一节课。需要在 API 层返回 409 冲突错误。

### 3.9 `enrollments` 选课与成绩（N:M，大学核心）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | VARCHAR(24) | PK | |
| student_id | VARCHAR(24) | INDEX | → students.id |
| course_id | VARCHAR(24) | INDEX | → courses.id |
| semester | VARCHAR(32) | | |
| score | DECIMAL(5,2) | | 期末总评 |
| grade_point | DECIMAL(3,2) | | 对应绩点 |
| status | VARCHAR(16) | | 选课/退课/已完成 |
| UNIQUE | (student_id, course_id, semester) | | 防重复选课 |

### 3.10 `homeworks` 作业（前端 `Homework`）

| 字段 | 类型 | 说明 |
|---|---|---|
| id / title | | |
| course_id | VARCHAR(24) | → courses.id |
| due_date | DATETIME | 截止时间 |
| status | | pending/submitted/graded |

### 3.11 `submissions` 作业提交

| 字段 | 类型 | 说明 |
|---|---|---|
| id / homework_id / student_id | | |
| content | TEXT | 提交内容/附件 URL |
| score | DECIMAL(5,2) | 得分 |
| submitted_at | DATETIME | |

### 3.12 `users` 账号与角色

| 字段 | 类型 | 说明 |
|---|---|---|
| id | VARCHAR(24) | PK |
| username | VARCHAR(64) | UNIQUE 登录名 |
| password_hash | VARCHAR(128) | werkzeug 生成 |
| role | VARCHAR(16) | teacher/student/admin |
| role_ref_id | VARCHAR(24) | 关联 teachers.id / students.id / admins.id |
| display_name | VARCHAR(32) | |
| last_login | DATETIME | |

### 3.13 `analysis_reports` 学情报告（可选，落库便于历史追溯）

| 字段 | 类型 | 说明 |
|---|---|---|
| id / class_id / course_id | | |
| semester | | |
| payload | JSON | 雷达/知识点掌握度等分析结果快照 |
| generated_at | DATETIME | |

---

## 4. 索引建议

```sql
CREATE INDEX idx_student_class    ON students(class_id, is_deleted);
CREATE INDEX idx_schedule_slot    ON schedules(teacher_id, day, start_period, semester);
CREATE INDEX idx_course_semester  ON courses(semester, is_deleted);
CREATE INDEX idx_enroll_student   ON enrollments(student_id, semester);
CREATE INDEX idx_enroll_course    ON enrollments(course_id, semester);
CREATE UNIQUE KEY uq_slot         ON schedules(teacher_id, day, start_period, semester, is_deleted);
```

## 5. 数据迁移说明

前端当前使用 `localStorage`（key `warmclass-data-v1`）。后端上线后：

1. 用 `docs/seed_data.json`（可选导出）或本文档的示例数据初始化上述表；
2. 前端在 `.env.local` 设置 `VITE_DATA_SOURCE=http` 与 `VITE_API_BASE_URL`；
3. 首次登录时如需把本地草稿数据迁移到后端，可提供一次性导入接口 `POST /api/system/import`（见 `API.md`）。
