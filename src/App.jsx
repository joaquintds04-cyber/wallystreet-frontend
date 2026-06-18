import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeaderComponent from './components/HeaderComponent'
import NavBarComponent from './components/NavBarComponent'
import FooterComponent from './components/FooterComponent'
import StatPage from './pages/StatPage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'
import EditarPage from './pages/EditarPage'
import PortfolioPage from './pages/PortfolioPage'
import OperacionesPage from './pages/OperacionesPage'
import PanelPage from './pages/PanelPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <HeaderComponent />
      <NavBarComponent />

      <Routes>
        <Route path="/" element={<StatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/editar" element={<EditarPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/operaciones" element={<OperacionesPage />} />
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      <FooterComponent />
    </BrowserRouter>
  )
}

export default App