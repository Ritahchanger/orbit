// The platform dashboard: Orbit's own staff view of every business on the
// platform. A self-contained module — its own API client, session, layout
// and pages — mounted by App.jsx at /platform/*.
import { Route, Routes } from "react-router-dom";
import PlatformGuard from "./components/PlatformGuard";
import PlatformLayout from "./layout/PlatformLayout";
import PlatformLogin from "./pages/PlatformLogin";
import PlatformOverview from "./pages/PlatformOverview";
import PlatformBusinesses from "./pages/PlatformBusinesses";
import PlatformBusinessDetail from "./pages/PlatformBusinessDetail";
import { EmptyState } from "./components/ui/States";

const PlatformApp = () => (
  <Routes>
    <Route path="login" element={<PlatformLogin />} />
    <Route element={<PlatformGuard />}>
      <Route element={<PlatformLayout />}>
        <Route index element={<PlatformOverview />} />
        <Route path="businesses" element={<PlatformBusinesses />} />
        <Route path="businesses/:id" element={<PlatformBusinessDetail />} />
        <Route path="*" element={<EmptyState title="Page not found">This page doesn't exist in the console.</EmptyState>} />
      </Route>
    </Route>
  </Routes>
);

export default PlatformApp;
