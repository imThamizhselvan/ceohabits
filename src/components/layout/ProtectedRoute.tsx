import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function AuthRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="w-12 h-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isSignedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
