import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import { REFRESH_INTERVAL } from '../utils/constants'
import AssetCard from '../components/AssetCard'
import ModalTransaccion from '../components/ModalTransaccion' // Importamos el modal genérico
import './PanelPage.css'
import './StatPage.css'

function PanelPage() {
  const userId = localStorage.getItem('user_id'); 
  const [perfil, setPerfil] = useState(null);

  const [assets, setAssets] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const preciosAnterioresRef = useRef({})

  const [modalCompra, setModalCompra] = useState(false)
  const [modalHistorial, setModalHistorial] = useState(false)
  const [assetSeleccionado, setAssetSeleccionado] = useState(null)
  const [historialData, setHistorialData] = useState([])

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

  const abrirModalCompra = (asset) => {
    setAssetSeleccionado(asset)
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

  const manejarTransaccionAPI = async (tipo, assetId, cantidadEnviada) => {
    try {
      await api.post('/trade/buy', {
        asset_id: assetId,
        quantity: cantidadEnviada
      })
      obtenerAssets() // Refrescamos balances y assets en tiempo real
      return true
    } catch (error) {
      return false
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

      {/* COMPONENTE REUTILIZABLE DE TRANSACCIONES (COMPRA) */}
      <ModalTransaccion 
        isOpen={modalCompra}
        onClose={() => setModalCompra(false)}
        type="buy"
        asset={assetSeleccionado}
        balance={perfil?.balance}
        onConfirm={manejarTransaccionAPI}
      />

      {/* MODAL DE HISTORIAL  */}
      {modalHistorial && (
        <div className="modal-overlay">
          <div className="modal-content chart-modal">
            <h3>Últimos 5 valores: {assetSeleccionado?.name}</h3>
            
            <div className="grafico-barras">
              {historialData.map((dato, index) => {
                const precioMaximo = Math.max(...historialData.map(d => Number(d.price_per_unit)), 1);
                const porcentajeAltura = (Number(dato.price_per_unit) / precioMaximo) * 100;

                return (
                  <div key={index} className="barra-item-contenedor">
                    <span className="barra-precio">${Number(dato.price_per_unit).toFixed(2)}</span>
                
                    <div className="barra-wrapper">
                      <div 
                        className="barra-dinamica" 
                        style={{ height: `${porcentajeAltura}%` }} 
                      ></div>
                    </div>
                    <span className="barra-eje-x">M{index + 1}</span>
                  </div>
                )
              })}
            </div>
            
            <div className="modal-botones">
              <button className="btn-cerrar" onClick={() => setModalHistorial(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    
    </div>
  )
}
      
export default PanelPage