import { useEffect, useState } from 'react'
import api from '../utils/api'
import AssetCard from '../components/AssetCard'
import { REFRESH_INTERVAL } from '../utils/constants'

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [cantidades, setCantidades] = useState({})
  const [mensaje, setMensaje] = useState('')
  const userId = localStorage.getItem('user_id')
  const [error, setError] = useState('')

  const obtenerDatos = async () => {    // Definimos fuera del useEffect para poder llamarla después de cada operación (compra/venta) y refrescar los datos del portfolio y perfil.
    try {
      const responsePortfolio = await api.get('/portfolio')
      setPortfolio(responsePortfolio.data)

      const responsePerfil = await api.get(`/users/${userId}`)
      setPerfil(responsePerfil.data)

    } catch (error) {
      setError('No se pudo cargar el portfolio. Intentá de nuevo más tarde.')
    }
  }

  useEffect(() => {
    obtenerDatos()
    const intervalo = setInterval(obtenerDatos, REFRESH_INTERVAL)
    return () => clearInterval(intervalo)
  }, [])

  const handleComprar = async (assetId) => {
    const cantidad = cantidades[assetId] || 1

    try {
      await api.post('/trade/buy', { asset_id: assetId, quantity: cantidad })
      setMensaje('Compra realizada exitosamente')
      obtenerDatos()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al comprar')
    }
  }

  const handleVender = async (assetId) => {
    const cantidad = cantidades[assetId] || 1

    try {
      await api.post('/trade/sell', { asset_id: assetId, quantity: cantidad }) 
      setMensaje('Venta realizada exitosamente')
      obtenerDatos()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al vender')
    }
  }

  const handleEliminar = async (assetId) => {
    try {
      await api.delete(`/portfolio/${assetId}`)
      setMensaje('Activo eliminado del portfolio')
      obtenerDatos()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error al eliminar')
    }
  }

  const handleCantidadChange = (assetId, valor) => {
    setCantidades({ ...cantidades, [assetId]: Number(valor) })
  }

  return (
    <div className="page-container">
      <h2>Mi Portfolio</h2>

      {perfil && <p>Dinero disponible: ${perfil.balance}</p>}
      {mensaje && <p>{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <div className="assets-grid">
        {portfolio.map(item => ( // Cada item representa un activo en el portfolio
          <AssetCard key={item.asset_id} name={item.name} price={item.current_price}>
            <p>Cantidad: {item.quantity}</p>
            <p>Subtotal: ${item.subtotal}</p>

            <input
              type="number"
              min="1"
              max="20"
              placeholder="Cantidad"
              value={cantidades[item.asset_id] || ''}
              onChange={e => handleCantidadChange(item.asset_id, e.target.value)} // Actualiza la cantidad para ese activo específico
             />

              <button 
                onClick={() => handleComprar(item.asset_id)}
                disabled={perfil?.balance <= 0}
              >
                Comprar
            </button>
            <button onClick={() => handleVender(item.asset_id)}>Vender</button>

            {item.quantity === 0 && (
              <button onClick={() => handleEliminar(item.asset_id)}>Eliminar</button> // Solo muestra el botón de eliminar si la cantidad es 0 (es decir, si se vendió todo el activo)
            )}
          </AssetCard>
        ))}
      </div>
    </div>
  )
}

export default PortfolioPage