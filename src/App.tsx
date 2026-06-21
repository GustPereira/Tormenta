import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SheetList } from './pages/SheetList'
import { SheetEditor } from './pages/SheetEditor'
import { SharedSheet } from './pages/SharedSheet'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SheetList />} />
        <Route path="/ficha/compartilhada/:shareId" element={<SharedSheet />} />
        <Route path="/ficha/:id" element={<SheetEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
