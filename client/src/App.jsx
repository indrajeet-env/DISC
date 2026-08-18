import { useEffect, useState, useMemo } from "react";
import { authService } from "./services/authService";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HospitalDashboard from "./components/HospitalDashboard";
import VendorDashboard from "./pages/VendorDashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        const currentSession = await authService.getSession();
        setSession(currentSession);
        if (currentSession?.user?.id) {
          const userProfile = await authService.getProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = authService.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        try {
          const userProfile = await authService.getProfile(newSession.user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error("Profile fetch error:", error);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
    
  if (!session) {
    if (showSignup) {
      return <Signup onNavigateLogin={() => setShowSignup(false)} />;
    }
    return <Login onNavigateSignup={() => setShowSignup(true)} />;
  }

  if (profile?.role === "VENDOR") {
    return <VendorDashboard session={session} profile={profile} />;
  }

  return <HospitalDashboard session={session} profile={profile} />;
}


