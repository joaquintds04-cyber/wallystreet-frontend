import {useEffect, useState} from 'react'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'

function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([])
  const [perfil, setPerfil] = useState(null)
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')


}

export default PortfolioPage