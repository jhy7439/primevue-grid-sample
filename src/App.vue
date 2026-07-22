<template>
  <SourceViewer v-if="isSourceView" />
  <v-app>
    <v-main v-if="!isSourceView">
      <SchPage v-if="isSchPage" @go-home="goHome" />
      <div v-else class="page-shell">
        <header class="hero">
          <div>
            <span class="eyebrow">PRIMEVUE DATATABLE</span>
            <h1>그리드 연습</h1>
            <p>평평한 주차장 데이터를 Vuetify Expansion panels로 그룹핑해 표시합니다.</p>
          </div>

          <div class="header-actions">
            <v-btn variant="tonal" prepend-icon="mdi-calendar-search" size="large" @click="goToSchPage">
              SCH 페이지
            </v-btn>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CommonTable from './components/CommonTable.vue'
import SourceViewer from './components/SourceViewer.vue'
import SchPage from './page/schPage.vue'

const currentPath = ref(window.location.pathname)
const isSourceView = computed(() => currentPath.value === '/source')
const isSchPage = computed(() => currentPath.value === '/schPage')

function syncPath() {
  currentPath.value = window.location.pathname
}

function movePage(path) {
  if (window.location.pathname === path) return

  window.history.pushState({}, '', path)
  syncPath()
}

function goHome() {
  movePage('/')
}

function goToSchPage() {
  movePage('/schPage')
}

onMounted(() => {
  window.addEventListener('popstate', syncPath)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncPath)
})

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

// parkingLots는 API 응답처럼 주차장 정보와 상세 구역 정보가 한 줄에 같이 있는 평평한 배열입니다.
// 화면의 v-expansion-panel은 주차장 하나당 패널 하나가 필요하므로, 같은 id를 가진 행들을 하나로 묶어
// { id, name, available, total, isFull, details: [...] } 형태의 화면 전용 데이터로 변환합니다.
const groupedParkingLots = computed(() => {
  // Map은 key(id) 기준으로 데이터를 빠르게 찾고 누적하기 좋습니다.
  // 예: groups.get('hwaseong')은 화성사업장 패널 데이터를 가리킵니다.
  const groups = new Map()

  parkingLots.value.forEach((parking) => {
    // 같은 주차장 id가 처음 등장한 경우에만 패널 제목에 표시할 상위 정보를 생성합니다.
    // 이후 같은 id가 다시 나오면 이 블록은 건너뛰고 details에 상세 구역만 추가됩니다.
    if (!groups.has(parking.id)) {
      groups.set(parking.id, {
        id: parking.id,
        name: parking.name,
        // lotAvailable/lotTotal은 패널 제목에 표시되는 주차장 전체 가능/총 주차대수입니다.
        // 상세 행의 available/total과 이름이 겹치지 않도록 데이터에서 키를 분리했습니다.
        available: parking.lotAvailable,
        total: parking.lotTotal,
        isFull: parking.lotAvailable === 0,
        details: [],
      })
    }

    // 현재 행의 area/floor/available/total은 패널 내부 목록에 표시할 상세 주차장 정보입니다.
    // 같은 id를 가진 행들이 같은 details 배열 안에 차곡차곡 쌓입니다.
    groups.get(parking.id).details.push({
      area: parking.area,
      floor: parking.floor,
      available: parking.available,
      total: parking.total,
    })
  })

  // template의 v-for는 배열을 순회하므로 Map의 value들만 배열로 변환해서 반환합니다.
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
