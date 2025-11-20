# Re-OnlineJudge 后端接口文档

  ## 鉴权与响应约定

  ### JWT 鉴权

  - 认证头：Authorization: Bearer <JWT>（默认前缀 Bearer，有效期 120 分钟）。
  - 解析出的用户信息以 AuthenticatedUser 存入 CURRENT_USER 请求属性，包含 userId/username/role/token。
  - 白名单（无需携带 JWT）：/api/auth/login、/api/auth/register、/api/auth/verifyEmail、/api/auth/password/forgot/sendCode、/api/auth/password/forgot/verify。其余接口若控制器判定需要登录，应携带有效 Token。
  - 角色：student、teacher、admin。大多数业务会在控制器中再次校验允许的角色。
  - 若 Token 缺失或不合法，全局返回 401，格式为标准 ApiResponse。

  ### 统一响应格式

| 字段    | 类型   | 必填 | 默认值  | 示例    | 描述                       |
| ------- | ------ | ---- | ------- | ------- | -------------------------- |
| code    | number | 是   | 0       | 0       | 业务状态码，0 表示成功     |
| message | string | 是   | success | success | 人类可读提示               |
| data    | any    | 否   | null    | {...}   | 业务数据，结构见各接口说明 |

  ### 全局错误码

| HTTP 状态 | code | 说明                                   |
| --------- | ---- | -------------------------------------- |
| 400       | 400  | 参数非法、业务校验失败（如用户名冲突） |
| 401       | 401  | 未登录或 Token 失效                    |
| 403       | 403  | 无访问权限/角色不匹配                  |
| 404       | 404  | 资源不存在或不可见                     |
| 409       | 409  | 资源冲突/重复                          |
| 500       | 500  | 服务器内部错误或判题调用失败           |

  ### 分页数据结构（MyBatis-Plus Page<T>）

| 字段    | 类型   | 必填 | 默认值 | 示例        | 描述                 |
| ------- | ------ | ---- | ------ | ----------- | -------------------- |
| records | T[]    | 是   | []     | [ { ... } ] | 当前页记录数组       |
| current | number | 是   | 1      | 1           | 当前页码             |
| size    | number | 是   | 10     | 10          | 每页条数             |
| total   | number | 是   | 0      | 36          | 记录总数             |
| pages   | number | 是   | 0      | 4           | 总页数               |
| orders  | array  | 是   | []     | []          | 排序信息（通常为空） |

  ## 公共数据结构

  ### 响应 VO

  > 下述 VO 名称与真实返回实体一致：部分接口直接返回 Entity（例如 Student），文档统一以 xxxVO 命名并与 Entity 字段保持一致。若字段未在响应中赋值，默认返回 null。                                                                      

  #### AuthUserVO

| 字段     | 类型   | 必填 | 默认值  | 示例                    | 描述                                    |
| -------- | ------ | ---- | ------- | ----------------------- | --------------------------------------- |
| id       | number | 是   | -       | 1001                    | 当前用户 ID                             |
| username | string | 是   | -       | alice                   | 用户名                                  |
| email    | string | 否   | null    | alice@example.com       | 邮箱                                    |
| avatar   | string | 否   | null    | /files/avatars/uuid.png | 头像 URL                                |
| role     | string | 是   | student | student                 | 角色标识                                |
| token    | string | 否   | null    | Bearer eyJ...           | 带前缀 JWT；/users/me 从原始 Token 还原 |
| details  | object | 是   | {}      | {"id":1,...}            | 角色实体完整字段快照（除 password）     |

  #### StudentVO

| 字段           | 类型             | 必填 | 默认值 | 示例                 | 描述                                             |
| -------------- | ---------------- | ---- | ------ | -------------------- | ------------------------------------------------ |
| id             | number           | 是   | -      | 2001                 | 学生 ID                                          |
| username       | string           | 是   | -      | stu01                | 用户名                                           |
| password       | string           | 是   | -      | $2a$10$...           | BCrypt 哈希（创建/更新接口直接返回，需谨慎存储） |
| name           | string           | 否   | null   | 张三                 | 姓名                                             |
| sex            | string           | 否   | null   | male                 | 性别                                             |
| birth          | string(date)     | 否   | null   | 2004-03-01           | 生日                                             |
| phone          | string           | 否   | null   | 13800000000          | 手机号                                           |
| email          | string           | 否   | null   | stu01@example.com    | 邮箱                                             |
| avatar         | string           | 否   | null   | /files/avatars/a.png | 头像                                             |
| background     | string           | 否   | null   | /files/bg/a.jpg      | 背景图                                           |
| ac             | number           | 否   | 0      | 30                   | AC 题数                                          |
| submit         | number           | 否   | 0      | 80                   | 提交次数                                         |
| school         | string           | 否   | null   | HIT                  | 学校                                             |
| score          | number           | 否   | 0      | 100                  | 综合积分                                         |
| lastLoginTime  | string(datetime) | 否   | null   | 2024-04-20T12:00:00  | 最近登录时间                                     |
| lastLanguage   | string           | 否   | null   | cpp17                | 最近使用语言                                     |
| createTime     | string(datetime) | 否   | null   | 2024-01-01T08:00:00  | 注册时间                                         |
| lastVisitTime  | string(datetime) | 否   | null   | 2024-04-21T13:00:00  | 最近访问时间                                     |
| dailyChallenge | string           | 否   | null   | 2024-04-20           | 今日挑战标识                                     |
| registerIp     | string           | 否   | null   | 1.2.3.4              | 注册 IP                                          |
| lastLoginIp    | string           | 否   | null   | 1.2.3.4              | 最近登录 IP                                      |
| bio            | string           | 否   | null   | Keep coding          | 个人简介                                         |
| isVerified     | boolean          | 否   | false  | true                 | 邮箱是否验证                                     |
| updatedAt      | string(datetime) | 否   | null   | 2024-04-21T13:10:00  | 更新时间                                         |

  #### TeacherVO

| 字段          | 类型             | 必填 | 默认值 | 示例                 | 描述        |
| ------------- | ---------------- | ---- | ------ | -------------------- | ----------- |
| id            | number           | 是   | -      | 501                  | 教师 ID     |
| username      | string           | 是   | -      | teacher01            | 用户名      |
| password      | string           | 是   | -      | $2a$10$...           | BCrypt 哈希 |
| name          | string           | 否   | null   | 李四                 | 姓名        |
| sex           | string           | 否   | null   | female               | 性别        |
| phone         | string           | 否   | null   | 13900000000          | 手机        |
| email         | string           | 否   | null   | t@example.com        | 邮箱        |
| avatar        | string           | 否   | null   | /files/avatars/t.png | 头像        |
| title         | string           | 否   | null   | 副教授               | 职称        |
| lastLoginTime | string(datetime) | 否   | null   | 2024-04-20T12:00:00  | 最近登录    |
| createdAt     | string(datetime) | 否   | null   | 2023-09-01T09:00:00  | 创建时间    |
| updatedAt     | string(datetime) | 否   | null   | 2024-04-20T12:00:01  | 更新时间    |

  #### AdminVO

| 字段          | 类型             | 必填 | 默认值 | 示例                     | 描述         |
| ------------- | ---------------- | ---- | ------ | ------------------------ | ------------ |
| id            | number           | 是   | -      | 1                        | 管理员 ID    |
| username      | string           | 是   | -      | admin                    | 用户名       |
| password      | string           | 是   | -      | $2a$...                  | BCrypt 哈希  |
| name          | string           | 否   | null   | 系统管理员               | 姓名         |
| sex           | string           | 否   | null   | other                    | 性别         |
| birth         | string(date)     | 否   | null   | 1990-05-01               | 生日         |
| phone         | string           | 否   | null   | 13600000000              | 电话         |
| email         | string           | 否   | null   | admin@example.com        | 邮箱         |
| avatar        | string           | 否   | null   | /files/avatars/admin.png | 头像         |
| lastLoginIp   | string           | 否   | null   | 1.1.1.1                  | 最近登录 IP  |
| lastLoginTime | string(datetime) | 否   | null   | 2024-04-21T12:00:00      | 最近登录时间 |
| createdAt     | string(datetime) | 否   | null   | ...                      | 创建时间     |
| updatedAt     | string(datetime) | 否   | null   | ...                      | 更新时间     |

  #### AnnouncementVO

| 字段      | 类型             | 必填 | 默认值   | 示例                | 描述     |
| --------- | ---------------- | ---- | -------- | ------------------- | -------- |
| id        | number           | 是   | -        | 10                  | 公告 ID  |
| title     | string           | 是   | -        | 系统维护通知        | 标题     |
| content   | string           | 是   | -        | ...                 | 内容     |
| time      | string(datetime) | 否   | 生成时刻 | 2024-04-25T09:00:00 | 发布时间 |
| isPinned  | boolean          | 否   | false    | true                | 是否置顶 |
| updatedAt | string(datetime) | 否   | null     | 2024-04-25T09:30:00 | 更新时间 |
| isActive  | boolean          | 否   | true     | true                | 是否启用 |

  #### ClassesVO

| 字段        | 类型             | 必填 | 默认值 | 示例       | 描述          |
| ----------- | ---------------- | ---- | ------ | ---------- | ------------- |
| id          | number           | 是   | -      | 3001       | 班级 ID       |
| name        | string           | 是   | -      | 算法班 A   | 班级名称      |
| creatorId   | number           | 否   | null   | 501        | 创建者教师 ID |
| code        | string           | 否   | null   | ABC123     | 班级邀请码    |
| startDate   | string(date)     | 否   | null   | 2024-03-01 | 开始日期      |
| endDate     | string(date)     | 否   | null   | 2024-06-30 | 结束日期      |
| description | string           | 否   | null   | 春季集训   | 描述          |
| createdAt   | string(datetime) | 否   | null   | ...        | 创建时间      |
| updatedAt   | string(datetime) | 否   | null   | ...        | 更新时间      |

  #### ClassesMemberVO

| 字段       | 类型             | 必填 | 默认值   | 示例                | 描述                        |
| ---------- | ---------------- | ---- | -------- | ------------------- | --------------------------- |
| id         | number           | 是   | -        | 9001                | 记录 ID                     |
| classId    | number           | 是   | -        | 3001                | 班级 ID                     |
| memberType | string           | 是   | -        | student             | 成员类型（student/teacher） |
| studentId  | number           | 否   | null     | 2001                | 学生 ID                     |
| teacherId  | number           | 否   | null     | 501                 | 教师 ID                     |
| joinedAt   | string(datetime) | 否   | 当前时间 | 2024-04-01T10:00:00 | 加入时间                    |
| leftAt     | string(datetime) | 否   | null     | 2024-06-01T18:00:00 | 离开时间                    |

  #### DiscussionVO

| 字段       | 类型             | 必填 | 默认值 | 示例                | 描述          |
| ---------- | ---------------- | ---- | ------ | ------------------- | ------------- |
| id         | number           | 是   | -      | 8001                | 讨论 ID       |
| userId     | number           | 是   | -      | 2001                | 发布者学生 ID |
| problemId  | number           | 否   | null   | 1101                | 关联题目      |
| title      | string           | 是   | -      | 关于算法的疑问      | 标题          |
| createTime | string(datetime) | 否   | now    | 2024-04-21T09:00:00 | 创建时间      |
| updateTime | string(datetime) | 否   | now    | 2024-04-21T09:10:00 | 更新时间      |
| content    | string           | 是   | -      | ...                 | 内容          |
| isActive   | boolean          | 否   | true   | true                | 是否启用      |

  #### DiscussionCommentVO

| 字段       | 类型             | 必填 | 默认值 | 示例                | 描述          |
| ---------- | ---------------- | ---- | ------ | ------------------- | ------------- |
| id         | number           | 是   | -      | 12001               | 评论 ID       |
| discussId  | number           | 是   | -      | 8001                | 所属讨论 ID   |
| userId     | number           | 是   | -      | 2001                | 评论者学生 ID |
| content    | string           | 是   | -      | 我也遇到该问题      | 内容          |
| createTime | string(datetime) | 否   | now    | 2024-04-21T09:30:00 | 创建时间      |

  #### HomeworkVO

| 字段        | 类型             | 必填 | 默认值 | 示例                | 描述     |
| ----------- | ---------------- | ---- | ------ | ------------------- | -------- |
| id          | number           | 是   | -      | 7001                | 作业 ID  |
| title       | string           | 是   | -      | Week1 作业          | 标题     |
| classId     | number           | 是   | -      | 3001                | 班级 ID  |
| startTime   | string(datetime) | 否   | null   | 2024-04-22T08:00:00 | 开始时间 |
| endTime     | string(datetime) | 否   | null   | 2024-04-29T23:00:00 | 结束时间 |
| description | string           | 否   | null   | ...                 | 描述     |
| createdAt   | string(datetime) | 否   | now    | 2024-04-21T12:00:00 | 创建时间 |
| updatedAt   | string(datetime) | 否   | now    | 2024-04-21T12:00:00 | 更新时间 |
| isActive    | boolean          | 否   | true   | true                | 是否启用 |

  #### ProblemVO

| 字段              | 类型             | 必填 | 默认值 | 示例                | 描述         |
| ----------------- | ---------------- | ---- | ------ | ------------------- | ------------ |
| id                | number           | 是   | -      | 1101                | 题目 ID      |
| name              | string           | 是   | -      | Two Sum             | 名称         |
| createTime        | string(datetime) | 否   | now    | 2024-03-01T10:00:00 | 创建时间     |
| acCount           | number           | 否   | 0      | 200                 | 通过次数     |
| submitCount       | number           | 否   | 0      | 1000                | 提交次数     |
| description       | string           | 是   | -      | ...                 | 题目描述     |
| descriptionInput  | string           | 是   | -      | ...                 | 输入描述     |
| descriptionOutput | string           | 是   | -      | ...                 | 输出描述     |
| sampleInput       | string           | 是   | -      | 1 2                 | 样例输入     |
| sampleOutput      | string           | 是   | -      | 3                   | 样例输出     |
| hint              | string           | 否   | null   | 使用哈希表          | 提示         |
| dailyChallenge    | string           | 否   | "0"    | 2024-04-21          | 日常挑战标识 |
| difficulty        | string           | 是   | -      | medium              | 难度         |
| timeLimitMs       | number           | 否   | null   | 1000                | 时间限制     |
| memoryLimitKb     | number           | 否   | null   | 65536               | 内存限制     |
| source            | string           | 否   | null   | LeetCode            | 来源         |
| isActive          | boolean          | 否   | true   | true                | 是否启用     |
| updatedAt         | string(datetime) | 否   | now    | ...                 | 更新时间     |

  #### ProblemTestcaseVO

| 字段       | 类型   | 必填 | 默认值 | 示例  | 描述        |
| ---------- | ------ | ---- | ------ | ----- | ----------- |
| id         | number | 是   | -      | 21001 | 测试用例 ID |
| problemId  | number | 是   | -      | 1101  | 题目 ID     |
| inputData  | string | 是   | -      | 1 2   | 输入数据    |
| outputData | string | 是   | -      | 3     | 输出数据    |

  #### SolutionVO

| 字段       | 类型             | 必填 | 默认值 | 示例                | 描述     |
| ---------- | ---------------- | ---- | ------ | ------------------- | -------- |
| id         | number           | 是   | -      | 6001                | 题解 ID  |
| userId     | number           | 是   | -      | 2001                | 学生 ID  |
| problemId  | number           | 是   | -      | 1101                | 题目 ID  |
| title      | string           | 是   | -      | 哈希表解法          | 标题     |
| content    | string           | 是   | -      | ...                 | 内容     |
| language   | string           | 否   | null   | cpp                 | 语言     |
| createTime | string(datetime) | 否   | now    | 2024-04-21T08:00:00 | 创建时间 |
| updatedAt  | string(datetime) | 否   | now    | 2024-04-21T09:00:00 | 更新时间 |
| isActive   | boolean          | 否   | true   | true                | 是否启用 |

  #### LoginLogVO

| 字段       | 类型             | 必填 | 默认值 | 示例        | 描述     |
| ---------- | ---------------- | ---- | ------ | ----------- | -------- |
| id         | number           | 是   | -      | 13001       | 日志 ID  |
| role       | string           | 是   | -      | student     | 角色     |
| userId     | number           | 是   | -      | 2001        | 用户 ID  |
| username   | string           | 是   | -      | stu01       | 用户名   |
| ipAddress  | string           | 否   | null   | 1.2.3.4     | IP       |
| location   | string           | 否   | null   | 北京        | 地理位置 |
| userAgent  | string           | 否   | null   | Mozilla/... | UA       |
| device     | string           | 否   | null   | Windows     | 设备     |
| loginTime  | string(datetime) | 否   | now    | ...         | 登录时间 |
| logoutTime | string(datetime) | 否   | null   | ...         | 登出时间 |
| success    | boolean          | 否   | null   | true        | 是否成功 |
| failReason | string           | 否   | null   | 密码错误    | 失败原因 |
| createdAt  | string(datetime) | 否   | null   | ...         | 创建时间 |
| updatedAt  | string(datetime) | 否   | null   | ...         | 更新时间 |

  #### SubmissionVO

| 字段              | 类型             | 必填 | 默认值 | 示例     | 描述                                       |
| ----------------- | ---------------- | ---- | ------ | -------- | ------------------------------------------ |
| id                | number           | 是   | -      | 50001    | 提交 ID                                    |
| problemId         | number           | 是   | -      | 1101     | 题目 ID                                    |
| homeworkId        | number           | 否   | null   | 7001     | 作业 ID                                    |
| languageId        | number           | 是   | -      | 54       | Judge0 语言 ID                             |
| overallStatusId   | number           | 是   | -      | 3        | 状态 ID（参见 SubmissionOverallStatus 表） |
| overallStatusCode | string           | 否   | null   | ACCEPTED | 状态编码                                   |
| overallStatusName | string           | 否   | null   | 通过     | 状态名称                                   |
| passedCaseCount   | number           | 是   | 0      | 5        | 通过数量                                   |
| totalCaseCount    | number           | 是   | -      | 5        | 测试点总量                                 |
| score             | number           | 是   | 0      | 100      | 得分                                       |
| createdAt         | string(datetime) | 是   | now    | ...      | 创建时间                                   |
| updatedAt         | string(datetime) | 是   | now    | ...      | 更新时间                                   |

  #### SubmissionDetailVO（继承 SubmissionVO）

| 字段            | 类型                         | 必填 | 默认值 | 示例                     | 描述                                      |
| --------------- | ---------------------------- | ---- | ------ | ------------------------ | ----------------------------------------- |
| sourceCode      | string                       | 否   | null   | #include <bits/stdc++.h> | 源代码（非管理员/作者在详情接口会被置空） |
| testcaseResults | SubmissionTestcaseResultVO[] | 是   | []     | [...]                    | 每个测试点判题结果                        |

  #### SubmissionTestcaseResultVO

| 字段              | 类型   | 必填 | 默认值 | 示例  | 描述                                               |
| ----------------- | ------ | ---- | ------ | ----- | -------------------------------------------------- |
| testcaseId        | number | 是   | -      | 21001 | 测试用例 ID                                        |
| statusId          | number | 否   | null   | 3     | Judge0 状态 ID                                     |
| statusDescription | string | 否   | null   | 通过  | 状态中文描述（来自 JudgeStatus，否则回退 message） |
| stdout            | string | 否   | null   | 3\n   | 标准输出                                           |
| stderr            | string | 否   | null   | null  | 标准错误                                           |
| compileOutput     | string | 否   | null   | null  | 编译输出                                           |
| message           | string | 否   | null   | ...   | 附加信息/错误                                      |
| timeUsed          | number | 否   | null   | 0.123 | 执行耗时（秒）                                     |
| memoryUsed        | number | 否   | null   | 65536 | 内存（KB）                                         |

  #### FileUploadVO

| 字段 | 类型   | 必填 | 默认值 | 示例                    | 描述                   |
| ---- | ------ | ---- | ------ | ----------------------- | ---------------------- |
| url  | string | 是   | -      | /files/avatars/uuid.png | 存储后可访问的头像 URL |

  ### 请求 DTO 列表

  > 默认值 为后端未显式赋值时的默认。所有 DTO 字段均来源于 domain/dto。                                                                                                                                                                

  #### RegisterRequest

| 字段     | 类型   | 必填 | 默认值 | 示例              | 描述                            |
| -------- | ------ | ---- | ------ | ----------------- | ------------------------------- |
| username | string | 是   | -      | stu01             | 用户名（<=64）                  |
| password | string | 是   | -      | Passw0rd!         | 明文密码（6-100，将被加盐哈希） |
| email    | string | 否   | null   | stu01@example.com | 邮箱                            |
| name     | string | 否   | null   | 张三              | 真实姓名                        |

  #### VerifyEmailRequest

| 字段     | 类型   | 必填 | 默认值 | 示例   | 描述                       |
| -------- | ------ | ---- | ------ | ------ | -------------------------- |
| username | string | 是   | -      | stu01  | 注册阶段的用户名           |
| code     | string | 是   | -      | AB12CD | 邮件验证码（6 位字母数字） |

  #### LoginRequest

| 字段     | 类型   | 必填 | 默认值  | 示例      | 描述                                                |
| -------- | ------ | ---- | ------- | --------- | --------------------------------------------------- |
| username | string | 是   | -       | stu01     | 账号                                                |
| password | string | 是   | -       | Passw0rd! | 密码明文                                            |
| role     | string | 否   | student | teacher   | 登录身份（student/teacher/admin，不填默认 student） |

  #### ForgotPasswordSendCodeRequest

| 字段     | 类型   | 必填 | 默认值 | 示例  | 描述                     |
| -------- | ------ | ---- | ------ | ----- | ------------------------ |
| username | string | 是   | -      | stu01 | 需要找回密码的学生用户名 |

  #### ForgotPasswordVerifyRequest

| 字段        | 类型   | 必填 | 默认值 | 示例     | 描述                              |
| ----------- | ------ | ---- | ------ | -------- | --------------------------------- |
| username    | string | 是   | -      | stu01    | 学生用户名                        |
| code        | string | 是   | -      | AB12CD   | 邮件验证码                        |
| newPassword | string | 是   | -      | NewPass! | 新密码（6-100，不能与旧密码一致） |

  #### ChangePasswordRequest

| 字段        | 类型   | 必填 | 默认值 | 示例     | 描述            |
| ----------- | ------ | ---- | ------ | -------- | --------------- |
| oldPassword | string | 是   | -      | OldPass! | 原密码          |
| newPassword | string | 是   | -      | NewPass! | 新密码（6-100） |

  #### AdminUpsertRequest

| 字段     | 类型         | 必填（创建/更新）  | 默认值 | 示例          | 描述                       |
| -------- | ------------ | ------------------ | ------ | ------------- | -------------------------- |
| username | string       | 创建必填           | -      | admin2        | 管理员用户名               |
| password | string       | 创建必填；更新选填 | -      | Pass!         | 明文密码（提供则会被哈希） |
| name     | string       | 否                 | null   | 张管理员      | 姓名                       |
| sex      | string       | 否                 | null   | male          | 性别                       |
| birth    | string(date) | 否                 | null   | 1990-05-01    | 生日                       |
| phone    | string       | 否                 | null   | 138...        | 电话                       |
| email    | string       | 否                 | null   | a@example.com | 邮箱                       |
| avatar   | string       | 否                 | null   | /files/...    | 头像                       |

  #### AnnouncementRequest

| 字段     | 类型             | 必填 | 默认值 | 示例                | 描述     |
| -------- | ---------------- | ---- | ------ | ------------------- | -------- |
| title    | string           | 是   | -      | 维护通知            | 标题     |
| content  | string           | 是   | -      | ...                 | 内容     |
| time     | string(datetime) | 否   | now    | 2024-04-25T09:00:00 | 发布时间 |
| isPinned | boolean          | 否   | false  | true                | 是否置顶 |
| isActive | boolean          | 否   | true   | true                | 是否启用 |

  #### ClassesRequest

| 字段        | 类型         | 必填     | 默认值     | 示例       | 描述                            |
| ----------- | ------------ | -------- | ---------- | ---------- | ------------------------------- |
| name        | string       | 创建必填 | -          | 算法班     | 班级名称                        |
| creatorId   | number       | 否       | null       | 501        | 创建者 ID（教师创建时自动覆盖） |
| code        | string       | 否       | 随 DB 默认 | ABC123     | 邀请码                          |
| startDate   | string(date) | 否       | null       | 2024-03-01 | 开始日期                        |
| endDate     | string(date) | 否       | null       | 2024-06-30 | 结束日期                        |
| description | string       | 否       | null       | ...        | 描述                            |

  #### ClassesMemberRequest

| 字段       | 类型             | 必填          | 默认值 | 示例    | 描述                        |
| ---------- | ---------------- | ------------- | ------ | ------- | --------------------------- |
| classId    | number           | 创建必填      | -      | 3001    | 班级 ID                     |
| memberType | string           | 创建必填      | -      | student | 成员类型（student/teacher） |
| studentId  | number           | 视 memberType | null   | 2001    | 学生 ID                     |
| teacherId  | number           | 视 memberType | null   | 501     | 教师 ID                     |
| joinedAt   | string(datetime) | 否            | now    | ...     | 加入时间                    |
| leftAt     | string(datetime) | 否            | null   | ...     | 离开时间                    |

  #### DiscussionRequest

| 字段      | 类型    | 必填     | 默认值 | 示例        | 描述                          |
| --------- | ------- | -------- | ------ | ----------- | ----------------------------- |
| title     | string  | 创建必填 | -      | 关于题 1101 | 标题                          |
| content   | string  | 创建必填 | -      | ...         | 正文                          |
| problemId | number  | 否       | null   | 1101        | 关联题 ID，若填需存在         |
| isActive  | boolean | 否       | true   | true        | 是否启用（学生创建默认 true） |

  #### DiscussionCommentRequest

| 字段    | 类型   | 必填 | 默认值 | 示例     | 描述     |
| ------- | ------ | ---- | ------ | -------- | -------- |
| content | string | 是   | -      | 我也遇到 | 评论内容 |

  #### HomeworkRequest

| 字段        | 类型             | 必填                         | 默认值 | 示例                | 描述             |
| ----------- | ---------------- | ---------------------------- | ------ | ------------------- | ---------------- |
| title       | string           | 创建必填                     | -      | Week1 作业          | 作业标题         |
| classId     | number           | 创建必填                     | -      | 3001                | 班级 ID          |
| startTime   | string(datetime) | 否                           | null   | 2024-04-22T08:00:00 | 开始时间         |
| endTime     | string(datetime) | 否                           | null   | 2024-04-29T23:00:00 | 结束时间         |
| description | string           | 否                           | null   | ...                 | 描述             |
| isActive    | boolean          | 否                           | true   | true                | 是否启用         |
| problemIds  | number[]         | 创建必填，更新可为空表示清空 | -      | [1101,1102]         | 包含题目 ID 列表 |

  #### HomeworkProblemBatchRequest

| 字段       | 类型     | 必填 | 默认值 | 示例        | 描述                         |
| ---------- | -------- | ---- | ------ | ----------- | ---------------------------- |
| problemIds | number[] | 是   | -      | [1101,1103] | 待批量添加的题目列表（非空） |

  #### LoginLogRequest

| 字段       | 类型             | 必填     | 默认值 | 示例        | 描述                          |
| ---------- | ---------------- | -------- | ------ | ----------- | ----------------------------- |
| role       | string           | 创建必填 | -      | student     | 角色（student/teacher/admin） |
| userId     | number           | 创建必填 | -      | 2001        | 用户 ID                       |
| username   | string           | 创建必填 | -      | stu01       | 用户名                        |
| ipAddress  | string           | 否       | null   | 1.2.3.4     | IP                            |
| location   | string           | 否       | null   | 北京        | 位置                          |
| userAgent  | string           | 否       | null   | Mozilla/... | UA                            |
| device     | string           | 否       | null   | Windows     | 设备                          |
| loginTime  | string(datetime) | 否       | now    | ...         | 登录时间                      |
| logoutTime | string(datetime) | 否       | null   | ...         | 登出时间                      |
| success    | boolean          | 否       | null   | true        | 是否成功                      |
| failReason | string           | 否       | null   | 密码错误    | 失败原因                      |

  #### ProblemUpsertRequest

| 字段              | 类型    | 必填 | 默认值 | 示例       | 描述                                   |
| ----------------- | ------- | ---- | ------ | ---------- | -------------------------------------- |
| name              | string  | 是   | -      | Two Sum    | 题目名称                               |
| description       | string  | 是   | -      | ...        | 题目描述                               |
| descriptionInput  | string  | 是   | -      | ...        | 输入描述                               |
| descriptionOutput | string  | 是   | -      | ...        | 输出描述                               |
| sampleInput       | string  | 是   | -      | 1 2        | 样例输入                               |
| sampleOutput      | string  | 是   | -      | 3          | 样例输出                               |
| hint              | string  | 是   | -      | 使用哈希   | 提示                                   |
| dailyChallenge    | string  | 否   | "0"    | 2024-04-21 | 日常挑战标识                           |
| difficulty        | string  | 是   | -      | medium     | 难度（easy/medium/hard，不区分大小写） |
| timeLimitMs       | number  | 是   | -      | 1000       | 时间限制（>0）                         |
| memoryLimitKb     | number  | 是   | -      | 65536      | 内存限制（>0）                         |
| source            | string  | 否   | null   | LeetCode   | 来源                                   |
| isActive          | boolean | 否   | true   | true       | 是否启用（创建未填自动 true）          |

  #### ProblemTestcaseRequest

| 字段       | 类型   | 必填 | 默认值 | 示例 | 描述     |
| ---------- | ------ | ---- | ------ | ---- | -------- |
| inputData  | string | 是   | -      | 1 2  | 输入数据 |
| outputData | string | 是   | -      | 3    | 输出数据 |

  #### SolutionRequest

| 字段      | 类型    | 必填       | 默认值 | 示例     | 描述               |
| --------- | ------- | ---------- | ------ | -------- | ------------------ |
| problemId | number  | 更新时选填 | -      | 1101     | 可在更新时切换题目 |
| title     | string  | 是         | -      | 哈希解法 | 标题               |
| content   | string  | 是         | -      | ...      | 内容               |
| language  | string  | 否         | null   | cpp      | 语言               |
| isActive  | boolean | 否         | true   | true     | 是否启用           |

  #### StudentJoinClassRequest

| 字段 | 类型   | 必填 | 默认值 | 示例   | 描述       |
| ---- | ------ | ---- | ------ | ------ | ---------- |
| code | string | 是   | -      | ABC123 | 班级邀请码 |

  #### StudentUpsertRequest

| 字段       | 类型         | 必填（创建/更新）  | 默认值 | 示例            | 描述     |
| ---------- | ------------ | ------------------ | ------ | --------------- | -------- |
| username   | string       | 创建必填           | -      | stu01           | 用户名   |
| password   | string       | 创建必填；更新选填 | -      | Pass!           | 明文密码 |
| name       | string       | 否                 | null   | 张三            | 姓名     |
| sex        | string       | 否                 | null   | male            | 性别     |
| birth      | string(date) | 否                 | null   | 2004-03-01      | 生日     |
| phone      | string       | 否                 | null   | 138...          | 电话     |
| email      | string       | 否                 | null   | stu@example.com | 邮箱     |
| avatar     | string       | 否                 | null   | /files/...      | 头像     |
| background | string       | 否                 | null   | /files/bg.png   | 背景图   |
| school     | string       | 否                 | null   | HIT             | 学校     |
| score      | number       | 否                 | 0      | 100             | 积分     |
| bio        | string       | 否                 | null   | ...             | 简介     |

  #### SubmissionCreateRequest

| 字段       | 类型   | 必填 | 默认值 | 示例        | 描述                              |
| ---------- | ------ | ---- | ------ | ----------- | --------------------------------- |
| problemId  | number | 是   | -      | 1101        | 题目 ID（必须存在且启用）         |
| homeworkId | number | 否   | null   | 7001        | 作业 ID（若提供，题目需属于作业） |
| languageId | number | 是   | -      | 54          | Judge0 语言 ID                    |
| sourceCode | string | 是   | -      | #include... | 源代码文本                        |

  #### TeacherUpsertRequest

| 字段     | 类型   | 必填               | 默认值 | 示例          | 描述     |
| -------- | ------ | ------------------ | ------ | ------------- | -------- |
| username | string | 创建必填           | -      | teacher01     | 用户名   |
| password | string | 创建必填；更新选填 | -      | Pass!         | 明文密码 |
| name     | string | 否                 | null   | 李四          | 姓名     |
| sex      | string | 否                 | null   | male          | 性别     |
| phone    | string | 否                 | null   | 139...        | 电话     |
| email    | string | 否                 | null   | t@example.com | 邮箱     |
| avatar   | string | 否                 | null   | /files/...    | 头像     |
| title    | string | 否                 | null   | 副教授        | 职称     |

  ———

  下述模块章节将直接引用以上 DTO/VO。

  ## 模块：认证模块（AuthController）

  ### 1. 接口名称：注册（发送验证码或直接注册）

  - URL：/api/auth/register
  - Method：POST
  - 鉴权：无需登录
  - 描述：在 app.auth.require-email-verify=true（默认）时，写入待验证信息并向邮箱发送 6 位验证码（有效期 10 分钟）；关闭邮箱验证时直接创建学生、发送成功邮件并返回登录态。

  请求参数

  1. Query/Path：无
  2. RequestBody：RegisterRequest（见上表）

  返回示例（默认开启邮箱验证）：

  {
    "code": 0,
    "message": "验证码已发送，请查收邮件并在有效期内完成验证",
    "data": null
  }

  返回示例（关闭邮箱验证）：

  {
    "code": 0,
    "message": "注册成功",
    "data": {
      "id": 2001,
      "username": "stu01",
      "email": "stu01@example.com",
      "avatar": null,
      "role": "student",
      "token": "Bearer eyJhbGciOiJIUzI1NiIsInR...",
      "details": {
        "id": 2001,
        "username": "stu01",
        "name": "张三",
        "email": "stu01@example.com",
        "score": 0,
        "isVerified": true,
        "...": "..."
      }
    }
  }

  data 字段结构：AuthUserVO（见上）

  错误码与异常说明：

  - 400：用户名已存在、邮箱已被使用。
  - 500：创建学生失败（数据库或邮件异常）。

  ———

  ### 2. 接口名称：验证邮箱并激活

  - URL：/api/auth/verifyEmail
  - Method：POST
  - 鉴权：无需登录
  - 描述：校验验证码后创建正式学生账号、发送成功邮件并返回登录态。

  请求参数：RequestBody VerifyEmailRequest

  返回示例：同 AuthUserVO，message 为 注册并激活成功。

  错误码：

  - 400：未找到待验证的注册信息、验证码已过期，请重新注册、验证码不正确。
  - 500：保存学生失败。

  ———

  ### 3. 接口名称：登录

  - URL：/api/auth/login
  - Method：POST
  - 鉴权：无需登录
  - 描述：按 role 区分学生/教师/管理员；记录登陆日志、发送登录通知邮件、更新 lastLoginTime/IP。

  请求参数：RequestBody LoginRequest

  返回示例：

  {
    "code": 0,
    "message": "登录成功",
    "data": {
      "id": 501,
      "username": "teacher01",
      "email": "t@example.com",
      "avatar": "/files/avatars/t.png",
      "role": "teacher",
      "token": "Bearer eyJhb...",
      "details": {
        "id": 501,
        "username": "teacher01",
        "title": "副教授",
        "lastLoginTime": "2024-04-22T10:11:12",
        "...": "..."
      }
    }
  }

  错误码：

  - 400：账号不存在、账号或密码错误、邮箱未验证，无法登录（学生）。
  - 401：Token 解析失败（由过滤器返回）。
  - 500：登录日志写入失败。

  ———

  ### 4. 接口名称：注销

  - URL：/api/auth/logout
  - Method：POST
  - 鉴权：需任意已登录角色
  - 描述：补写最近一次成功登录日志的登出时间，并向绑定邮箱发送登出通知。

  请求参数：无（需携带 JWT）

  返回示例：

  {"code":0,"message":"注销成功","data":null}

  错误码：

  - 401：未登录。
  - 404：可忽略（若登录日志缺失不会抛错）。

  ———

  ### 5. 接口名称：当前用户信息

  - URL：/api/auth/users/me
  - Method：GET
  - 鉴权：需登录
  - 描述：根据 Token 解析的角色返回对应实体的完整快照并携带原始 Token。

  返回示例：同 AuthUserVO。

  错误码：

  - 401：未登录。
  - 404：用户不存在（Token 指向的用户已删除）。

  ———

  ### 6. 接口名称：找回密码-发送验证码

  - URL：/api/auth/password/forgot/sendCode
  - Method：POST
  - 鉴权：无需登录
  - 描述：仅学生可用；校验用户名与已绑定邮箱，生成 6 位验证码（10 分钟有效），写入临时存储 verify:pwd:<username>，发送邮件。

  RequestBody：ForgotPasswordSendCodeRequest

  返回示例：{"code":0,"message":"验证码已发送至邮箱","data":null}

  错误码：

  - 400：账号不存在、该账号未绑定邮箱，无法找回密码。

  ———

  ### 7. 接口名称：找回密码-验证并重置

  - URL：/api/auth/password/forgot/verify
  - Method：POST
  - 鉴权：无需登录
  - 描述：校验验证码后更新学生密码（禁止与旧密码一致），发送修改通知。

  RequestBody：ForgotPasswordVerifyRequest

  返回示例：{"code":0,"message":"密码已更新","data":null}

  错误码：

  - 400：账号不存在、请先发送验证码、验证码已过期、验证码不正确、新密码不能与旧密码相同。

  ———

  ### 8. 接口名称：修改密码（学生）

  - URL：/api/auth/password/change
  - Method：POST
  - 鉴权：需登录且角色为 student
  - 描述：校验旧密码、禁止与旧密码一致，更新密码并发送通知。

  RequestBody：ChangePasswordRequest

  返回示例：{"code":0,"message":"密码修改成功","data":null}

  错误码：

  - 401：未登录或角色不是 student。
  - 404：用户不存在。
  - 400：旧密码不正确、新密码不能与旧密码相同。

  ———

  ## 模块：学生模块（StudentController）

  ### 1. 学生-分页列表

  - URL：/api/students
  - Method：GET
  - 鉴权：需登录
  - 描述：可按用户名/邮箱模糊搜索学生。

  Query 参数：

| 参数     | 类型   | 必填 | 默认值 | 示例         | 说明         |
| -------- | ------ | ---- | ------ | ------------ | ------------ |
| page     | number | 否   | 1      | 1            | 页码         |
| size     | number | 否   | 10     | 20           | 每页条数     |
| username | string | 否   | null   | stu          | 按用户名模糊 |
| email    | string | 否   | null   | @example.com | 按邮箱模糊   |

  返回示例：

  {
    "code": 0,
    "message": "success",
    "data": {
      "records": [
        {
          "id": 2001,
          "username": "stu01",
          "password": "$2a$10$...",
          "name": "张三",
          "...": "..."
        }
      ],
      "current": 1,
      "size": 10,
      "total": 35,
      "pages": 4,
      "orders": []
    }
  }

  data 字段结构：Page<StudentVO>。

  错误码：401（未登录）。

  ———

  ### 2. 学生-详情

  - URL：/api/students/{id}
  - Method：GET
  - 鉴权：需登录

  Path 参数：id（long，必填）

  返回：StudentVO

  错误码：401、404（学生不存在）。

  ———

  ### 3. 学生-创建

  - URL：/api/students
  - Method：POST
  - 鉴权：需登录
  - 描述：保存前对密码加盐哈希。

  RequestBody：StudentUpsertRequest

  返回：StudentVO（含哈希密码）

  错误码：401、500（保存失败）。

  ———

  ### 4. 学生-更新

  - URL：/api/students/{id}
  - Method：PUT
  - 鉴权：需登录
  - 描述：若 password 为空沿用旧哈希。

  RequestBody：StudentUpsertRequest

  错误码：401、404（学生不存在，或更新失败）。

  ———

  ### 5. 学生-删除

  - URL：/api/students/{id}
  - Method：DELETE
  - 鉴权：需登录

  错误码：401、404（学生不存在）。

  ———

  ## 模块：教师模块（TeacherController）

  接口模式与学生模块类似，仅字段换成 TeacherVO 与 TeacherUpsertRequest。所有五个接口均需登录，且未额外校验角色。

  错误码：401（未登录）、404（资源不存在）、400（创建时密码为空）。

  ———

  ## 模块：管理员模块（AdminController）

  与教师模块类似，所有五个接口均需登录（未限制角色），请求体使用 AdminUpsertRequest，返回 AdminVO。

  额外错误：

  - 创建：400（密码不能为空）。
  - 更新：404（管理员不存在）。
  - 删除：404。

  ———

  ## 模块：班级模块（ClassesController）

  ### 1. 班级-分页列表

  - URL：/api/classes
  - Method：GET
  - 鉴权：需登录
  - 描述：教师仅看到自己创建的班级；管理员/学生看到全部。

  Query：page/size（默认 1/10）

  返回：Page<ClassesVO>

  错误码：401。

  ———

  ### 2. 班级-详情

  - URL：/api/classes/{id}
  - Method：GET
  - 鉴权：需登录
  - 返回：ClassesVO
  - 错误码：401、404。

  ———

  ### 3. 班级-创建

  - URL：/api/classes
  - Method：POST
  - 鉴权：需 teacher 或 admin
  - 描述：教师创建时自动将 creatorId 设为自己并补写 classes_member 记录。

  RequestBody：ClassesRequest

  返回：ClassesVO

  错误码：

  - 401：未登录。
  - 403：非教师/管理员。
  - 500：保存失败。

  ———

  ### 4. 班级-更新

  - URL：/api/classes/{id}
  - Method：PUT
  - 鉴权：teacher（仅限自己创建）或 admin
  - 请求体：ClassesRequest
  - 错误码：401、403（教师修改非自己班级）、404（班级不存在）。

  ———

  ### 5. 班级-删除

  - URL：/api/classes/{id}
  - Method：DELETE
  - 权限同更新；删除成功返回 data=null。

  ———

  ## 模块：班级成员模块（ClassesMemberController）

  所有接口需登录且角色为教师/管理员；教师须提供班级 ID 且只能操作自己班级。

  1. 分页列表：GET /api/classes-members
     Query：page/size/classId。返回 Page<ClassesMemberVO>。错误：401、403、400（教师缺少 classId）、404（班级不存在）。
  2. 详情：GET /api/classes-members/{id} 返回 ClassesMemberVO。教师会校验归属。错误：401/403/404。
  3. 创建：POST /api/classes-members；RequestBody ClassesMemberRequest。错误：401/403/400（班级ID为空）、404（班级不存在）、500（保存失败）。
  4. 更新：PUT /api/classes-members/{id}。错误：401/403/404。
  5. 删除：DELETE /api/classes-members/{id}。错误：401/403/404。

  ———

  ## 模块：学生班级模块（StudentClassController）

  所有接口需登录且角色为 student。

  1. 加入班级 POST /api/student/classes/join
     RequestBody：StudentJoinClassRequest。描述：一个学生同一时间只能有一个激活的班级；若曾加入过会复用历史记录。错误：401（非学生）、400（邀请码空/学生ID空）、404（学生或班级不存在）、409（已加入其他班级）。
  2. 当前班级 GET /api/student/classes
     返回：ClassesVO。错误：401、404（尚未加入班级）。
  3. 退出班级 POST /api/student/classes/leave
     描述：将当前记录 leftAt 设为当前时间。错误：401、404（尚未加入班级）。

  ———

  ## 模块：公告模块（AnnouncementController）

  需登录，任意角色。

  1. 公告列表 GET /api/announcements
     Query：page/size/pinnedOnly/keyword。返回 Page<AnnouncementVO>（按置顶+时间倒序）。错误：401。
  2. 公告详情 GET /api/announcements/{id}
     非管理员查看未启用公告会返回 404。错误：401、404。

  ———

  ## 模块：公告管理（AnnouncementAdminController）

  接口需角色 admin。

  1. 创建 POST /api/admin/announcements 请求体 AnnouncementRequest；若未提供 time/isActive 分别取当前时间/true。
  2. 更新 PUT /api/admin/announcements/{id}；支持修改标题、内容、时间、置顶、启用状态。
  3. 删除 DELETE /api/admin/announcements/{id}。

  错误：401、403、404、500（保存/更新失败）。

  ———

  ## 模块：题库模块（ProblemController）

  无需登录即可访问列表与详情；但未启用的题目仅 teacher/admin 可查看。

  1. 题库列表 GET /api/problems
     Query：page/size/keyword/difficulty/dailyChallenge/activeOnly(true)。difficulty 转小写后精确匹配。返回 Page<ProblemVO>。
  2. 题库详情 GET /api/problems/{id}
     错误：404（不存在或未启用且当前用户不是教师/管理员）。

  ———

  ## 模块：题库管理（ProblemAdminController）

  需角色 teacher 或 admin。

  1. 新增题目 POST /api/admin/problems RequestBody ProblemUpsertRequest；若未填 isActive/acCount/submitCount/dailyChallenge 则分别默认为 true/0/0/"0"。
  2. 更新题目 PUT /api/admin/problems/{id} RequestBody ProblemUpsertRequest。
  3. 删除题目 DELETE /api/admin/problems/{id}；调用 problemService.removeProblemWithTestcases 同时删除测试用例。
  4. 测试用例列表 GET /api/admin/problems/{id}/testcases 返回 ProblemTestcaseVO[]。
  5. 新增测试用例 POST /api/admin/problems/{id}/testcases RequestBody ProblemTestcaseRequest。
  6. 更新测试用例 PUT /api/admin/problem-testcases/{testcaseId} RequestBody ProblemTestcaseRequest。
  7. 删除测试用例 DELETE /api/admin/problem-testcases/{testcaseId}。

  错误：401、403（非教师/管理员）、404（题目/测试用例不存在）、500（保存失败）、400（参数校验失败）。

  ———

  ## 模块：作业模块（HomeworkController）

  除 list/detail/listProblems 外，其余接口需教师/管理员并校验班级归属。

  1. 作业列表 GET /api/homeworks
     Query：page/size/classId/activeOnly(true)。若请求者为学生，则强制仅返回启用作业。返回 Page<HomeworkVO>。
  2. 作业详情 GET /api/homeworks/{id}
     学生访问未启用作业会报 404。
  3. 作业题目列表 GET /api/homeworks/{id}/problems
     返回 ProblemVO[]（按关联顺序）；学生同样受启用限制。
  4. 作业创建 POST /api/homeworks
     RequestBody：HomeworkRequest；校验时间范围并确保 problemIds 存在。返回 HomeworkVO。
  5. 作业更新 PUT /api/homeworks/{id}
     RequestBody：HomeworkRequest；传入 problemIds：
      - null：保持不变；
      - 空数组：清空题目；
      - 其他：整体替换（需全部存在）。
  6. 作业删除 DELETE /api/homeworks/{id}。
  7. 批量新增题目 POST /api/homeworks/{id}/problems
     RequestBody：HomeworkProblemBatchRequest；仅新增尚未关联的题目。
  8. 删除作业题目 DELETE /api/homeworks/{id}/problems/{problemId}。

  错误码：

  - 401：未登录。
  - 403：非教师/管理员或教师操作非自己班级。
  - 404：班级/作业/题目不存在、题目不在作业中。
  - 400：时间范围非法、题目列表包含不存在的题目。
  - 500：保存/更新失败。

  ———

  ## 模块：讨论模块（DiscussionController）

  需登录且角色为 student/teacher/admin。

  1. 讨论列表 GET /api/discussions
     Query：page/size/problemId/userId/includeInactive(false)；仅管理员可将 includeInactive 设为 true。返回 Page<DiscussionVO>。
  2. 讨论详情 GET /api/discussions/{id}
     未启用讨论仅作者或管理员可见。
  3. 讨论创建 POST /api/discussions（学生）
     RequestBody：DiscussionRequest，若 problemId 填写则要求题目存在。默认 isActive=true。
  4. 讨论更新 PUT /api/discussions/{id}
     仅作者（学生）或管理员可修改标题/内容；isActive 仅管理员可改。
  5. 讨论删除 DELETE /api/discussions/{id}
     需要管理员或作者。
  6. 评论列表 GET /api/discussions/{id}/comments
     返回 DiscussionCommentVO[]（按创建时间升序）。
  7. 评论创建 POST /api/discussions/{id}/comments（学生）
     RequestBody：DiscussionCommentRequest。需确保讨论可见。
  8. 评论删除 DELETE /api/discussions/comments/{commentId}
     允许管理员或评论作者（学生）。

  错误：401、403、404、400（题目不存在）。

  ———

  ## 模块：题解模块（SolutionController）

  需登录且角色为 student/teacher/admin；部分操作限制学生。

  1. 题解列表 GET /api/solutions
     Query：page/size/problemId/authorId/includeInactive(false)；includeInactive 仅管理员有效。返回 Page<SolutionVO>。
  2. 按题目查询 GET /api/problems/{problemId}/solutions
     参数：page/size。需题目存在。返回 Page<SolutionVO>。
  3. 题解详情 GET /api/solutions/{id}
     未启用题解仅管理员或作者可见。
  4. 题解创建 POST /api/problems/{problemId}/solutions（学生）
     RequestBody：SolutionRequest（忽略其中 problemId 字段，以路径为准），默认 isActive=true。
  5. 题解更新 PUT /api/solutions/{id}
     仅作者或管理员；可重新指定 problemId（需存在）。
  6. 题解删除 DELETE /api/solutions/{id}
     仅作者或管理员。

  错误：401（未登录）、403（角色不符/非作者）、404（题解/题目不存在）、500（保存失败）。

  ———

  ## 模块：提交模块（SubmissionController）

  ### 1. 提交代码

  - URL：/api/submissions
  - Method：POST
  - 鉴权：需登录且 SubmissionApplicationService 会校验角色必须为 student
  - 描述：同步调用 Judge0，对每个测试用例生成 SubmissionTestcaseResultVO，计算得分和整体状态。若判题服务异常，整体状态置为 6。

  RequestBody：SubmissionCreateRequest

  返回示例（SubmissionDetailVO）：

  {
    "code": 0,
    "message": "提交成功",
    "data": {
      "id": 50001,
      "problemId": 1101,
      "homeworkId": 7001,
      "languageId": 54,
      "overallStatusId": 3,
      "overallStatusCode": "ACCEPTED",
      "overallStatusName": "通过",
      "passedCaseCount": 5,
      "totalCaseCount": 5,
      "score": 100,
      "createdAt": "2024-04-22T10:00:00",
      "updatedAt": "2024-04-22T10:00:01",
      "sourceCode": "#include <bits/stdc++.h>\n...",
      "testcaseResults": [
        {
          "testcaseId": 21001,
          "statusId": 3,
          "statusDescription": "通过",
          "stdout": "3\n",
          "stderr": null,
          "compileOutput": null,
          "message": null,
          "timeUsed": 0.12,
          "memoryUsed": 65536
        }
      ]
    }
  }

  错误码：

  - 401：未登录。
  - 403：角色不是 student、题目未启用。
  - 404：题目/作业不存在。
  - 400：该作业中不包含此题目、题目尚未配置测试用例。
  - 500：判题调用失败（系统错误，overallStatusId=6）。

  ———

  ### 2. 提交记录-分页列表

  - URL：/api/submissions
  - Method：GET
  - 鉴权：需登录
  - 描述：学生只能查看自己的提交；教师/管理员可通过 studentId 查看任意学生。

  Query 参数：

| 参数       | 类型   | 必填 | 默认值 | 示例 | 说明                        |
| ---------- | ------ | ---- | ------ | ---- | --------------------------- |
| page       | number | 否   | 1      | 1    | 页码                        |
| size       | number | 否   | 10     | 20   | 每页条数                    |
| problemId  | number | 否   | null   | 1101 | 题目过滤                    |
| homeworkId | number | 否   | null   | 7001 | 作业过滤                    |
| studentId  | number | 否   | null   | 2001 | 仅教师/管理员有效；学生忽略 |
| statusId   | number | 否   | null   | 3    | 按整体状态过滤              |

  返回：Page<SubmissionVO>

  错误码：401。

  ———

  ### 3. 提交详情

  - URL：/api/submissions/{id}
  - Method：GET
  - 鉴权：需登录
  - 描述：管理员/教师可查看完整详情；学生仅能查看自己的提交，且对他人提交 sourceCode 自动置空。

  返回：SubmissionDetailVO

  错误码：

  - 401：未登录。
  - 404：提交不存在。
  - 403：无权查看。

  ———

  ## 模块：文件模块（FileController）

  ### 上传头像

  - URL：/api/files/avatar
  - Method：POST（multipart/form-data）
  - 鉴权：需登录（任意角色）
  - 描述：AvatarStorageService 验证文件存在、为图片且宽高相等，并限制后缀 png/jpg/jpeg/gif/webp，随机文件名保存至 app.storage.avatar-dir，返回对外 URL。

  请求参数：

| 名称 | 类型 | 必填 | 默认值 | 示例       | 说明                          |
| ---- | ---- | ---- | ------ | ---------- | ----------------------------- |
| file | file | 是   | -      | avatar.png | 表单字段名 file，需正方形图片 |

  返回数据：FileUploadVO

  示例：

  {"code":0,"message":"success","data":{"url":"/files/avatars/2f0d9c4e.png"}}

  错误码：

  - 401：未登录。
  - 400：文件不能为空、文件不是有效的图片、头像必须为正方形图片、暂不支持的图片格式: ...。
  - 500：写文件失败。

  ———

  ## 模块：登录日志模块（LoginLogController）

  需登录。接口未限制角色，任何登录用户均可增删改查（请谨慎授权）。

  1. 分页列表 GET /api/login-logs
     Query：page/size/role/userId。返回 Page<LoginLogVO>。
  2. 详情 GET /api/login-logs/{id}
     返回 LoginLogVO。
  3. 创建 POST /api/login-logs
     RequestBody：LoginLogRequest。通常由业务内部调用。
  4. 更新 PUT /api/login-logs/{id}
     RequestBody：LoginLogRequest。
  5. 删除 DELETE /api/login-logs/{id}。

  错误码：401、404、500（保存失败）。

  ———

  ## 公共说明

  - AuthUserVO.details：根据角色返回 StudentVO/TeacherVO/AdminVO 字段全集（除 password）。例如学生包含 score/isVerified 等字段；教师包含 title。
  - JWT Token：由 JwtTokenProvider 生成，subject=userId，username/role 记录在 claims 中。
  - 密码策略：PasswordService 会在原始密码前附加全局盐 security.password.salt 再进行 BCrypt；校验时同样处理。
  - 邮箱验证码：VerificationCodeService 存储结构 {username,email,passwordHash,name,code,expireEpochMillis}，过期或错误会删除/增加错误计数。
  - 提交状态：SubmissionApplicationService 将整体状态设为
      - 3 Accepted（全部通过）；
      - 4 Partial（部分通过）；
      - 5 Failed（全部失败）；
      - 6 System Error（判题调用异常）。
        状态名称由 submission_overall_status 表提供。
  - 判题细节：调用 Judge0 API，每个测试点保存完整 stdout/stderr/compileOutput。若 Judge0 调用抛异常，则生成状态 0、message 写明错误。
  - 数据脱敏：除专门设计的 AuthUserVO.details 外，大多数 CRUD 接口直接返回 Entity，包括密码哈希。前端需谨慎处理。