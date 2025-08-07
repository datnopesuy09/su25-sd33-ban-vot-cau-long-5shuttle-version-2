import React, { Fragment } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { publicRoutes } from '../routes';
import DefaultLayout from '../components/Layout/DefaultLayout';

const AppWrapper = () => {
  const location = useLocation();

  return (
    <Routes>
      {publicRoutes.map((route, index) => {
        const Page = route.component;
        const Layout = route.layout === null ? Fragment : route.layout || DefaultLayout;

        const isAdminRoute =
          route.path.startsWith('/admin') && route.path !== '/admin/login';

        const protectedUserRoutes = ['/profile', '/gio-hang'];

        const isUserProtectedRoute = protectedUserRoutes.some(path =>
          route.path.startsWith(path)
        );


        const isAdminLoggedIn = localStorage.getItem('adminToken');
        const isUserLoggedIn = localStorage.getItem('userToken');

        // Route có children (ví dụ: /profile)
        if (route.children) {
          return (
            <Route
              key={index}
              path={route.path}
              element={
                (isAdminRoute && !isAdminLoggedIn) || (isUserProtectedRoute && !isUserLoggedIn) ? (
                  <Navigate
                    to={isAdminRoute ? '/admin/login' : '/login'}
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
                  child.layout === null ? Fragment : child.layout || DefaultLayout;

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

        // Route không có children
        return (
          <Route
            key={index}
            path={route.path}
            element={
              (isAdminRoute && !isAdminLoggedIn) || (isUserProtectedRoute && !isUserLoggedIn) ? (
                <Navigate
                  to={isAdminRoute ? '/admin/login' : '/login'}
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
};

export default AppWrapper;