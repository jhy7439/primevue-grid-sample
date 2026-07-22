<template>
  <v-dialog :model-value="modelValue" max-width="1120" persistent scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card class="sch-popup">
      <v-card-title class="popup-title">
        <div>
          <strong>어린이집 모집공고 등록</strong>
          <span>{{ modeLabel }}</span>
        </div>
        <v-btn icon="mdi-close" variant="text" :disabled="saving" @click="close" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-expansion-panels v-model="openPanels" multiple variant="accordion" class="popup-panels">
          <v-expansion-panel value="notice">
            <v-expansion-panel-title>모집공고</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="form-grid">
                <v-text-field
                  v-model="noticeForm.recruitYear"
                  type="number"
                  label="모집년도"
                  min="2000"
                  max="2100"
                  density="comfortable"
                  variant="outlined"
                />
                <v-text-field
                  v-model="noticeForm.title"
                  label="제목"
                  density="comfortable"
                  variant="outlined"
                />
                <v-textarea
                  v-model="noticeForm.content"
                  class="content-field"
                  label="내용"
                  rows="5"
                  density="comfortable"
                  variant="outlined"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel
            v-for="step in visibleRecruitmentForms"
            :key="step.key"
            :value="step.key"
            :disabled="isPanelLocked(step)"
          >
            <v-expansion-panel-title>
              {{ step.label }}
              <v-chip v-if="isFormReadonly(step)" class="ml-3" size="x-small" variant="tonal">
                수정불가
              </v-chip>
              <v-chip v-if="isPanelLocked(step)" class="ml-3" size="x-small" variant="tonal">
                등록불가
              </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <SchPanel :form="step.form" :disabled="isFormReadonly(step)" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions class="popup-actions">
        <v-spacer />
        <v-btn variant="outlined" :disabled="saving" @click="close">취소</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="save">저장</v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.open" :color="snackbar.color">
      {{ snackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import SchPanel from './SchPanel.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'regular' },
  notice: { type: Object, default: null },
  recruitmentSteps: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const openPanels = ref([])
const saving = ref(false)
const snackbar = ref({ open: false, message: '', color: 'success' })
const noticeForm = reactive({
  recruitYear: '2026',
  title: '',
  content: '',
})
const recruitmentForms = reactive([])

const isRegularMode = computed(() => props.mode === 'regular')
const isAdditionalMode = computed(() => props.mode === 'additional')
const selectedRecruitmentKey = computed(() => getRecruitmentKey(props.notice?.openingNo) || firstAdditionalStep.value?.key)
const firstRegularStep = computed(() => recruitmentForms.find((step) => step.type === 'regular'))
const firstAdditionalStep = computed(() => recruitmentForms.find((step) => step.type === 'additional'))
const visibleRecruitmentForms = computed(() => {
  if (!isRegularMode.value) return recruitmentForms

  return recruitmentForms.filter((step) => step.openingNo === 0 || step.openingNo === 1 || step.openingNo === 99)
})
const modeLabel = computed(() => {
  if (!isAdditionalMode.value) return '정규모집 등록'

  const selectedStep = recruitmentForms.find((step) => step.key === selectedRecruitmentKey.value)
  return `${selectedStep?.label || '추가모집'} 등록`
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return

    setInitialForm()
    openPanels.value = isAdditionalMode.value
      ? [selectedRecruitmentKey.value].filter(Boolean)
      : ['notice', firstRegularStep.value?.key].filter(Boolean)
  },
)

function createRecruitmentForm(step = {}) {
  return {
    startDt: step.startDt || '2026-07-01',
    endDt: step.endDt || '2026-08-01',
    drawDt: step.drawDt || '2026-08-02',
    admissionDt: step.admissionDt || '2026-09-01',
    nurseries: [
      {
        nurseryId: 'N001',
        nurseryNm: '햇살어린이집',
        age0: 3,
        age1: 4,
        age2: 5,
        age3: 6,
        age4: 6,
        age5: 6,
      },
      {
        nurseryId: 'N002',
        nurseryNm: '푸른숲어린이집',
        age0: 2,
        age1: 3,
        age2: 4,
        age3: 5,
        age4: 5,
        age5: 5,
      },
    ],
  }
}

function setInitialForm() {
  noticeForm.recruitYear = String(props.notice?.recruitYear || '2026')
  noticeForm.title = props.notice?.title || '2026년 어린이집 모집공고'
  noticeForm.content = props.notice?.content || ''

  recruitmentForms.splice(
    0,
    recruitmentForms.length,
    ...props.recruitmentSteps.map((step) => ({
      ...step,
      key: getRecruitmentKey(step.openingNo),
      label: getOpeningLabel(step.openingNo),
      type: getRecruitmentType(step.openingNo),
      form: createRecruitmentForm(step),
    })),
  )
}

function isFormReadonly(step) {
  return isAdditionalMode.value && step.type === 'regular'
}

function isPanelLocked(step) {
  return isRegularMode.value && step.type === 'additional'
}

function close() {
  if (saving.value) return
  emit('update:modelValue', false)
}

function createSavePayload() {
  return {
    mode: props.mode,
    selectedRecruitmentKey: selectedRecruitmentKey.value,
    notice: { ...noticeForm },
    recruitments: visibleRecruitmentForms.value.map((step) => ({
      key: step.key,
      label: step.label,
      type: step.type,
      openingNo: step.openingNo,
      form: step.form,
    })),
  }
}

async function save() {
  saving.value = true

  try {
    const payload = createSavePayload()
    await saveRecruitmentNotice(payload)

    snackbar.value = {
      open: true,
      message: '모집공고를 저장했습니다.',
      color: 'success',
    }
    emit('saved', payload)
    emit('update:modelValue', false)
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

async function saveRecruitmentNotice(payload) {
  const saveUrl = import.meta.env.VITE_SCH_SAVE_API_URL

  if (!saveUrl) {
    console.log('save recruitment notice', payload)
    return
  }

  const response = await fetch(saveUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`저장 실패 (${response.status})`)
  }
}

function getRecruitmentKey(openingNo) {
  if (typeof openingNo !== 'number') return ''
  return `opening-${openingNo}`
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
</script>

<style scoped>
.sch-popup {
  border-radius: 8px;
}

.popup-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
}

.popup-title strong,
.popup-title span {
  display: block;
}

.popup-title strong {
  color: #182136;
  font-size: 20px;
  font-weight: 900;
}

.popup-title span {
  margin-top: 4px;
  color: #65708a;
  font-size: 13px;
  font-weight: 700;
}

.popup-panels {
  border: 1px solid #e6e9f0;
  border-radius: 8px;
  overflow: hidden;
}

.content-field {
  grid-column: 1 / -1;
}

.popup-actions {
  padding: 14px 22px;
}
</style>
