<script lang="ts" setup>
import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';

import {
  createAdmin,
  deleteAdmin,
  fetchAdminPage,
  updateAdmin,
  type AdminPayload,
  type AdminRecord,
} from '#/api';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, onMounted, reactive, ref } from 'vue';

defineOptions({ name: 'SystemAdminPage' });

const tableLoading = ref(false);
const admins = ref<AdminRecord[]>([]);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const queryForm = reactive({
  keyword: '',
});

const drawerVisible = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const editing = ref<AdminRecord | null>(null);

const formModel = reactive<AdminPayload & { password?: string }>({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
});

const formRules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [
    {
      validator: (_: never, value: string) => {
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

const adminSexMap: Record<string, string> = {
  male: '男',
  female: '女',
  unknown: '未知',
};

function formatSex(value?: string | null) {
  if (!value) return '未填写';
  return adminSexMap[value] ?? value;
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-';
}

const adminMetrics = computed(() => {
  const list = admins.value;
  const activeWeek = list.filter((item) => {
    if (!item.lastLoginTime) return false;
    return dayjs(item.lastLoginTime).isAfter(dayjs().subtract(7, 'day'));
  }).length;
  const completeContact = list.filter(
    (item) => item.email && item.phone,
  ).length;
  const male = list.filter((item) => item.sex === 'male').length;
  return {
    total: pagination.total ?? list.length,
    pageCount: list.length,
    activeWeek,
    completeContact,
    male,
  };
});

async function loadAdmins(page = pagination.current, size = pagination.pageSize) {
  tableLoading.value = true;
  try {
    const {
      records = [],
      total = 0,
      current = page,
      size: pageSize = size,
    } = await fetchAdminPage({
      page,
      size,
      keyword: queryForm.keyword?.trim() || undefined,
    });
    admins.value = records;
    pagination.total = total;
    pagination.current = current;
    pagination.pageSize = pageSize;
  } finally {
    tableLoading.value = false;
  }
}

function handleTableChange(pager: TablePaginationConfig) {
  loadAdmins(pager.current, pager.pageSize);
}

function handleSearch() {
  loadAdmins(1, pagination.pageSize);
}

function resetFormModel() {
  formModel.username = '';
  formModel.password = '';
  formModel.name = '';
  formModel.email = '';
  formModel.phone = '';
}

function openCreate() {
  editing.value = null;
  resetFormModel();
  drawerVisible.value = true;
}

function openEdit(record: AdminRecord) {
  editing.value = record;
  formModel.username = record.username;
  formModel.password = '';
  formModel.name = record.name ?? '';
  formModel.email = record.email ?? '';
  formModel.phone = record.phone ?? '';
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
    };
    if (!editing.value) {
      await createAdmin(payload);
      message.success('管理员创建成功');
    } else {
      const submitPayload = { ...payload };
      if (!payload.password) {
        delete submitPayload.password;
      }
      await updateAdmin(editing.value.id, submitPayload);
      message.success('管理员信息已更新');
    }
    drawerVisible.value = false;
    await loadAdmins();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(record: AdminRecord) {
  Modal.confirm({
    title: `删除管理员「${record.username}」?`,
    content: '操作不可恢复，请确认后执行。',
    okType: 'danger',
    onOk: async () => {
      await deleteAdmin(record.id);
      message.success('管理员已删除');
      await loadAdmins();
    },
  });
}

onMounted(() => {
  loadAdmins();
});
</script>

<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]" class="mb-4">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="管理员总数" :value="adminMetrics.total" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            全部数据
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="当前页近7日登录" :value="adminMetrics.activeWeek" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            基于当前页 {{ adminMetrics.pageCount }} 人
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic
            title="当前页完善联系方式"
            :value="adminMetrics.completeContact"
          />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            同时填写邮箱与手机号
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="当前页男管理员" :value="adminMetrics.male" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            其余为女或未知
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="mb-4" title="管理员管理">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="queryForm.keyword"
            allow-clear
            placeholder="用户名/姓名/邮箱"
            style="width: 240px"
            @search="handleSearch"
          />
          <a-button type="primary" @click="openCreate">新增管理员</a-button>
        </a-space>
      </template>
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
          { title: '账号', key: 'account', width: 240 },
          { title: '联系方式', key: 'contact', width: 240 },
          { title: '最近登录', key: 'login', width: 220 },
          { title: '创建时间', key: 'createdAt', width: 180 },
          {
            title: '操作',
            key: 'action',
            width: 160,
            fixed: 'right',
          },
        ]"
        :data-source="admins"
        :loading="tableLoading"
        :pagination="pagination"
        :scroll="{ x: 1000 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'account'">
            <div class="font-medium">{{ record.username }}</div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              姓名：{{ record.name || '未填写' }}
            </div>
            <a-tag color="blue" class="mt-1">
              {{ formatSex(record.sex) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'contact'">
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              邮箱：{{ record.email || '未填写' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              手机：{{ record.phone || '未填写' }}
            </div>
          </template>
          <template v-else-if="column.key === 'login'">
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              最近登录：{{ formatDate(record.lastLoginTime) }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              登录 IP：{{ record.lastLoginIp || '-' }}
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
      :title="editing ? '编辑管理员' : '新增管理员'"
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
