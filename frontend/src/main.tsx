import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import dayjs from 'dayjs'
// Interface em português (CLAUDE.md): the calendar renders month names,
// weekday headers and long dates straight from dayjs, so the locale is set
// once here rather than per call site.
import 'dayjs/locale/pt-br'
import App from './App.tsx'

dayjs.locale('pt-br')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
