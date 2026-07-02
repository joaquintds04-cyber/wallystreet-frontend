import { useState, useEffect } from 'react'
import api from '../utils/api'
import './OperacionesPage.css'

function OperacionesPage() {
  const [transacciones, setTransacciones] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroAsset, setFiltroAsset] = useState('')
  const [assets, setAssets] = useState([])
  const [error, setError] = useState('')

  const obtenerTransacciones = async () => {
    try {
      const params = {}
      if (filtroTipo) params.type = filtroTipo
      if (filtroAsset) params.asset_id = filtroAsset

      const response = await api.get('/transactions', { params })
      setTransacciones(response.data.transactions)
    } catch (err) {
      setError('No se pudieron cargar las transacciones.')
    }
  }

  const obtenerAssets = async () => {
    try {
      const response = await api.get('/assets')
      setAssets(response.data)
    } catch (err) {
      setError('No se pudieron cargar los assets.')
    }
  }

  useEffect(() => {
    obtenerAssets()
  }, [])

  useEffect(() => {
    obtenerTransacciones()
  }, [filtroTipo, filtroAsset])

  return (
    <div className="page-container">
      <h2>Mis Operaciones</h2>

      <div className="operaciones-filtros">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="buy">Compra</option>
          <option value="sell">Venta</option>
        </select>

        <select value={filtroAsset} onChange={e => setFiltroAsset(e.target.value)}>
          <option value="">Todos los assets</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>{asset.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

    {transacciones.length === 0 ? (
      <p className="operaciones-vacio">No hay operaciones para mostrar.</p>
    ) : (
     <table className="operaciones-tabla">
       <thead>
          <tr>
            <th>Fecha</th>
            <th>Asset</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
     {transacciones.map(t => {
       const nombreAsset = assets.find(a => a.id === t.asset_id)?.name || t.asset_id
        return (
          <tr key={t.id}>
            <td>{new Date(t.transaction_date).toLocaleString()}</td>
            <td>{nombreAsset}</td>
            <td className={t.transaction_type === 'buy' ? 'tipo-compra' : 'tipo-venta'}>
              {t.transaction_type === 'buy' ? 'Compra' : 'Venta'}
            </td>
            <td>{t.quantity}</td>
            <td>${Number(t.price_per_unit).toFixed(2)}</td>
            <td>${Number(t.total_amount).toFixed(2)}</td>
          </tr>
        )
      })}
    </tbody>
  </table>
  )}
    </div>
  )
}

export default OperacionesPage