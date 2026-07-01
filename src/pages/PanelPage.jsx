import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import { REFRESH_INTERVAL } from '../utils/constants'
import AssetCard from '../components/AssetCard'
import './PanelPage.css'
import './StatPage.css'

function PanelPage() {
  const userId = localStorage.getItem('user_id'); 
  const [perfil, setPerfil] = useState(null);

  const [assets, setAssets] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const preciosAnterioresRef = useRef({})

  // Logica necesaria para el panel
  const [modalCompra, setModalCompra] = useState(false)
  const [modalHistorial, setModalHistorial] = useState(false)
  const [assetSeleccionado, setAssetSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [historialData, setHistorialData] = useState([])
  const [mensajeTransaccion, setMensajeTransaccion] = useState('')

  const obtenerAssets = async () => {
    try {
      const response = await api.get('/assets')
      const nuevosAssets = response.data
      const nuevosPrevios = {}
      nuevosAssets.forEach(a => {
        nuevosPrevios[a.id] = preciosAnterioresRef.current[a.id] ?? a.current_price
      })
      const actuales = {}
      nuevosAssets.forEach(a => { actuales[a.id] = a.current_price })
      preciosAnterioresRef.current = actuales

      setAssets(nuevosAssets.map(a => ({
        ...a,
        precioAnterior: nuevosPrevios[a.id]
      })))

      if (userId) {
        const responsePerfil = await api.get(`/users/${userId}`)
        setPerfil(responsePerfil.data)
      }

    } catch (error) {
      console.error('Error al obtener assets:', error)
    }
  }

  // Refresco global automático y constante
  useEffect(() => {
    obtenerAssets()
    const intervalo = setInterval(obtenerAssets, REFRESH_INTERVAL)
    return () => clearInterval(intervalo)
  }, [])

  // Funciones para abrir modales 
  const abrirModalCompra = (asset) => {
    setAssetSeleccionado(asset)
    setCantidad(1)
    setMensajeTransaccion('')
    setModalCompra(true)
  }

  const abrirModalHistorial = async (asset) => {
    setAssetSeleccionado(asset)
    setHistorialData([]) // Limpiar anterior
    setModalHistorial(true)
    try {
      const res = await api.get(`/assets/${asset.id}/history/5`)
      setHistorialData(res.data)
    } catch (error) {
      console.error('Error al traer historial', error)
    }
  }

  const confirmarCompra = async () => {
    try {
      
      await api.post('/trade/buy', {
        asset_id: assetSeleccionado.id,
        quantity: Number(cantidad)
      })
      setMensajeTransaccion('¡Compra realizada con éxito!')

      obtenerAssets()// Refrescar datos después de la compra

      setTimeout(() => setModalCompra(false), 2000)
    } catch (error) {
      setMensajeTransaccion(error.response?.data?.error || 'Error al comprar (Saldo insuficiente)')
    }
  }

  const assetsFiltrados = assets
    .filter(asset => asset.name.toLowerCase().includes(filtroNombre.toLowerCase()))
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return a.current_price - b.current_price
      if (ordenPrecio === 'desc') return b.current_price - a.current_price
      return 0
    })

  return (
    <div className="page-container">
      <h2>Panel Principal de Operaciones</h2>
      {perfil && <p className="saldo-disponible">Dinero disponible: ${perfil.balance}</p>}
      <div className="stat-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
        />
        <select value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)}>
          <option value="">Ordenar por precio</option>
          <option value="asc">Precio: menor a mayor</option>
          <option value="desc">Precio: mayor a menor</option>
        </select>
      </div>

      <div className="assets-grid">
        {assetsFiltrados.map(asset => {
          const subio = asset.current_price > asset.precioAnterior
          const bajo = asset.current_price < asset.precioAnterior

          return (
            <AssetCard key={asset.id} name={asset.name} price={asset.current_price}>
              <div className="asset-indicador">
                {subio && <span className="precio-alza">▲ Al alza</span>}
                {bajo && <span className="precio-baja">▼ A la baja</span>}
                {!subio && !bajo && <span>— Sin cambios</span>}
              </div>
              <div className="asset-acciones">
                <button className="btn-comprar" onClick={() => abrirModalCompra(asset)}>Comprar</button>
                <button className="btn-historial" onClick={() => abrirModalHistorial(asset)}>Gráfico</button>
              </div>
            </AssetCard>
          )
        })}
      </div>

      {/*  MODAL DE COMPRA  */}
      {modalCompra && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Comprar {assetSeleccionado?.name}</h3>
            <p>Precio actual: ${assetSeleccionado?.current_price}</p>
            <input 
              type="number" 
              min="1" 
              max="20" // Requerimiento del PDF
              value={cantidad} 
              onChange={e => setCantidad(e.target.value)} 
            />
            <p>Total: ${(assetSeleccionado?.current_price * cantidad).toFixed(2)}</p>
            
            {mensajeTransaccion && <p className="mensaje-transaccion">{mensajeTransaccion}</p>}
            
            <div className="modal-botones">
              <button onClick={confirmarCompra}>Confirmar Compra</button>
              <button onClick={() => setModalCompra(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/*  MODAL DE HISTORIAL  */}
      {modalHistorial && (
        <div className="modal-overlay">
          <div className="modal-content chart-modal">
            <h3>Últimos 5 valores: {assetSeleccionado?.name}</h3>
            <div className="grafico-barras">
              {historialData.map((dato, index) => (
                <div key={index} className="barra-container">
                  <div 
                    className="barra" 
                    // Simulamos una altura basada en el precio (ajusta según tus valores)
                    style={{ height: `${dato.price_per_unit}%` }} 
                  ></div>
                  <span>${dato.price_per_unit}</span>
                </div>
              ))}
            </div>
            <button className="btn-cerrar" onClick={() => setModalHistorial(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelPage