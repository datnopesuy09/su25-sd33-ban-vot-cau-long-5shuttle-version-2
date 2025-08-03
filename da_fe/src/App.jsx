import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './pages/users/Cart/CartContext';
import { UserAuthProvider } from './contexts/userAuthContext';
import { AdminAuthProvider } from './contexts/adminAuthContext';

import AppWrapper from './routes/AppWrapper';

function App() {
  return (
    <CartProvider>
      <UserAuthProvider>
        <AdminAuthProvider>
          <Router>
            <AppWrapper />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
            //   pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            
          </Router>
        </AdminAuthProvider>
      </UserAuthProvider>
    </CartProvider>
  );
}

export default App;