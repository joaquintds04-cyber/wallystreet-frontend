import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

function HeaderComponent() {
  return (
    <header className="header">
      <Link to="/" className="header-link">
        <img src={logo} alt="Logo WallyStreet" />
        <h1>WallyStreet</h1>
      </Link>
    </header>
  )
}

export default HeaderComponent