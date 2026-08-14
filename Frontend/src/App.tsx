import { useEffect, useState } from "react";
import "./index.css";
import GoogleTenant from "./tenants/google/GoogleTenant";
import AuthPage from "./tenants/google/components/AuthPage";
import Dashboard from "./tenants/google/components/Dashboard";
import PublicProfile from "./tenants/google/components/PublicProfile";
import ForumPage from "./tenants/google/components/ForumPage";
import AmbassadorDirectory from "./tenants/google/components/AmbassadorDirectory";
import EventPage from "./tenants/google/components/EventPage";
import EventDirectory from "./tenants/google/components/EventDirectory";
import ForumDirectory from "./tenants/google/components/ForumDirectory";
import AccountActionPage from "./tenants/google/components/AccountActionPage";
import LegalPage from "./tenants/google/components/LegalPage";
import { AuthProvider } from "./contexts/AuthContext";
import { updateSeo } from "./seo";

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [subdomain, setSubdomain] = useState<string>("");

  useEffect(() => {
    const host = window.location.hostname;
    // For localhost testing, we can use google.localhost or just assume 'google' if no other known subdomain
    const parts = host.split(".");

    // In production, studentsembassador.com has 2 parts. google.studentsembassador.com has 3 parts.
    // For localhost, google.localhost has 2 parts.
    if (parts.length >= 2 && parts[0] !== "www" && parts[0] !== "localhost") {
      setSubdomain(parts[0] ?? "google");
    } else {
      // Default or fallback (useful for dev if accessed via 127.0.0.1 or localhost without subdomain)
      setSubdomain("google"); // Default to google for this task
    }
  }, []);

  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  useEffect(() => {
    const noIndex = path === "/login" || path === "/register" || path === "/dashboard" || path.startsWith("/forums/") || path === "/verify-email" || path === "/forgot-password" || path === "/reset-password" || path === "/unsubscribe";
    const [title, description] = path === "/terms"
      ? ["Termos de Uso | Google Student Ambassador Hub", "Regras de participação e uso do Google Student Ambassador Hub."]
      : path === "/privacy"
        ? ["Política de Privacidade | Google Student Ambassador Hub", "Como o Google Student Ambassador Hub trata dados e comunicações."]
      : path === "/events"
      ? ["Eventos universitários | Google Student Ambassador Hub", "Encontre eventos, workshops e encontros da comunidade universitária."]
      : path === "/ambassadors"
        ? ["Embaixadores estudantis | Google Student Ambassador Hub", "Conheça estudantes e embaixadores que movimentam comunidades universitárias."]
        : path === "/forums"
          ? ["Fóruns da comunidade | Google Student Ambassador Hub", "Descubra discussões e trocas de conhecimento da comunidade."]
          : ["Google Student Ambassador Hub", "Eventos, fóruns, grupos e conexões entre estudantes e embaixadores em universidades brasileiras."];
    updateSeo({ title, description, canonical: `${window.location.origin}${path}`, noIndex });
  }, [path]);

  if (path === "/login") {
    return <AuthPage mode="login" />;
  }

  if (path === "/register") {
    return <AuthPage mode="register" />;
  }

  if (path === "/verify-email") return <AccountActionPage action="verify" />;
  if (path === "/forgot-password") return <AccountActionPage action="forgot" />;
  if (path === "/reset-password") return <AccountActionPage action="reset" />;
  if (path === "/unsubscribe") return <AccountActionPage action="unsubscribe" />;
  if (path === "/terms") return <LegalPage kind="terms" />;
  if (path === "/privacy") return <LegalPage kind="privacy" />;

  if (path === "/dashboard") {
    return <Dashboard />;
  }

  if (path === "/ambassadors") {
    return <AmbassadorDirectory />;
  }

  if (path === "/events") {
    return <EventDirectory />;
  }

  if (path === "/forums") {
    return <ForumDirectory />;
  }

  if (path.startsWith("/events/") && path.split("/")[2]) {
    return <EventPage eventId={path.split("/")[2]!} />;
  }

  if (path.startsWith("/forums/") && path.split("/")[2]) {
    return <ForumPage forumId={path.split("/")[2]!} />;
  }

  if (path.startsWith("/u/") && path.split("/")[2]) {
    return <PublicProfile userId={path.split("/")[2]!} />;
  }

  if (subdomain === "google") {
    return <GoogleTenant />;
  }

  // Placeholder for other subdomains (aws, microsoft, etc)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Student Ambassadors
        </h1>
        <p>
          Tenant for subdomain:{" "}
          <span className="font-semibold text-blue-600">
            {subdomain || "Main Site"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;
