<script lang="ts" setup>
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
import {
  createStudent,
  deleteStudent,
  fetchClassPage,
  fetchStudentPage,
  updateStudent,
  type ClassRecord,
  type StudentPayload,
  type StudentRecord,
} from '#/api';
import dayjs from 'dayjs';
import { message, Modal } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';

defineOptions({ name: 'SystemStudentPage' });

const tableLoading = ref(false);
const students = ref<StudentRecord[]>([]);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const queryForm = reactive({
  keyword: '',
  classId: undefined as undefined | number,
});

const classOptions = ref<ClassRecord[]>([]);

const drawerVisible = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const editing = ref<StudentRecord | null>(null);

const formModel = reactive<StudentPayload & { password?: string }>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  school: '',
  classId: undefined,
});

const formRules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [
    {
      validator: (_rule: never, value: string) => {
        if (!editing.value && !value) {
          return Promise.reject('请输入初始密码');
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
};

const sexLabelMap: Record<string, string> = {
  male: '男',
  female: '女',
  unknown: '未知',
};

function formatSex(value?: string | null) {
  if (!value) return '未填写';
  return sexLabelMap[value] ?? value;
}

function formatDate(value?: string | null, pattern = 'YYYY-MM-DD HH:mm') {
  return value ? dayjs(value).format(pattern) : '-';
}

const studentMetrics = computed(() => {
  const list = students.value;
  const verified = list.filter((item) => item.isVerified).length;
  const unverified = list.length - verified;
  const avgScore =
    list.length > 0
      ? Number(
          (
            list.reduce((sum, cur) => sum + (cur.score ?? 0), 0) / list.length
          ).toFixed(1),
        )
      : 0;
  const todayActive = list.filter((item) => {
    if (!item.lastVisitTime) return false;
    return dayjs(item.lastVisitTime).isSame(dayjs(), 'day');
  }).length;

  return {
    total: pagination.total ?? list.length,
    pageCount: list.length,
    verified,
    unverified,
    avgScore,
    todayActive,
  };
});

async function loadStudents(page = pagination.current, size = pagination.pageSize) {
  tableLoading.value = true;
  try {
    const {
      records = [],
      total = 0,
      current = page,
      size: pageSize = size,
    } = await fetchStudentPage({
      page,
      size,
      keyword: queryForm.keyword?.trim() || undefined,
      classId: queryForm.classId || undefined,
    });
    students.value = records;
    pagination.total = total;
    pagination.current = current;
    pagination.pageSize = pageSize;
  } finally {
    tableLoading.value = false;
  }
}

function handleTableChange(pager: TablePaginationConfig) {
  loadStudents(pager.current, pager.pageSize);
}

async function handleSearch() {
  await loadStudents(1, pagination.pageSize);
}

async function handleReset() {
  queryForm.keyword = '';
  queryForm.classId = undefined;
  await loadStudents(1, pagination.pageSize);
}

function resetFormModel() {
  formModel.username = '';
  formModel.password = '';
  formModel.name = '';
  formModel.email = '';
  formModel.phone = '';
  formModel.school = '';
  formModel.classId = undefined;
}

function openCreate() {
  editing.value = null;
  resetFormModel();
  drawerVisible.value = true;
}

function openEdit(record: StudentRecord) {
  editing.value = record;
  formModel.username = record.username;
  formModel.password = '';
  formModel.name = record.name ?? '';
  formModel.email = record.email ?? '';
  formModel.phone = record.phone ?? '';
  formModel.school = record.school ?? '';
  formModel.classId = record.classId ?? undefined;
  drawerVisible.value = true;
}

async function submitForm() {
  const form = formRef.value;
  if (!form) return;
  try {
    submitting.value = true;
    await form.validate();
    const payload = {
      username: formModel.username.trim(),
      password: formModel.password?.trim(),
      name: formModel.name?.trim(),
      email: formModel.email?.trim(),
      phone: formModel.phone?.trim(),
      school: formModel.school?.trim(),
      classId: formModel.classId,
    };
    if (!editing.value) {
      await createStudent(payload);
      message.success('学生创建成功');
    } else {
      const submitPayload: StudentPayload = { ...payload };
      if (!payload.password) {
        delete submitPayload.password;
      }
      await updateStudent(editing.value.id, submitPayload);
      message.success('学生信息已更新');
    }
    drawerVisible.value = false;
    await loadStudents();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: StudentRecord) {
  Modal.confirm({
    title: `删除学生「${record.username}」?`,
    content: '操作不可恢复，请确认后执行。',
    okType: 'danger',
    onOk: async () => {
      await deleteStudent(record.id);
      message.success('学生已删除');
      await loadStudents();
    },
  });
}

async function loadClasses() {
  try {
    const { records } = await fetchClassPage({ page: 1, size: 200 });
    classOptions.value = records ?? [];
  } catch (error) {
    console.error(error);
  }
}

function exportStudents() {
  if (!students.value.length) {
    message.warning('暂无数据可导出');
    return;
  }
  const headers = [
    'ID',
    '用户名',
    '姓名',
    '邮箱',
    '手机号',
    '学校',
    '班级ID',
    '创建时间',
  ];
  const rows = students.value.map((item) => [
    item.id,
    item.username,
    item.name ?? '',
    item.email ?? '',
    item.phone ?? '',
    item.school ?? '',
    item.classId ?? '',
    (() => {
      const created = item.createTime ?? item.createdAt ?? '';
      return created ? dayjs(created).format('YYYY-MM-DD HH:mm') : '';
    })(),
  ]);
  const csvContent =
    [headers, ...rows].map((row) =>
      row
        .map((cell) =>
          `"${String(cell ?? '').replace(/"/g, '""')}"`
        )
        .join(','),
    ).join('\n');
  const blob = new Blob([`\ufeff${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `students-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  loadStudents();
  loadClasses();
});
</script>

<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]" class="mb-4">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="学生总数" :value="studentMetrics.total" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            全部数据的总数
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="当前页已认证" :value="studentMetrics.verified" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            未认证 {{ studentMetrics.unverified }} 人
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic
            title="当前页平均积分"
            :precision="1"
            :value="studentMetrics.avgScore"
          />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            当前页 {{ studentMetrics.pageCount }} 人
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="今日活跃" :value="studentMetrics.todayActive" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            统计基于最近访问时间
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="mb-4" title="学生管理">
      <template #extra>
        <a-space wrap>
          <a-input-search
            v-model:value="queryForm.keyword"
            allow-clear
            placeholder="用户名/姓名/邮箱"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-select
            v-model:value="queryForm.classId"
            allow-clear
            placeholder="所属班级"
            style="width: 180px"
            @change="handleSearch"
          >
            <a-select-option
              v-for="item in classOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
          <a-button @click="handleReset">重置</a-button>
          <a-button @click="exportStudents">导出当前页</a-button>
          <a-button type="primary" @click="openCreate">新增学生</a-button>
        </a-space>
      </template>
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
          { title: '账号信息', key: 'profile', width: 260 },
          { title: '学籍', key: 'academy', width: 200 },
          { title: '成绩', key: 'stats', width: 160 },
          { title: '状态', key: 'status', width: 220 },
          { title: '最近活动', key: 'activity', width: 220 },
          { title: '创建时间', key: 'createdAt', width: 180 },
          {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
          },
        ]"
        :data-source="students"
        :loading="tableLoading"
        :pagination="pagination"
        :scroll="{ x: 1400 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'profile'">
            <div class="font-medium">
              {{ record.username }}
              <a-tag color="blue" class="ml-2">
                {{ formatSex(record.sex) }}
              </a-tag>
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              姓名：{{ record.name || '未填写' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              邮箱：{{ record.email || '未填写' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              手机：{{ record.phone || '未填写' }}
            </div>
          </template>
          <template v-else-if="column.key === 'academy'">
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              学校：{{ record.school || '未填写' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              班级 ID：{{ record.classId ?? '未分配' }}
            </div>
          </template>
          <template v-else-if="column.key === 'stats'">
            <div style="font-weight: 600; font-size: 16px">
              积分：{{ record.score ?? 0 }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              AC / 提交：{{ record.ac ?? 0 }} / {{ record.submit ?? 0 }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              日常挑战：{{ record.dailyChallenge ?? '0' }}
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-space wrap>
              <a-tag :color="record.isVerified ? 'success' : 'warning'">
                {{ record.isVerified ? '已验证' : '未验证' }}
              </a-tag>
              <a-tag v-if="record.lastLanguage" color="purple">
                {{ record.lastLanguage }}
              </a-tag>
            </a-space>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              注册 IP：{{ record.registerIp || '-' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              最近登录 IP：{{ record.lastLoginIp || '-' }}
            </div>
          </template>
          <template v-else-if="column.key === 'activity'">
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              最近登录：{{ formatDate(record.lastLoginTime) }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              最近访问：{{ formatDate(record.lastVisitTime) }}
            </div>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createTime || record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-button danger type="link" @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :open="drawerVisible"
      destroy-on-close
      :title="editing ? '编辑学生' : '新增学生'"
      width="420"
      @close="drawerVisible = false"
    >
      <a-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-align="left"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formModel.username" :disabled="!!editing" />
        </a-form-item>
        <a-form-item label="初始密码" name="password">
          <a-input-password
            v-model:value="formModel.password"
            :placeholder="editing ? '留空则不修改' : '请输入初始密码'"
          />
        </a-form-item>
        <a-form-item label="姓名" name="name">
          <a-input v-model:value="formModel.name" placeholder="可选" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formModel.email" placeholder="mail@example.com" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="formModel.phone" />
        </a-form-item>
        <a-form-item label="学校" name="school">
          <a-input v-model:value="formModel.school" />
        </a-form-item>
        <a-form-item label="班级ID" name="classId">
          <a-input-number
            v-model:value="formModel.classId"
            :min="1"
            style="width: 100%"
            placeholder="可选"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="drawerVisible = false">取消</a-button>
          <a-button :loading="submitting" type="primary" @click="submitForm">
            保存
          </a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>
