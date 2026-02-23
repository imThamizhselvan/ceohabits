import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ProtectedRoute, AuthRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Habits } from './pages/Habits';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.2, ease: 'easeInOut' as const };

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />

        <Route
          path="/auth"
          element={
            <AuthRoute>
              <PageWrapper><Auth /></PageWrapper>
            </AuthRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<ErrorBoundary><PageWrapper><Dashboard /></PageWrapper></ErrorBoundary>} />
          <Route path="/habits" element={<ErrorBoundary><PageWrapper><Habits /></PageWrapper></ErrorBoundary>} />
          <Route path="/achievements" element={<ErrorBoundary><PageWrapper><Achievements /></PageWrapper></ErrorBoundary>} />
          <Route path="/profile" element={<ErrorBoundary><PageWrapper><Profile /></PageWrapper></ErrorBoundary>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
