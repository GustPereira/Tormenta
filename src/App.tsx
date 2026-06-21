import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SheetList } from './pages/SheetList'
import { SheetEditor } from './pages/SheetEditor'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SheetList />} />
        <Route path="/ficha/:id" element={<SheetEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
