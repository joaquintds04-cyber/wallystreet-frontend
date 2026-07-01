import { Navigate } from 'react-router-dom'

function RutaAdmin({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" />
  }
  const isAdmin = localStorage.getItem('is_admin')
  if (Number(isAdmin) !== 1) {
    return <Navigate to="/" />
  }
  return children
}

export default RutaAdmin