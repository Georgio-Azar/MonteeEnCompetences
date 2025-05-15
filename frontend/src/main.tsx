import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
/*import RegisterForm  from './components/RegisterForm.tsx'
import LoginForm from './components/LoginForm.tsx'
import NavBar from './components/NavBar.tsx'*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
