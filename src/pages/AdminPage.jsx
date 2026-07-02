import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import './AdminPage.css'

function AdminPage() {
  const [usuarios, setUsuarios] = useState([])
  const [filtroNombre, setFiltroNombre] = useState('')
  const [error, setError] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const usuariosPorPagina = 5
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [actualizando, setActualizando] = useState(false)
  const [mensajePrecio, setMensajePrecio] = useState('')

const actualizarPrecios = async () => {
  setActualizando(true)
  setMensajePrecio('')
  setMostrarConfirmacion(false)
  try {
    await api.put('/assets')
    setMensajePrecio('Precios actualizados correctamente.')
  } catch (err) {
    setMensajePrecio('Error al actualizar precios.')
  }
  setActualizando(false)
}

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const response = await api.get('/users')
        const ordenados = response.data.sort(
          (a, b) => b.total_portfolio_value - a.total_portfolio_value
        )
        setUsuarios(ordenados)
      } catch (err) {
        setError('No se pudieron cargar los usuarios.')
      }
    }
    obtenerUsuarios()
  }, [])

  const usuariosFiltrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(filtroNombre.toLowerCase())
  )

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina)
  const usuariosPagina = usuariosFiltrados.slice(
    (paginaActual - 1) * usuariosPorPagina,
    paginaActual * usuariosPorPagina
  )

  return (
    <div className="page-container">
      <h2>Manejo de Usuarios</h2>

      <div className="admin-filtros">
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filtroNombre}
          onChange={e => {
            setFiltroNombre(e.target.value)
            setPaginaActual(1)
          }}
        />
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <table className="admin-tabla">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Valor del portfolio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosPagina.map((usuario, index) => {
            const posicionGlobal = (paginaActual - 1) * usuariosPorPagina + index
            const esPrimero = posicionGlobal === 0 && paginaActual === 1 && !filtroNombre

            return (
              <tr key={usuario.id} className={esPrimero ? 'admin-primer-lugar' : ''}>
                <td>{posicionGlobal + 1}</td>
                <td>
                  {esPrimero && <span className="admin-trofeo">🏆 </span>}
                  {usuario.name}
               </td>
               <td>${Number(usuario.total_portfolio_value).toFixed(2)}</td>
               <td>
                <Link to={`/editar/${usuario.id}`} className="btn-editar-usuario">
                  Editar
                </Link>
               </td>
            </tr>
               )
          })}
        </tbody>
      </table>

      <div className="admin-paginado">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(p => p - 1)}
        >
          ← Anterior
        </button>
        <span>Página {paginaActual} de {totalPaginas || 1}</span>
        <button
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => setPaginaActual(p => p + 1)}
        >
          Siguiente →
        </button>
      </div>
      <div className="admin-acciones">
  <button
    onClick={() => setMostrarConfirmacion(true)}
    disabled={actualizando}
    className="btn-actualizar"
  >
    {actualizando ? 'Actualizando...' : 'Actualizar precios del mercado'}
  </button>
  {mensajePrecio && <p className="mensaje-exito">{mensajePrecio}</p>}
</div>

{mostrarConfirmacion && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>¿Confirmar actualización?</h3>
      <p>Se van a actualizar los precios de todos los assets del mercado. Esta acción no se puede deshacer.</p>
      <div className="modal-botones">
        <button onClick={actualizarPrecios}>Sí, actualizar</button>
        <button onClick={() => setMostrarConfirmacion(false)}>Cancelar</button>
      </div>
    </div>
  </div>
    )}
</div>
    
  )
}

export default AdminPage
