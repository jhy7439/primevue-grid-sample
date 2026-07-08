import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import PrimeVue from 'primevue/config'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'primeicons/primeicons.css'
import './styles.css'
import App from './App.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'gridLab',
    themes: {
      gridLab: {
        dark: false,
        colors: { primary: '#3157d5', secondary: '#00a88f', background: '#f4f6fb' },
      },
    },
  },
})

createApp(App)
  .use(vuetify)
  .use(PrimeVue, { unstyled: true })
  .mount('#app')
