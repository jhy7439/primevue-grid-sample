<template>
  <div class="page-shell">
    <header class="hero sch-hero">
      <div>
        <span class="eyebrow">CHILDCARE RECRUITMENT</span>
        <h1>어린이집 모집공고</h1>
        <p>정규모집, 추가모집, 대기자모집 공고를 한눈에 확인합니다.</p>
      </div>

      <div class="header-actions">
        <v-btn variant="outlined" prepend-icon="mdi-arrow-left" size="large" @click="$emit('go-home')">
          메인으로
        </v-btn>
      </div>
    </header>

    <section class="stats recruitment-stats">
      <article v-for="stat in recruitmentStats" :key="stat.label">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.count }}</strong>
      </article>
    </section>

    <section class="workbench">
      <div class="grid-heading recruitment-heading">
        <div>
          <b>모집공고 목록</b>
          <small>총 {{ visibleRecruitments.length }}건</small>
        </div>
        <div class="list-actions">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openRegisterPopup">
            등록
          </v-btn>
          <v-chip color="primary" variant="tonal" size="small">모집중 {{ recruitingCount }}건</v-chip>
        </div>
      </div>

      <div class="recruitment-table-wrap">
        <v-table class="recruitment-table">
          <thead>
            <tr>
              <th>진행여부</th>
              <th>제목</th>
              <th>차수</th>
              <th>총원</th>
              <th>접수기간</th>
              <th>추가모집</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in visibleRecruitments" :key="notice.id">
              <td>
                <v-chip
                  :color="notice.processYn === '모집중' ? 'success' : 'default'"
                  variant="tonal"
                  size="small"
                >
                  {{ notice.processYn }}
                </v-chip>
              </td>
              <td>
                <button type="button" class="notice-title-button" @click="openAdditionalPopup(notice)">
                  {{ notice.title }}
                </button>
              </td>
              <td>{{ getOpeningLabel(notice.openingNo) }}</td>
              <td>{{ notice.total }}명</td>
              <td>{{ notice.startDt }} ~ {{ notice.endDt }}</td>
              <td>{{ notice.drawDt }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </section>

    <SchPopup
      v-model="popupOpen"
      :mode="popupMode"
      :notice="selectedNotice"
      :recruitment-steps="recruitmentSteps"
      @saved="fetchRecruitments"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SchPopup from '../components/SchPopup.vue'

defineEmits(['go-home'])

const recruitments = [
  {
    id: 1,
    processYn: '모집중',
    title: '2026년 어린이집 정규모집 공고',
    openingNo: 0,
    total: 30,
    startDt: '2026-07-01',
    endDt: '2026-08-01',
    drawDt: '2026-08-02',
  },
  {
    id: 2,
    processYn: '모집중',
    title: '2026년 어린이집 추가모집 공고',
    openingNo: 1,
    total: 12,
    startDt: '2026-08-02',
    endDt: '2026-08-16',
    drawDt: '2026-08-17',
  },
  {
    id: 3,
    processYn: '모집중',
    title: '2026년 어린이집 추가모집(추가) 공고',
    openingNo: 2,
    total: 8,
    startDt: '2026-08-20',
    endDt: '2026-08-31',
    drawDt: '2026-09-01',
  },
]

const visibleRecruitments = computed(() => recruitments.filter((notice) => isRecruitmentVisible(notice.openingNo)))

const recruitmentSteps = computed(() =>
  visibleRecruitments.value.map((notice) => ({
    openingNo: notice.openingNo,
    processYn: notice.processYn,
    startDt: notice.startDt,
    endDt: notice.endDt,
    drawDt: notice.drawDt,
    admissionDt: notice.admissionDt || '2026-09-01',
  })),
)

const recruitmentStats = computed(() => [
  { label: '정규모집', count: visibleRecruitments.value.filter((notice) => getRecruitmentType(notice.openingNo) === 'regular').length },
  { label: '추가모집', count: visibleRecruitments.value.filter((notice) => getRecruitmentType(notice.openingNo) === 'additional').length },
  { label: '대기자모집', count: visibleRecruitments.value.filter((notice) => getRecruitmentType(notice.openingNo) === 'waitlist').length },
])

const recruitingCount = computed(() => visibleRecruitments.value.filter((notice) => notice.processYn === '모집중').length)

const popupOpen = ref(false)
const popupMode = ref('regular')
const selectedNotice = ref(null)

function openRegisterPopup() {
  popupMode.value = 'regular'
  selectedNotice.value = null
  popupOpen.value = true
}

function openAdditionalPopup(notice) {
  popupMode.value = 'additional'
  selectedNotice.value = getPopupTargetNotice(notice)
  popupOpen.value = true
}

async function fetchRecruitments() {
  const listUrl = import.meta.env.VITE_SCH_LIST_API_URL

  if (!listUrl) {
    console.log('reload recruitment notices')
    return
  }

  const response = await fetch(listUrl)
  if (!response.ok) {
    throw new Error(`목록 조회 실패 (${response.status})`)
  }

  console.log('reloaded recruitment notices', await response.json())
}

function getRecruitmentType(openingNo) {
  if (openingNo === 0) return 'regular'
  if (openingNo >= 1 && openingNo <= 98) return 'additional'
  if (openingNo === 99) return 'waitlist'
  return 'unknown'
}

function getOpeningLabel(openingNo) {
  if (openingNo === 0) return '정규모집'
  if (openingNo === 1) return '추가모집'
  if (openingNo >= 2 && openingNo <= 98) return `추가모집(${openingNo}차)`
  if (openingNo === 99) return '대기자모집'
  return '-'
}

function isRecruitmentVisible(openingNo) {
  if (openingNo <= 1 || openingNo === 99) return true
  if (openingNo > 98) return false

  return isRecruitmentCompleted(openingNo - 1)
}

function isRecruitmentCompleted(openingNo) {
  const notice = recruitments.find((item) => item.openingNo === openingNo)
  return ['마감', '완료'].includes(notice?.processYn)
}

function getPopupTargetNotice(notice) {
  if (!isRecruitmentCompleted(notice.openingNo)) return notice

  const nextNotice = recruitments.find((item) => item.openingNo === notice.openingNo + 1)
  if (!nextNotice || !isRecruitmentVisible(nextNotice.openingNo)) return notice

  return nextNotice
}
</script>

<style scoped>
.sch-hero {
  align-items: center;
}

.recruitment-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.recruitment-heading {
  margin: -18px -18px 0;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recruitment-table-wrap {
  overflow-x: auto;
}

.recruitment-table {
  min-width: 860px;
}

.recruitment-table :deep(th) {
  color: #4c5770;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.recruitment-table :deep(td) {
  color: #4c5770;
  font-weight: 600;
  white-space: nowrap;
}

.notice-title-button {
  padding: 0;
  color: #182136;
  font: inherit;
  font-weight: 800;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.notice-title-button:hover {
  color: #3157d5;
  text-decoration: underline;
}

@media (max-width: 700px) {
  .sch-hero {
    align-items: start;
  }

  .recruitment-stats {
    grid-template-columns: 1fr;
  }

  .list-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
