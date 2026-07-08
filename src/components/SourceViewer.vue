<script setup>
import { computed, ref } from 'vue'
import appSource from '../App.vue?raw'
import commonTableSource from './CommonTable.vue?raw'

const sources = {
  'App.vue': appSource,
  'CommonTable.vue': commonTableSource,
}

const selectedFile = ref('App.vue')
const source = computed(() => sources[selectedFile.value])
</script>

<template>
  <main class="source-viewer">
    <header class="source-header">
      <div>
        <strong>Grid Project Source</strong>
        <small>src/{{ selectedFile === 'App.vue' ? selectedFile : `components/${selectedFile}` }}</small>
      </div>

      <nav>
        <button
          v-for="(_, fileName) in sources"
          :key="fileName"
          type="button"
          :class="{ active: selectedFile === fileName }"
          @click="selectedFile = fileName"
        >
          {{ fileName }}
        </button>
      </nav>
    </header>

    <!-- pre 안의 보간 값은 Vue가 HTML escape하므로 소스가 그대로 표시된다. -->
    <pre><code>{{ source }}</code></pre>
  </main>
</template>

<style scoped>
.source-viewer {
  min-height: 100vh;
  color: #d8dee9;
  background: #111827;
}

.source-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: rgba(17, 24, 39, 0.96);
  border-bottom: 1px solid #374151;
}

.source-header strong,
.source-header small {
  display: block;
}

.source-header small {
  margin-top: 0.2rem;
  color: #93a4bc;
  font-size: 0.72rem;
}

nav {
  display: flex;
  gap: 0.4rem;
}

button {
  padding: 0.5rem 0.7rem;
  color: #cbd5e1;
  background: #1f2937;
  border: 1px solid #475569;
  border-radius: 0.45rem;
}

button.active {
  color: white;
  background: #3157d5;
  border-color: #6382e9;
}

pre {
  overflow: auto;
  margin: 0;
  padding: 1rem;
  font: 12px/1.65 Consolas, Monaco, monospace;
  tab-size: 2;
  white-space: pre;
}
</style>
