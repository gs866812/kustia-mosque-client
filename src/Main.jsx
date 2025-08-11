import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './AppRouter';
import DataProvider from './DataProvider';
import { Toaster } from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";
import 'sweetalert2/src/sweetalert2.scss'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </DataProvider>
  </StrictMode>,
)
