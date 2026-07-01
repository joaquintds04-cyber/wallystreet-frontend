import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
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
import RutaAdmin from './components/RutaAdmin'

function App() {
  return (
    <BrowserRouter>
      <HeaderComponent />
      <NavBarComponent />

      <Routes>
        <Route path="/" element={<StatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route path="/editar" element={<RutaProtegida><EditarPage /></RutaProtegida>} />
        <Route path="/editar/:userId" element={<RutaProtegida><EditarPage /></RutaProtegida>} />
        <Route path="/portfolio" element={<RutaProtegida><PortfolioPage /></RutaProtegida>} />
        <Route path="/operaciones" element={<RutaProtegida><OperacionesPage /></RutaProtegida>} />
        <Route path="/panel" element={<RutaProtegida><PanelPage /></RutaProtegida>} />
        <Route path="/admin" element={<RutaProtegida><RutaAdmin><AdminPage /></RutaAdmin></RutaProtegida>} />
      </Routes>

      <FooterComponent />
    </BrowserRouter>
  )
}

export default App