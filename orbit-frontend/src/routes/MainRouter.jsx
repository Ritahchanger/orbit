import { Routes } from 'react-router-dom';

import RouteRenderer from './RouteRenderer';


import PageNotFound from '../components/common/PageNotFound';


import { publicRoutes, authRoutes, adminRoutes } from './routes';

const MainRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <RouteRenderer routes={publicRoutes} />

            {/* Auth Routes */}
            <RouteRenderer routes={authRoutes} />

            {/* Admin Routes */}
            <RouteRenderer routes={adminRoutes} />

            {/* 404 Route */}
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default MainRouter;