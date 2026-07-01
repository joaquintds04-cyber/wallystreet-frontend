import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './EditarPage.css'

function EditarPage() {
  // Si venimos de /editar (navbar) no hay userId en la URL -> se edita el usuario logueado.
  // Si venimos de /editar/:userId (admin desde el listado) -> se edita ese usuario puntual.
  const { userId: userIdDeLaUrl } = useParams()
  const navigate = useNavigate()

  const loggedUserId = localStorage.getItem('user_id')
  const userId = userIdDeLaUrl || loggedUserId
  const editandoOtroUsuario = Boolean(userIdDeLaUrl) && userIdDeLaUrl !== loggedUserId

  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [repetirPassword, setRepetirPassword] = useState('')
  const [errores, setErrores] = useState([])
  const [mensajeExito, setMensajeExito] = useState('')
  const [cargando, setCargando] = useState(true)
  const [nombreActual, setNombreActual] = useState('')

  // Traemos los datos actuales del usuario a editar, para mostrar su nombre
  // (esto también sirve para que el admin sepa a quién está editando).
  useEffect(() => {
    let isMounted = true
    const obtenerUsuario = async () => {
      setCargando(true)
      try {
        const response = await api.get(`/users/${userId}`)
        if (isMounted) setNombreActual(response.data.name)
      } catch (err) {
        if (isMounted) setErrores(['No se pudo cargar la información del usuario.'])
      } finally {
        if (isMounted) setCargando(false)
      }
    }
    obtenerUsuario()
    return () => { isMounted = false }
  }, [userId])

  const validar = () => {
    const nuevosErrores = []
    if (nombre) {
     if (!nombre.trim() || nombre.length > 30) {
      nuevosErrores.push('El nombre no puede consistir solo de espacios y debe tener máximo 30 caracteres.')
      }
    }
    // Validación de la contraseña (minimo de 8 caracteres, mayúscula, minúscula, número, especial)
    // Solo la validamos si el usuario escribió algo (En caso de que solo quiera cambiar el nombre)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#]).{8,}$/
    if (password && !passwordRegex.test(password)) {
      nuevosErrores.push('La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales.')
    }

    // Validar que las contraseñas coincidan
    if (password && password !== repetirPassword) {
      nuevosErrores.push('Las contraseñas no coinciden.')
    }

    return nuevosErrores
  }

  const handleEditar = async (e) => {
    e.preventDefault()
    setErrores([])
    setMensajeExito('')

    // Validación en el frontend antes de llamar al backend
    const erroresValidacion = validar()
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion)
      return
    }

    try {
      const dataToUpdate = {}
      if(nombre.trim()) {
        dataToUpdate.name = nombre.trim()
      }
      if (password) {
        dataToUpdate.password = password
      }

      if (Object.keys(dataToUpdate).length === 0) {
        setErrores(['No hay cambios para guardar.'])
        return
      }

      await api.put(`/users/${userId}`, dataToUpdate)
      setMensajeExito('Perfil actualizado con éxito.')
      setPassword('')
      setRepetirPassword('')

      if (!editandoOtroUsuario) {
        // Nos estamos editando a nosotros mismos: reflejamos el cambio en el NavBar y recargamos
        if (nombre.trim()) {
          localStorage.setItem('user_name', nombre.trim())
        }
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        // El admin editó a otro usuario: no tocamos su localStorage, volvemos al listado
        setTimeout(() => {
          navigate('/admin')
        }, 2000)
      }

    } catch (error) {
      setErrores([error.response?.data?.error || 'Error al actualizar el usuario.'])
    }
  }

  if (cargando) {
    return (
      <div className="editar-container">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="editar-container">
      <h2>{editandoOtroUsuario ? `Editar usuario: ${nombreActual}` : 'Editar Usuario'}</h2>

      {errores.length > 0 && (
        <ul className="errores-lista">
          {errores.map((error, index) => (
            <li key={index} className="error-item">{error}</li>
          ))}
        </ul>
      )}

      {mensajeExito && <p className="exito-mensaje">{mensajeExito}</p>}

      <form onSubmit={handleEditar} className="editar-form">
        <div className="form-group">
          <label>Nombre del usuario</label>
          <input
            type="text"
            placeholder={nombreActual ? `Actual: ${nombreActual}` : 'Nuevo nombre'}
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Nueva contraseña (opcional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Repetir Password</label>
          <input
            type="password"
            placeholder="Repetir nueva contraseña"
            value={repetirPassword}
            onChange={e => setRepetirPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-guardar">Guardar Cambios</button>
      </form>
    </div>
  )
}

export default EditarPage