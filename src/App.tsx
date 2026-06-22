import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SheetList } from './pages/SheetList'
import { SheetEditor } from './pages/SheetEditor'
import { SharedSheet } from './pages/SharedSheet'

// Em produção o app é servido em /Tormenta/ (GitHub Pages); o basename do router
// precisa casar com o base do Vite, senão nenhuma rota bate (página em branco).
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<SheetList />} />
        <Route path="/ficha/compartilhada/:shareId" element={<SharedSheet />} />
        <Route path="/ficha/:id" element={<SheetEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
