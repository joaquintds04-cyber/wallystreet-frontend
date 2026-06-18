import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    // Validación básica antes de llamar al backend
    if (!email || !password) {
      setError('Completá todos los campos')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost/trabajophp/src/public/login',
        { email, password }
      )

      // Tu backend manda el token en el HEADER, no en el body
      const token = response.headers['authorization'] || 
      response.headers['Authorization']
      localStorage.setItem('token', token)
      localStorage.setItem('user_id', response.data.user_id)

      console.log('Token guardado:', localStorage.getItem('token'))
      console.log('Todos los headers:', response.headers)
      console.log('Login exitoso, token:', token)
      console.log('Respuesta:', response.data)
      navigate('/panel') // Redirige al panel después del login
    } catch (error) {
      setError(error.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {error && <p style={{color: 'red'}}>{error}</p>}

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

      <button onClick={handleLogin}>Iniciar sesión</button>
    </div>
  )
}

export default LoginPage