import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from './routes';
import DefaultLayout from './components/Layout/DefaultLayout';
import { CartProvider } from './pages/users/Cart/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        // <CartProvider>
        //     {' '}
        //     {/* Bọc toàn bộ ứng dụng trong CartProvider */}
        //     <Router>
        //         <div className="App">
        //             <Routes>
        //                 {publicRoutes.map((route, index) => {
        //                     const Page = route.component;
        //                     let Layout = DefaultLayout;

        //                     if (route.layout) {
        //                         Layout = route.layout;
        //                     } else if (route.layout === null) {
        //                         Layout = Fragment;
        //                     }

        //                     return (
        //                         <Route
        //                             key={index}
        //                             path={route.path}
        //                             element={
        //                                 <Layout>
        //                                     <Page />
        //                                 </Layout>
        //                             }
        //                         />
        //                     );
        //                 })}
        //             </Routes>
        //             <ToastContainer
        //             position="top-right"
        //             autoClose={3000}
        //             hideProgressBar={false}
        //             newestOnTop
        //             closeOnClick
        //             pauseOnFocusLoss
        //             draggable
        //             pauseOnHover
        //             theme="colored"
        //         />
        //         </div>
        //     </Router>
        // </CartProvider>

<CartProvider>
<Router>

        <Routes>
            {publicRoutes.map((route, index) => {
                const Page = route.component;
                const Layout = route.layout ?? DefaultLayout;

                // Nếu route có children thì render nested Route
                if (route.children) {
                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <Layout>
                                    <Page />
                                </Layout>
                            }
                        >
                            {route.children.map((child, i) => {
                                const ChildPage = child.component;
                                return (
                                    <Route
                                        key={i}
                                        path={child.path}
                                        element={<ChildPage />}
                                    />
                                );
                            })}
                        </Route>
                    );
                }

                // Route không có children
                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            <Layout>
                                <Page />
                            </Layout>
                        }
                    />
                );
            })}
        </Routes>
        </Router>
</CartProvider>

    );
}

export default App;
