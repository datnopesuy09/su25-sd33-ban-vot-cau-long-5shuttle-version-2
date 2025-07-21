import { Fragment } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { publicRoutes } from './routes';
import DefaultLayout from './components/Layout/DefaultLayout';
import { CartProvider } from './pages/users/Cart/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import context providers
import { UserAuthProvider } from './contexts/userAuthContext';
import { AdminAuthProvider } from './contexts/adminAuthContext';

// Tạo component wrapper để dùng useLocation
function AppWrapper() {
    const location = useLocation();

    return (
        <Routes>
            {publicRoutes.map((route, index) => {
                const Page = route.component;
                const Layout = route.layout === null ? Fragment : route.layout || DefaultLayout;

                const isAdminRoute =
                    route.path.startsWith('/admin') &&
                    route.path !== '/admin/login';

                const isLoggedIn = localStorage.getItem('adminToken');

                if (route.children) {
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                isAdminRoute && !isLoggedIn ? (
                                    <Navigate
                                        to="/admin/login"
                                        state={{ from: location }}
                                        replace
                                    />
                                ) : (
                                    <Layout>
                                        <Page />
                                    </Layout>
                                )
                            }
                        >
                            {route.children.map((child, i) => {
                                const ChildPage = child.component;
                                const ChildLayout =
                                    child.layout === null
                                        ? Fragment
                                        : child.layout || DefaultLayout;

                                return (
                                    <Route
                                        key={i}
                                        path={child.path}
                                        element={
                                            <ChildLayout>
                                                <ChildPage />
                                            </ChildLayout>
                                        }
                                    />
                                );
                            })}
                        </Route>
                    );
                }

                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            isAdminRoute && !isLoggedIn ? (
                                <Navigate
                                    to="/admin/login"
                                    state={{ from: location }}
                                    replace
                                />
                            ) : (
                                <Layout>
                                    <Page />
                                </Layout>
                            )
                        }
                    />
                );
            })}
        </Routes>
    );
}

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
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                    </Router>
                </AdminAuthProvider>
            </UserAuthProvider>
        </CartProvider>
    );
}

export default App;