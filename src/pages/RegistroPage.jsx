import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'

function RegistroPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState([])
  const navigate = useNavigate()

  const validar = () => {
    const nuevosErrores = []

    if (!nombre || nombre.length > 30) {
      nuevosErrores.push('El nombre no puede estar vacío y debe tener máximo 30 caracteres')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      nuevosErrores.push('El email debe tener un formato válido')
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
    if (!password || !passwordRegex.test(password)) {
      nuevosErrores.push('La password debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales')
    }

    return nuevosErrores
  }

  const handleRegistro = async () => {
    // Primero validamos en el frontend
    const erroresValidacion = validar()
    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion)
      return
    }

    try {
      await axios.post(
        `${BASE_URL}/users`,
        { name: nombre, email, password }
      )
      // Si salió bien, redirigimos al login
      navigate('/login')

    } catch (error) {
      // Si el backend rechaza (email ya existe, etc.)
      setErrores([error.response?.data?.message || 'Error al registrarse'])
    }
  }

  return (
    <div>
      <h2>Registro</h2>

      {errores.length > 0 && (
        <ul>
          {errores.map((error, index) => (
            <li key={index} style={{color: 'red'}}>{error}</li>
          ))}
        </ul>
      )}

      <input
        type="text"
        placeholder="Nombre (máx. 30 caracteres)"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleRegistro}>Registrarse</button>
    </div>
  )
}

export default RegistroPage