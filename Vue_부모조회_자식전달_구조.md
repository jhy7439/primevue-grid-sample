# 부모에서 조회하고 자식에게 결과 전달하기

부모 컴포넌트가 `0~3` 범위의 데이터를 먼저 조회하고, 조회 결과 4개를 자식 컴포넌트 4개에 하나씩 전달하는 구조입니다.

## 1. 전체 구조

부모 컴포넌트가 데이터를 조회하여 `results` 배열에 저장합니다.

조회가 끝나면 `v-for`가 `results` 배열을 반복하면서 결과 하나마다 `Child` 컴포넌트 하나를 생성합니다. 자식 컴포넌트는 API를 직접 조회하지 않고, 부모에게 받은 결과를 화면에 표시합니다.

```text
부모에서 데이터 조회
        ↓
results 배열에 결과 4개 저장
        ↓
v-for로 자식 컴포넌트 4개 생성
        ↓
각 자식에게 결과 하나씩 props로 전달
        ↓
각 자식이 받은 결과를 HTML에 표시
```

결과와 자식 컴포넌트는 다음과 같이 연결됩니다.

| 파라미터 | 부모의 조회 결과 | 연결되는 자식 |
|---:|---|---|
| 0 | 0번 결과 | Child 0 |
| 1 | 1번 결과 | Child 1 |
| 2 | 2번 결과 | Child 2 |
| 3 | 3번 결과 | Child 3 |

## 2. 부모 컴포넌트

다음 예시는 서버가 `start=0`, `end=3`을 받아 결과 4개를 배열로 반환하는 경우입니다.

API 요청은 부모 컴포넌트에서 한 번만 실행됩니다.

```vue
<!-- Parent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const results = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadAllData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/items?start=0&end=3')

    if (!response.ok) {
      throw new Error('데이터 조회에 실패했습니다.')
    }

    results.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAllData)
</script>

<template>
  <p v-if="isLoading">
    조회 중입니다.
  </p>

  <p v-else-if="errorMessage">
    {{ errorMessage }}
  </p>

  <template v-else>
    <Child
      v-for="result in results"
      :key="result.id"
      :data="result"
    />
  </template>
</template>
```

서버가 다음과 같은 배열을 반환한다고 가정합니다.

```js
[
  {
    id: 0,
    name: '사과',
    price: 1000
  },
  {
    id: 1,
    name: '바나나',
    price: 2000
  },
  {
    id: 2,
    name: '딸기',
    price: 3000
  },
  {
    id: 3,
    name: '수박',
    price: 4000
  }
]
```

`results`에 결과 4개가 저장되면 다음 `v-for`가 네 번 반복됩니다.

```vue
<Child
  v-for="result in results"
  :key="result.id"
  :data="result"
/>
```

반복할 때마다 현재 `result`가 자식의 `data` props로 전달됩니다.

## 3. 자식 컴포넌트

자식은 API를 호출하지 않습니다. 부모가 `data` props로 전달한 결과를 받아 화면에 표시합니다.

```vue
<!-- Child.vue -->
<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="item-card">
    <h2>{{ data.name }}</h2>
    <p>번호: {{ data.id }}</p>
    <p>가격: {{ data.price }}원</p>
  </article>
</template>
```

화면에는 다음과 같이 서로 다른 자식 컴포넌트 4개가 나타납니다.

```text
사과
번호: 0
가격: 1000원

바나나
번호: 1
가격: 2000원

딸기
번호: 2
가격: 3000원

수박
번호: 3
가격: 4000원
```

## 4. 실행 순서

1. 부모 컴포넌트가 화면에 나타납니다.
2. `onMounted(loadAllData)`가 실행됩니다.
3. 부모가 `0~3` 범위의 데이터를 API에 한 번 요청합니다.
4. 서버가 결과 4개를 배열로 반환합니다.
5. 부모가 반환받은 배열을 `results`에 저장합니다.
6. `v-for`가 `results`를 반복하여 자식 컴포넌트 4개를 생성합니다.
7. 각 자식이 서로 다른 `data`를 props로 받습니다.
8. 각 자식이 전달받은 데이터를 자신의 HTML에 표시합니다.

## 5. 핵심 확인 사항

- 생성되는 자식의 수는 `results` 배열의 길이와 같습니다.
- 결과가 4개라면 자식 컴포넌트도 4개 생성됩니다.
- 각 자식은 결과 하나만 전달받으므로 서로 다른 내용을 표시할 수 있습니다.
- 자식은 데이터를 조회하지 않고 표시 역할만 담당합니다.
- `key`에는 `index`보다 `result.id`처럼 변하지 않는 고유값을 사용하는 것이 안전합니다.
- 서버가 범위 조회 API를 지원해야 실제 API 요청을 한 번만 실행할 수 있습니다.

## 6. 역할 정리

### 부모 컴포넌트

- API를 호출합니다.
- 로딩 상태와 오류를 관리합니다.
- 조회 결과 배열을 보관합니다.
- `v-for`로 자식 컴포넌트를 만듭니다.
- 각 자식에게 결과 하나씩 전달합니다.

### 자식 컴포넌트

- 부모에게 결과를 props로 받습니다.
- 전달받은 결과를 HTML에 표시합니다.
- API를 직접 호출하지 않습니다.

핵심 구조는 다음 코드입니다.

```vue
<Child
  v-for="result in results"
  :key="result.id"
  :data="result"
/>
```

`results` 배열의 요소 하나가 자식 컴포넌트 하나와 연결됩니다.
