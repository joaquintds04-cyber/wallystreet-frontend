import { useEffect, useState } from 'react'
import api from '../utils/api'
import AssetCard from '../components/AssetCard'
import ModalTransaccion from '../components/ModalTransaccion' 
import { REFRESH_INTERVAL } from '../utils/constants'
import './PanelPage.css' 

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([])
  const [perfil, setPerfil] = useState(null)
  const userId = localStorage.getItem('user_id')
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [tipoTransaccion, setTipoTransaccion] = useState('buy') // 'buy' o 'sell'
  const [assetSeleccionado, setAssetSeleccionado] = useState(null)

  const obtenerDatos = async () => {
    try {
      const responsePortfolio = await api.get('/portfolio')
      setPortfolio(responsePortfolio.data)

      const responsePerfil = await api.get(`/users/${userId}`)
      setPerfil(responsePerfil.data)
    } catch (error) {
      setError('No se pudo cargar el portfolio.')
    }
  }

  useEffect(() => {
    obtenerDatos()
    const intervalo = setInterval(obtenerDatos, REFRESH_INTERVAL)
    return () => clearInterval(intervalo)
  }, [])

  const abrirModal = (tipo, item) => {
    setTipoTransaccion(tipo)
    setAssetSeleccionado(item)
    setModalOpen(true)
  }

  const manejarTransaccionAPI = async (tipo, assetId, cantidad) => {
    try {
      const url = tipo === 'buy' ? '/trade/buy' : '/trade/sell'
      await api.post(url, { asset_id: assetId, quantity: cantidad })
      obtenerDatos() 
      return true
    } catch (err) {
      return false
    }
  }

  const handleEliminar = async (assetId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      try {
        await api.delete(`/portfolio/${assetId}`)
        obtenerDatos()
      } catch (err) {
        alert('Error al eliminar')
      }
    }
  }

  return (
    <div className="page-container">
      <h2>Mi Portfolio</h2>
      {perfil && <p className="saldo-disponible">Dinero disponible: ${perfil.balance}</p>}
      {error && <p className="mensaje-error">{error}</p>}

      <div className="assets-grid">
        {portfolio.map(item => (
          <AssetCard key={item.asset_id} name={item.name} price={item.current_price}>
            <p>Cantidad posee: {item.quantity}</p>
            <p>Subtotal: ${Number(item.subtotal).toFixed(2)}</p>

            <div className="asset-acciones">
              <button className="btn-comprar" onClick={() => abrirModal('buy', item)} disabled={perfil?.balance <= 0}>
                Comprar
              </button>
              <button onClick={() => abrirModal('sell', item)}>
                Vender
              </button>
            </div>

            {Number(item.quantity) === 0 && (
              <button className="btn-eliminar" onClick={() => handleEliminar(item.asset_id)}>
                 Eliminar
             </button>
            )}
          </AssetCard>
        ))}
      </div>

      <ModalTransaccion 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={tipoTransaccion}
        asset={assetSeleccionado}
        balance={perfil?.balance}
        onConfirm={manejarTransaccionAPI}
      />
    </div>
  )
}

export default PortfolioPage