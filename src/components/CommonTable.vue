<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

defineProps({
  // 부모(App.vue)가 관리하는 실제 행 데이터
  items: { type: Array, default: () => [] },
  // field, header, editable 등의 컬럼 설정
  columns: { type: Array, default: () => [] },
})

// 기존 행에서 현재 편집 중인 셀의 고유 키를 저장한다.
// 예: 2번 행의 name 셀을 편집하면 '2:name'
const editingCell = ref(null)

// 행 ID와 컬럼명을 조합하여 각 셀을 구분한다.
function cellKey(row, column) {
  return `${row.id}:${column.field}`
}

// 현재 셀을 InputText로 렌더링할지 판단한다.
function isEditing(row, column, columnIndex) {
  // 첫 번째 컬럼과 editable:false 컬럼은 항상 읽기 전용이다.
  if (columnIndex === 0 || column.editable === false) return false

  // 특정 행에서만 읽기 전용으로 지정된 필드도 편집하지 않는다.
  if (row._readonlyFields?.includes(column.field)) return false

  // 신규 행은 편집 가능한 모든 셀을 input으로 표시한다.
  // 기존 행은 더블클릭한 셀 하나만 input으로 표시한다.
  return row._inputMode || editingCell.value === cellKey(row, column)
}

// 기존 행의 셀을 더블클릭했을 때 편집을 시작한다.
function startEditing(row, column, columnIndex) {
  // 읽기 전용 셀이면 편집 상태로 전환하지 않는다.
  if (columnIndex === 0 || column.editable === false || row._readonlyFields?.includes(column.field)) return

  // 하나의 키만 저장하므로 동시에 한 셀만 편집할 수 있다.
  editingCell.value = cellKey(row, column)
}

// 포커스 이탈, Enter, Esc 입력 시 기존 행의 편집을 종료한다.
function stopEditing(row) {
  // 신규 행은 저장 전까지 전체 input 모드를 유지한다.
  if (row._inputMode) return
  editingCell.value = null
}

// 사용자가 셀 값을 변경하면 저장 대상 행으로 표시한다.
function markUpdated(row) {
  // 신규 행(C)은 수정해도 계속 생성 상태를 유지한다.
  // 기존 행만 수정 상태(U)로 변경한다.
  if (row.status !== 'C') row.status = 'U'
}
</script>

<template>
  <!-- 부모가 전달한 행 배열을 DataTable에 연결한다. -->
  <DataTable
    :value="items"
    data-key="id"
    striped-rows
    table-style="min-width: 50rem"
  >
    <!-- 부모가 전달한 columns 배열로 컬럼을 동적으로 생성한다. -->
    <Column
      v-for="(column, columnIndex) in columns"
      :key="column.field"
      :field="column.field"
      :header="column.header"
    >
      <template #body="{ data }">
        <!-- 편집 중이 아니면 일반 텍스트 셀을 표시한다. -->
        <span
          v-if="!isEditing(data, column, columnIndex)"
          :class="[
            'cell-value',
            {
              'cell-editable': columnIndex !== 0
                && column.editable !== false
                && !data._readonlyFields?.includes(column.field),
            },
          ]"
          title="더블클릭하여 편집"
          @dblclick="startEditing(data, column, columnIndex)"
        >
          {{ data[column.field] }}
        </span>
        <!-- 신규 행 또는 더블클릭한 셀은 InputText로 표시한다. -->
        <!-- 값 변경 시 상태를 U로 바꾸고 blur, Enter, Esc 시 편집을 종료한다. -->
        <InputText
          v-else
          v-model="data[column.field]"
          :aria-label="column.header"
          class="cell-input cell-editing"
          autofocus
          @update:model-value="markUpdated(data)"
          @blur="stopEditing(data)"
          @keyup.enter="stopEditing(data)"
          @keyup.esc="stopEditing(data)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.cell-input {
  display: block;
  width: 100%;
  min-width: 8rem;
  height: 2.25rem;
  padding: 0.45rem 0.65rem;
  color: #182136;
  font: inherit;
  background: #eef4ff;
  border: 2px solid #3157d5;
  border-radius: 6px;
  outline: none;
  box-shadow: 0 0 0 3px rgba(49, 87, 213, 0.16);
}

.cell-value {
  display: block;
  min-height: 1.5rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: default;
}

.cell-editable {
  cursor: text;
}

.cell-editable:hover {
  background: #f3f6ff;
  border-color: #c8d3f7;
}
</style>
