import { useState, useEffect } from 'react'
import axios from 'axios'

function StatPage() {
  const [assets, setAssets] = useState([])

  useEffect(() => {
    const obtenerAssets = async () => {
      try {
        const response = await axios.get('http://localhost/trabajophp/src/public/assets')
        setAssets(response.data)
      } catch (error) {
        console.error('Error al obtener assets:', error)
      }
    }

    obtenerAssets()
  }, [])

  return (
    <div>
      <h2>Listado de Assets</h2>
      {assets.map(asset => (
        <p key={asset.id}>
          {asset.name} - ${asset.current_price}
        </p>
      ))}
    </div>
  )
}

export default StatPage