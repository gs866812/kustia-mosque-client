import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './AppRouter'
import DataProvider from './DataProvider'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <RouterProvider router={router} />
      <Toaster />
    </DataProvider>
  </StrictMode>,
)
