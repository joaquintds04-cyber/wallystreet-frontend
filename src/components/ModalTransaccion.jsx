import { useState, useEffect } from 'react'

function ModalTransaccion({ isOpen, onClose, type, asset, balance, onConfirm }) {
  const [cantidad, setCantidad] = useState(1)
  const [mensaje, setMensaje] = useState('')
  useEffect(() => {
    setCantidad(1)
    setMensaje('')
  }, [asset, type, isOpen])

  if (!isOpen || !asset) return null

  const esCompra = type === 'buy'
  
  // Definimos el tope dinámico según la operación
  const maxCantidad = esCompra ? 20 : (asset.quantity || 0)

  const handleConfirmar = async () => {
    const cantNum = Number(cantidad)

    if (cantNum <= 0) {
      setMensaje('La cantidad debe ser mayor a 0.')
      return
    }

    if (esCompra && cantNum > 20) {
      setMensaje('La cantidad máxima a comprar es de 20 unidades.')
      return
    }

    if (!esCompra && cantNum > asset.quantity) {
      setMensaje(`No tenés suficientes unidades. Solo podés vender hasta ${asset.quantity}.`)
      return
    }

    if (esCompra && (asset.current_price * cantNum > balance)) {
      setMensaje('Saldo insuficiente para realizar esta operación.')
      return
    }
    setMensaje('')
    const exito = await onConfirm(type, asset.id || asset.asset_id, cantNum)
    
    if (exito) {
      setMensaje(`¡${esCompra ? 'Compra' : 'Venta'} realizada con éxito!`)
      setTimeout(() => {
        onClose()
      }, 2000)
    } else {
      setMensaje('Hubo un error al procesar la transacción en el servidor.')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{esCompra ? 'Comprar' : 'Vender'} {asset.name}</h3>
        <p>Precio actual: ${asset.current_price}</p>
        {!esCompra && <p>Unidades disponibles: {asset.quantity}</p>}
        
        <label className="modal-label-centrado">
          {esCompra ? 'Cantidad (Máximo 20):' : 'Cantidad a vender:'}
        </label>
        
        <input 
          type="number" 
          min="1" 
          max={maxCantidad} 
          value={cantidad} 
          onChange={e => setCantidad(e.target.value)} 
          onInput={e => {
            if (Number(e.target.value) > maxCantidad) {
              e.target.value = maxCantidad
            }
          }}
        />
        
        <p>
          {esCompra ? 'Costo estimado:' : 'Obtendrás aproximadamente:'}{' '}
          <strong>${(asset.current_price * cantidad).toFixed(2)}</strong>
        </p>
        
        {mensaje && <p className="mensaje-transaccion">{mensaje}</p>}
        
        <div className="modal-botones">
          <button onClick={handleConfirmar}>
            {esCompra ? 'Confirmar Compra' : 'Confirmar Venta'}
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default ModalTransaccion