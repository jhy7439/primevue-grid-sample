<template>
  <SourceViewer v-if="isSourceView" />
  <v-app>
    <v-main v-if="!isSourceView">
      <div class="page-shell">
        <header class="hero">
          <div>
            <span class="eyebrow">PRIMEVUE DATATABLE</span>
            <h1>그리드 연습</h1>
            <p>평평한 주차장 데이터를 Vuetify Expansion panels로 그룹핑해 표시합니다.</p>
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
          <v-expansion-panels
            v-model="openPanels"
            class="parking-panels"
            multiple
            variant="accordion"
          >
            <v-expansion-panel
              v-for="parkingLot in groupedParkingLots"
              :key="parkingLot.id"
              :value="parkingLot.id"
              elevation="0"
            >
              <v-expansion-panel-title>
                <template #default="{ expanded }">
                  <div class="parking-title">
                    <strong>{{ parkingLot.name }}</strong>
                    <v-chip
                      :color="parkingLot.isFull ? 'error' : 'success'"
                      size="small"
                      variant="tonal"
                    >
                      {{ parkingLot.isFull ? '만차' : '여유' }}
                    </v-chip>
                    <span class="parking-capacity">
                      {{ formatCapacity(parkingLot.available, parkingLot.total) }}
                    </span>
                    <v-icon
                      class="ml-auto panel-state"
                      :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                      size="20"
                    />
                  </div>
                </template>
                <template #actions />
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <div class="parking-detail-header">
                  <span>상세 주차장</span>
                  <span>층수</span>
                  <span>현재 가능 주차대수</span>
                </div>

                <div class="parking-detail-list">
                  <div
                    v-for="detail in parkingLot.details"
                    :key="`${parkingLot.id}-${detail.area}-${detail.floor}`"
                    class="parking-detail-row"
                  >
                    <span>{{ detail.area }}</span>
                    <span>{{ detail.floor }}</span>
                    <strong>{{ formatCapacity(detail.available, detail.total) }}</strong>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

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

const parkingLots = ref([
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '1구역',
    floor: '1층',
    available: 20,
    total: 30,
  },
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '1구역',
    floor: '2층',
    available: 20,
    total: 30,
  },
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '2구역',
    floor: '1층',
    available: 20,
    total: 30,
  },
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '3구역',
    floor: '1층',
    available: 20,
    total: 30,
  },
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '3구역',
    floor: '2층',
    available: 20,
    total: 30,
  },
  {
    id: 'hwaseong',
    name: '화성사업장',
    lotAvailable: 200,
    lotTotal: 300,
    area: '3구역',
    floor: '3층',
    available: 20,
    total: 30,
  },
  {
    id: 'suwon',
    name: '수원사업장',
    lotAvailable: 0,
    lotTotal: 120,
    area: 'A구역',
    floor: 'B1층',
    available: 0,
    total: 40,
  },
  {
    id: 'suwon',
    name: '수원사업장',
    lotAvailable: 0,
    lotTotal: 120,
    area: 'A구역',
    floor: 'B2층',
    available: 0,
    total: 40,
  },
])

const groupedParkingLots = computed(() => {
  const groups = new Map()

  parkingLots.value.forEach((parking) => {
    if (!groups.has(parking.id)) {
      groups.set(parking.id, {
        id: parking.id,
        name: parking.name,
        available: parking.lotAvailable,
        total: parking.lotTotal,
        isFull: parking.lotAvailable === 0,
        details: [],
      })
    }

    groups.get(parking.id).details.push({
      area: parking.area,
      floor: parking.floor,
      available: parking.available,
      total: parking.total,
    })
  })

  return Array.from(groups.values())
})

const openPanels = ref(['hwaseong'])
const saving = ref(false)
const snackbar = ref({ open: false, message: '', color: 'success' })
const hasChanges = computed(() => rows.value.some((row) => ['C', 'U'].includes(row.status)))

const SAVE_API_URL = import.meta.env.VITE_SAVE_API_URL || '/api/rows/save'

function formatCapacity(available, total) {
  return `${available}대/총${total}대`
}

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

.parking-panels {
  margin-bottom: 18px;
  overflow: hidden;
  border: 1px solid #e6e9f0;
  border-radius: 12px;
}

.parking-title {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(120px, 1fr) auto minmax(120px, auto) auto;
  align-items: center;
  gap: 0.75rem;
}

.parking-title strong {
  color: #182136;
  font-weight: 800;
}

.parking-capacity {
  color: #4c5770;
  font-weight: 700;
  text-align: right;
}

.panel-state {
  color: #7a849b;
}

.parking-detail-header,
.parking-detail-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  align-items: center;
  gap: 0.75rem;
}

.parking-detail-header {
  padding: 0 0.75rem 0.5rem;
  color: #788198;
  font-size: 0.8rem;
  font-weight: 800;
}

.parking-detail-list {
  display: grid;
  gap: 0.5rem;
}

.parking-detail-row {
  min-height: 42px;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e6e9f0;
  border-radius: 8px;
  background: #fafbfe;
  color: #4c5770;
}

.parking-detail-row strong {
  color: #182136;
}

@media (max-width: 700px) {
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .parking-title {
    grid-template-columns: 1fr auto;
  }

  .parking-capacity {
    grid-column: 1 / -1;
    text-align: left;
  }

  .parking-detail-header {
    display: none;
  }

  .parking-detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
