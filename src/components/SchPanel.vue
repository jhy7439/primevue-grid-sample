<template>
  <div class="sch-panel-form" :class="{ 'is-disabled': disabled }">
    <div class="form-grid">
      <v-text-field
        v-model="form.startDt"
        type="date"
        label="모집시작일"
        density="comfortable"
        variant="outlined"
        :disabled="disabled"
      />
      <v-text-field
        v-model="form.endDt"
        type="date"
        label="모집종료일"
        density="comfortable"
        variant="outlined"
        :disabled="disabled"
      />
      <v-text-field
        v-model="form.drawDt"
        type="date"
        label="추첨일"
        density="comfortable"
        variant="outlined"
        :disabled="disabled"
      />
      <v-text-field
        v-model="form.admissionDt"
        type="date"
        label="입교일"
        density="comfortable"
        variant="outlined"
        :disabled="disabled"
      />
    </div>

    <div class="nursery-grid">
      <div class="grid-heading panel-heading">
        <div>
          <b>어린이집 정보</b>
          <small>{{ form.nurseries.length }}개 어린이집</small>
        </div>
      </div>

      <div class="nursery-table-wrap">
        <v-table class="nursery-table">
          <thead>
            <tr>
              <th>어린이집 ID</th>
              <th>어린이집</th>
              <th>0세반</th>
              <th>1세반</th>
              <th>2세반</th>
              <th>3세반</th>
              <th>4세반</th>
              <th>5세반</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nursery in form.nurseries" :key="nursery.nurseryId">
              <td>
                <v-text-field
                  v-model="nursery.nurseryId"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :disabled="disabled"
                />
              </td>
              <td>
                <v-text-field
                  v-model="nursery.nurseryNm"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :disabled="disabled"
                />
              </td>
              <td v-for="age in ageFields" :key="age">
                <v-text-field
                  v-model.number="nursery[age]"
                  type="number"
                  min="0"
                  density="compact"
                  variant="outlined"
                  hide-details
                  :disabled="disabled"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
})

const ageFields = ['age0', 'age1', 'age2', 'age3', 'age4', 'age5']
</script>

<style scoped>
.sch-panel-form {
  display: grid;
  gap: 18px;
}

.is-disabled {
  opacity: 0.68;
}

.panel-heading {
  margin: 0;
  border: 1px solid #e6e9f0;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
}

.nursery-table-wrap {
  overflow-x: auto;
  border: 1px solid #e6e9f0;
  border-radius: 0 0 8px 8px;
}

.nursery-table {
  min-width: 920px;
}

.nursery-table :deep(th) {
  color: #4c5770;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.nursery-table :deep(td) {
  min-width: 94px;
  padding: 8px;
}

.nursery-table :deep(td:nth-child(2)) {
  min-width: 170px;
}
</style>
