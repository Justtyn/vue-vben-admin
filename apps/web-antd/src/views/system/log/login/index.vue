<script lang="ts" setup>
import type { RangeValue } from 'ant-design-vue/es/date-picker/generatePicker';
import type { Dayjs } from 'dayjs';
import type { TablePaginationConfig } from 'ant-design-vue';

import { fetchLoginLogs, type LoginLogRecord } from '#/api';
import dayjs from 'dayjs';
import { computed, onMounted, reactive, ref } from 'vue';

defineOptions({ name: 'SystemLoginLogPage' });

const tableLoading = ref(false);
const logs = ref<LoginLogRecord[]>([]);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
});

const queryForm = reactive<{
  role?: string;
  userId?: string;
  range?: RangeValue<Dayjs>;
}>({
  role: undefined,
  userId: '',
  range: undefined,
});

const roleLabelMap: Record<string, string> = {
  admin: '管理员',
  teacher: '教师',
  student: '学生',
};

const logMetrics = computed(() => {
  const list = logs.value;
  const success = list.filter((item) => item.success).length;
  const fail = list.length - success;
  const successRate =
    list.length > 0 ? Number(((success / list.length) * 100).toFixed(1)) : 0;
  const todayCount = list.filter((item) =>
    dayjs(item.loginTime).isSame(dayjs(), 'day'),
  ).length;
  return {
    total: pagination.total ?? 0,
    pageCount: list.length,
    success,
    fail,
    successRate,
    todayCount,
  };
});

async function loadLogs(page = pagination.current, size = pagination.pageSize) {
  tableLoading.value = true;
  try {
    const params = {
      page,
      size,
      role: queryForm.role || undefined,
      userId: queryForm.userId?.trim() || undefined,
      startTime: queryForm.range?.[0]
        ? queryForm.range[0].startOf('day').toISOString()
        : undefined,
      endTime: queryForm.range?.[1]
        ? queryForm.range[1].endOf('day').toISOString()
        : undefined,
    };
    const {
      records = [],
      total = 0,
      current = page,
      size: pageSize = size,
    } = await fetchLoginLogs(params);
    logs.value = records;
    pagination.total = total;
    pagination.current = current;
    pagination.pageSize = pageSize;
  } finally {
    tableLoading.value = false;
  }
}

function handleTableChange(pager: TablePaginationConfig) {
  loadLogs(pager.current, pager.pageSize);
}

function handleSearch() {
  loadLogs(1, pagination.pageSize);
}

function handleReset() {
  queryForm.role = undefined;
  queryForm.userId = '';
  queryForm.range = undefined;
  loadLogs(1, pagination.pageSize);
}

function renderTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
}

onMounted(() => {
  loadLogs();
});
</script>

<template>
  <div class="p-4">
    <a-row :gutter="[16, 16]" class="mb-4">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="日志总数" :value="logMetrics.total" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            分页总计
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic
            title="当前页成功率"
            :value="logMetrics.successRate"
            suffix="%"
            :precision="1"
          />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            成功 {{ logMetrics.success }} / 失败 {{ logMetrics.fail }}
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="今日登录" :value="logMetrics.todayCount" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            统计基于 loginTime
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :body-style="{ padding: '16px' }">
          <a-statistic title="当前页记录数" :value="logMetrics.pageCount" />
          <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
            当前分页展示的数量
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="mb-4" title="登录日志">
      <template #extra>
        <a-space wrap>
          <a-select
            v-model:value="queryForm.role"
            allow-clear
            placeholder="角色"
            style="width: 140px"
          >
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="teacher">教师</a-select-option>
            <a-select-option value="student">学生</a-select-option>
          </a-select>
          <a-input
            v-model:value="queryForm.userId"
            placeholder="用户ID"
            style="width: 160px"
          />
          <a-range-picker
            v-model:value="queryForm.range"
            style="width: 260px"
            allow-clear
          />
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </a-space>
      </template>

      <a-table
        :columns="[
          { title: '日志ID', dataIndex: 'id', width: 180, fixed: 'left' },
          { title: '用户', key: 'user', width: 240 },
          { title: '设备/IP', key: 'device', width: 320 },
          { title: '结果', key: 'result', width: 220 },
          { title: '登录时间', dataIndex: 'loginTime', width: 200 },
          { title: '登出时间', dataIndex: 'logoutTime', width: 200 },
        ]"
        :data-source="logs"
        :loading="tableLoading"
        :pagination="pagination"
        :scroll="{ x: 1400 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'user'">
            <div class="font-medium">{{ record.username }}</div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              用户 ID：{{ record.userId }}
            </div>
            <a-tag color="blue" class="mt-1">
              {{ roleLabelMap[record.role] || record.role }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'device'">
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              设备：{{ record.device || '未识别' }}
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              IP：{{ record.ipAddress }}
              <span v-if="record.location">（{{ record.location }}）</span>
            </div>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              UA：{{ record.userAgent || '-' }}
            </div>
          </template>
          <template v-else-if="column.key === 'result'">
            <a-tag :color="record.success ? 'success' : 'error'">
              {{ record.success ? '成功' : '失败' }}
            </a-tag>
            <div style="font-size: 12px; color: var(--ant-color-text-tertiary)">
              {{ record.failReason || '—' }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'loginTime'">
            {{ renderTime(text) }}
          </template>
          <template v-else-if="column.dataIndex === 'logoutTime'">
            {{ renderTime(text) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
