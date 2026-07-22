# 어린이집 모집공고 화면 제작 가이드

이 문서는 어린이집 모집공고 화면을 처음 만들 때 어떤 순서로 구현하면 좋은지 정리한 가이드입니다.

대상 파일은 다음 3개입니다.

- `src/page/schPage.vue`
- `src/components/SchPopup.vue`
- `src/components/SchPanel.vue`

## 전체 구조

어린이집 모집공고 화면은 역할을 3개 컴포넌트로 나눕니다.

```text
schPage.vue
  └── SchPopup.vue
        └── SchPanel.vue
```

각 파일의 역할은 다음과 같습니다.

```text
schPage.vue  = 목록 화면, 팝업 호출, 저장 후 재조회 담당
SchPopup.vue = 등록 팝업, 패널 구성, 저장 처리 담당
SchPanel.vue = 정규/추가 모집 입력 폼 담당
```

## 1. schPage.vue 만들기

먼저 목록 화면을 만듭니다.

`schPage.vue`의 핵심 역할은 다음과 같습니다.

- 어린이집 모집공고 목록 표시
- 등록 버튼 표시
- 제목 클릭 시 팝업 열기
- 팝업 저장 성공 시 목록 재조회

처음에는 샘플 목록 데이터를 준비합니다.

```js
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
]
```

`openingNo`는 숫자 기준으로 구분합니다.

```text
openingNo = 0      정규모집
openingNo = 1~98   추가모집
openingNo = 99     대기자모집
```

화면에 보여줄 문구는 함수로 변환합니다.

```js
function getOpeningLabel(openingNo) {
  if (openingNo === 0) return '정규모집'
  if (openingNo === 1) return '추가모집'
  if (openingNo >= 2 && openingNo <= 98) return `추가모집(${openingNo}차)`
  if (openingNo === 99) return '대기자모집'
  return '-'
}
```

목록에서는 이렇게 표시합니다.

```vue
<td>{{ getOpeningLabel(notice.openingNo) }}</td>
```

모집 유형 판단도 함수로 분리합니다.

```js
function getRecruitmentType(openingNo) {
  if (openingNo === 0) return 'regular'
  if (openingNo >= 1 && openingNo <= 98) return 'additional'
  if (openingNo === 99) return 'waitlist'
  return 'unknown'
}
```

## 2. SchPanel.vue 만들기

`SchPanel.vue`는 정규모집, 추가모집, 추가모집 2차에서 반복해서 사용하는 공통 입력 폼입니다.

담당하는 입력 항목은 다음과 같습니다.

- 모집시작일
- 모집종료일
- 추첨일
- 입교일
- 어린이집별 연령반 정원

`SchPanel.vue`는 자기 데이터를 직접 만들지 않고 부모에게 받습니다.

```js
defineProps({
  form: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})
```

즉 데이터 흐름은 다음과 같습니다.

```text
SchPopup.vue의 form 데이터
→ SchPanel.vue의 props.form
→ 화면 입력 필드에 표시
```

`disabled` 값이 `true`면 입력 필드는 수정 불가가 됩니다.

```vue
<v-text-field
  v-model="form.startDt"
  type="date"
  label="모집시작일"
  :disabled="disabled"
/>
```

어린이집 연령반 컬럼은 배열로 반복합니다.

```js
const ageFields = ['age0', 'age1', 'age2', 'age3', 'age4', 'age5']
```

```vue
<td v-for="age in ageFields" :key="age">
  <v-text-field
    v-model.number="nursery[age]"
    type="number"
    :disabled="disabled"
  />
</td>
```

## 3. SchPopup.vue 만들기

`SchPopup.vue`는 등록 팝업입니다.

핵심 역할은 다음과 같습니다.

- 팝업 열기/닫기
- 모집공고 기본정보 입력
- 모집 차수별 패널 생성
- 저장 처리
- 저장 성공 시 부모에게 알림

부모에게 받는 값은 다음과 같습니다.

```js
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'regular' },
  notice: { type: Object, default: null },
  recruitmentSteps: { type: Array, default: () => [] },
})
```

각 값의 의미는 다음과 같습니다.

```text
modelValue        팝업 열림 여부
mode              정규모집 등록인지, 추가모집 등록인지
notice            클릭한 모집공고 데이터
recruitmentSteps  팝업 안에 그릴 모집 차수 목록
```

팝업은 `recruitmentSteps` 데이터를 기준으로 모집 패널을 자동 생성합니다.

```vue
<v-expansion-panel
  v-for="step in visibleRecruitmentForms"
  :key="step.key"
  :value="step.key"
>
  <v-expansion-panel-title>
    {{ step.label }}
  </v-expansion-panel-title>

  <v-expansion-panel-text>
    <SchPanel :form="step.form" :disabled="isFormReadonly(step)" />
  </v-expansion-panel-text>
</v-expansion-panel>
```

이렇게 만들면 `추가모집 2차`, `추가모집 3차`가 생겨도 데이터를 추가하는 방식으로 확장할 수 있습니다.

## 4. schPage.vue에서 SchPopup 연결하기

목록 화면에서 팝업 컴포넌트를 연결합니다.

```vue
<SchPopup
  v-model="popupOpen"
  :mode="popupMode"
  :notice="selectedNotice"
  :recruitment-steps="recruitmentSteps"
  @saved="fetchRecruitments"
/>
```

팝업 제어용 상태를 만듭니다.

```js
const popupOpen = ref(false)
const popupMode = ref('regular')
const selectedNotice = ref(null)
```

등록 버튼을 누르면 정규모집 등록 모드로 팝업을 엽니다.

```js
function openRegisterPopup() {
  popupMode.value = 'regular'
  selectedNotice.value = null
  popupOpen.value = true
}
```

목록 제목을 클릭하면 추가모집 등록 모드로 팝업을 엽니다.

```js
function openAdditionalPopup(notice) {
  popupMode.value = 'additional'
  selectedNotice.value = getPopupTargetNotice(notice)
  popupOpen.value = true
}
```

## 5. v-model과 modelValue 흐름

부모에서 팝업을 이렇게 사용합니다.

```vue
<SchPopup v-model="popupOpen" />
```

Vue는 이것을 내부적으로 다음처럼 해석합니다.

```vue
<SchPopup
  :model-value="popupOpen"
  @update:model-value="popupOpen = $event"
/>
```

그래서 자식인 `SchPopup.vue`에서는 `modelValue`라는 이름으로 받아야 합니다.

```js
defineProps({
  modelValue: { type: Boolean, default: false },
})
```

팝업을 닫고 싶을 때는 자식에서 부모에게 이벤트를 보냅니다.

```js
emit('update:modelValue', false)
```

데이터 흐름은 다음과 같습니다.

```text
schPage.vue의 popupOpen
→ SchPopup.vue의 modelValue
→ v-dialog 열림/닫힘 제어
```

닫을 때는 반대 방향입니다.

```text
SchPopup.vue에서 emit('update:modelValue', false)
→ schPage.vue의 popupOpen = false
→ 팝업 닫힘
```

## 6. defineEmits와 saved 이벤트

`SchPopup.vue`에는 다음 코드가 있습니다.

```js
const emit = defineEmits(['update:modelValue', 'saved'])
```

이 코드는 자식 컴포넌트가 부모에게 보낼 수 있는 이벤트 목록을 선언합니다.

```text
update:modelValue  팝업 열림/닫힘 값을 바꿔달라는 이벤트
saved              저장이 성공했다는 이벤트
```

저장이 성공하면 팝업에서 다음 코드를 실행합니다.

```js
emit('saved', payload)
```

이 뜻은 다음과 같습니다.

```text
부모야, 저장이 성공했어. 저장한 데이터는 payload야.
```

부모인 `schPage.vue`는 이 이벤트를 받습니다.

```vue
@saved="fetchRecruitments"
```

그래서 저장이 성공하면 목록 재조회 함수가 실행됩니다.

```text
SchPopup.vue에서 저장 성공
→ emit('saved', payload)
→ schPage.vue의 @saved 실행
→ fetchRecruitments() 호출
→ 목록 재조회
```

## 7. 저장 흐름

저장 버튼을 누르면 `SchPopup.vue` 안에서 저장을 처리합니다.

```text
팝업 저장 버튼 클릭
→ SchPopup.vue에서 payload 생성
→ 저장 API 호출
→ 정상 저장
→ emit('saved', payload)
→ emit('update:modelValue', false)
```

부모는 저장 로직을 직접 하지 않고, 저장 성공 후 재조회만 담당합니다.

```text
SchPopup.vue = 저장 담당
schPage.vue  = 저장 후 목록 재조회 담당
```

## 8. 추가모집 차수 표시 조건

추가모집 2차 이상은 이전 차수가 완료되어야 보입니다.

```js
function isRecruitmentVisible(openingNo) {
  if (openingNo <= 1 || openingNo === 99) return true
  if (openingNo > 98) return false

  return isRecruitmentCompleted(openingNo - 1)
}
```

완료 여부는 현재 `마감` 또는 `완료` 상태로 판단합니다.

```js
function isRecruitmentCompleted(openingNo) {
  const notice = recruitments.find((item) => item.openingNo === openingNo)
  return ['마감', '완료'].includes(notice?.processYn)
}
```

예를 들어:

```text
정규모집(openingNo 0)이 완료
→ 추가모집(openingNo 1) 패널 열림

추가모집(openingNo 1)이 완료
→ 추가모집(2차, openingNo 2) 패널 열림
```

제목 클릭 시에는 클릭한 공고가 완료되었는지 확인하고, 완료되었다면 다음 차수로 이동합니다.

```js
function getPopupTargetNotice(notice) {
  if (!isRecruitmentCompleted(notice.openingNo)) return notice

  const nextNotice = recruitments.find((item) => item.openingNo === notice.openingNo + 1)
  if (!nextNotice || !isRecruitmentVisible(nextNotice.openingNo)) return notice

  return nextNotice
}
```

## 9. 추천 제작 순서 요약

처음부터 만든다면 아래 순서를 추천합니다.

```text
1. schPage.vue
   목록 데이터 만들기
   테이블 출력
   openingNo 표시 함수 만들기

2. SchPanel.vue
   정규/추가 모집 공통 입력 폼 만들기
   form, disabled props 받기

3. SchPopup.vue
   v-dialog 만들기
   모집공고 기본정보 만들기
   recruitmentSteps 기준으로 패널 반복 생성
   SchPanel 연결
   저장 처리 후 emit('saved')

4. schPage.vue
   SchPopup import
   popupOpen, popupMode, selectedNotice 상태 만들기
   등록 버튼 클릭 연결
   제목 클릭 연결
   @saved로 재조회 연결
```

## 핵심 정리

가장 중요한 설계는 다음과 같습니다.

```text
props = 부모에서 자식으로 데이터 전달
emit  = 자식에서 부모로 이벤트 전달
```

이 화면에서는 다음처럼 사용합니다.

```text
schPage.vue → SchPopup.vue
  popupOpen, popupMode, selectedNotice, recruitmentSteps 전달

SchPopup.vue → schPage.vue
  update:modelValue 이벤트로 팝업 닫기 요청
  saved 이벤트로 저장 성공 알림

SchPopup.vue → SchPanel.vue
  모집 차수별 form 전달
```
