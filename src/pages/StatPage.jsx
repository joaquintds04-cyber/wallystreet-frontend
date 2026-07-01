import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import { REFRESH_INTERVAL } from '../utils/constants'
import './StatPage.css'
import AssetCard from '../components/AssetCard' 

function StatPage() {
  const [assets, setAssets] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const preciosAnterioresRef = useRef({})
  const [error, setError] = useState('')

  const obtenerAssets = async () => {
    try {
      const response = await api.get('/assets')
      const nuevosAssets = response.data

      // Actualizamos los precios anteriores con los actuales ANTES de setear los nuevos
      const nuevosPrevios = {}
      nuevosAssets.forEach(a => {
        nuevosPrevios[a.id] = preciosAnterioresRef.current[a.id] ?? a.current_price
      })

      // Guardamos los precios actuales como "anteriores" para la próxima vuelta
      const actuales = {}
      nuevosAssets.forEach(a => { actuales[a.id] = a.current_price })
      preciosAnterioresRef.current = actuales

      setAssets(nuevosAssets.map(a => ({
        ...a,
        precioAnterior: nuevosPrevios[a.id]
      })))

    } catch (error) {
      setError('No se pudieron cargar los assets. Intentá de nuevo más tarde.')
    }
  }

  useEffect(() => {
    obtenerAssets()
    const intervalo = setInterval(obtenerAssets, REFRESH_INTERVAL)
    return () => clearInterval(intervalo)
  }, [])

  const assetsFiltrados = assets
    .filter(asset => asset.name.toLowerCase().includes(filtroNombre.toLowerCase()))
    .sort((a, b) => {
      if (ordenPrecio === 'asc') return a.current_price - b.current_price
      if (ordenPrecio === 'desc') return b.current_price - a.current_price
      return 0
    })

  return (
    <div className="page-container">
      <h2>Mercado de Assets</h2>

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

      {error && <p className="error">{error}</p>}

      <div className="assets-grid">
        {assetsFiltrados.map(asset => {
          const subio = asset.current_price > asset.precioAnterior
          const bajo = asset.current_price < asset.precioAnterior

          return (
            <AssetCard key={asset.id} name={asset.name} price={asset.current_price}>
              {subio && <span className="precio-alza">▲ Al alza</span>}
              {bajo && <span className="precio-baja">▼ A la baja</span>}
              {!subio && !bajo && <span>— Sin cambios</span>}
            </AssetCard>
          )
        })}
      </div>
    </div>
  )
}

export default StatPage