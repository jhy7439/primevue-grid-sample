<template>
  <SourceViewer v-if="isSourceView" />
  <v-app>
    <v-main v-if="!isSourceView">
      <div class="page-shell">
        <header class="hero">
          <div>
            <span class="eyebrow">PRIMEVUE DATATABLE</span>
            <h1>그리드 연습</h1>
          </div>

          <div class="header-actions">
            <v-btn variant="outlined" prepend-icon="mdi-plus" size="large" @click="addRow">
              행 추가
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              size="large"
              :loading="saving"
              :disabled="saving || !hasChanges"
              @click="save"
            >
              저장
            </v-btn>
          </div>
        </header>

        <section class="workbench">
          <CommonTable :items="rows" :columns="columns" />
        </section>
      </div>

      <v-snackbar v-model="snackbar.open" :color="snackbar.color">
        {{ snackbar.message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>


<script setup>
import { computed, ref } from 'vue'
import CommonTable from './components/CommonTable.vue'
import SourceViewer from './components/SourceViewer.vue'

const isSourceView = window.location.pathname === '/source'

const columns = [
  { field: 'id', header: '번호' },
  { field: 'name', header: '이름' },
  { field: 'team', header: '팀', editable: false },
  { field: 'role', header: '직무' },
  { field: 'status', header: '변경 상태', editable: false },
]

const rows = ref([
  { id: 1, name: '김민준', team: '플랫폼', role: '프론트엔드', status: '' },
  { id: 2, name: '이서연', team: '디자인', role: '프로덕트 디자이너', status: '' },
  { id: 3, name: '박도윤', team: '데이터', role: '데이터 엔지니어', status: '' },
])

const saving = ref(false)
const snackbar = ref({ open: false, message: '', color: 'success' })
const hasChanges = computed(() => rows.value.some((row) => ['C', 'U'].includes(row.status)))

const SAVE_API_URL = import.meta.env.VITE_SAVE_API_URL || '/api/rows/save'

function addRow() {
  const nextId = Math.max(0, ...rows.value.map((row) => row.id)) + 1

  rows.value.unshift({
    id: nextId,
    name: '',
    team: '아스날',
    role: '',
    status: 'C',
    _inputMode: true,
    _readonlyFields: ['team'],
  })
}

function createSavePayload() {
  return rows.value
    .filter((row) => ['C', 'U'].includes(row.status))
    .map(({ _inputMode, _readonlyFields, ...row }) => ({ ...row }))
}

async function save() {
  const saveRows = createSavePayload()
  if (saveRows.length === 0) return

  saving.value = true

  try {
    const response = await fetch(SAVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: saveRows }),
    })

    if (!response.ok) {
      throw new Error(`저장 실패 (${response.status})`)
    }

    const savedIds = new Set(saveRows.map((row) => row.id))
    rows.value = rows.value.map((row) => {
      if (!savedIds.has(row.id)) return row

      const { _inputMode, _readonlyFields, ...savedRow } = row
      return { ...savedRow, status: '' }
    })

    snackbar.value = {
      open: true,
      message: `${saveRows.length}개 행을 저장했습니다.`,
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      open: true,
      message: error.message || '저장 중 오류가 발생했습니다.',
      color: 'error',
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
