import { useEffect, useState } from "react";
import "./index.css";
import GoogleTenant from "./tenants/google/GoogleTenant";
import AuthPage from "./tenants/google/components/AuthPage";
import Dashboard from "./tenants/google/components/Dashboard";
import PublicProfile from "./tenants/google/components/PublicProfile";
import EventPage from "./tenants/google/components/EventPage";
import AccountActionPage from "./tenants/google/components/AccountActionPage";
import LegalPage from "./tenants/google/components/LegalPage";
import StudentAIGuidePage from "./tenants/google/components/StudentAIGuidePage";
import { AuthProvider } from "./contexts/AuthContext";
import { CampusProvider } from "./contexts/CampusContext";
import CampusLayout, { type CampusTab } from "./tenants/google/components/campus/CampusLayout";
import CampusHome from "./tenants/google/components/campus/CampusHome";
import CampusEvents from "./tenants/google/components/campus/CampusEvents";
import CampusWorkshops from "./tenants/google/components/campus/CampusWorkshops";
import CampusResources from "./tenants/google/components/campus/CampusResources";
import CampusGemini from "./tenants/google/components/campus/CampusGemini";
import CampusAbout from "./tenants/google/components/campus/CampusAbout";
import CampusDirectory from "./tenants/google/components/campus/CampusDirectory";
import AboutPage from "./tenants/google/components/main/AboutPage";
import ProgramsPage from "./tenants/google/components/main/ProgramsPage";
import OpportunitiesPage from "./tenants/google/components/main/OpportunitiesPage";
import PartnersPage from "./tenants/google/components/main/PartnersPage";
import EventsPortal from "./tenants/google/components/events/EventsPortal";
import ConnectPortal from "./tenants/google/components/connect/ConnectPortal";
import AmbassadorProfileView from "./tenants/google/components/connect/AmbassadorProfileView";
import BrazilNetworkMap from "./tenants/google/components/BrazilNetworkMap";
import NotFoundPage from "./tenants/google/components/NotFoundPage";
import { resolveAppContext, type AppContext } from "./utils/subdomain";
import { updateSeo } from "./seo";

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const reservedCampusPaths = new Set([
  "",
  "login",
  "register",
  "verify-email",
  "forgot-password",
  "reset-password",
  "unsubscribe",
  "terms",
  "privacy",
  "students",
  "estudantes",
  "dashboard",
  "ambassadors",
  "events",
  "forums",
  "u",
  "campuses",
  "about",
  "programs",
  "opportunities",
  "partners",
  "regions",
  "announcements",
  "community",
  "map",
  "api",
  "uploads",
]);

function renderCampusSpace(slug: string, subRoute: string) {
  let activeTab: CampusTab = "home";
  let child = <CampusHome />;

  if (subRoute === "events") {
    activeTab = "events";
    child = <CampusEvents />;
  } else if (subRoute === "workshops") {
    activeTab = "workshops";
    child = <CampusWorkshops />;
  } else if (subRoute === "resources") {
    activeTab = "resources";
    child = <CampusResources />;
  } else if (subRoute === "gemini") {
    activeTab = "gemini";
    child = <CampusGemini />;
  } else if (subRoute === "about") {
    activeTab = "about";
    child = <CampusAbout />;
  } else if (subRoute) {
    return <NotFoundPage />;
  }

  return (
    <CampusProvider campusSlug={slug}>
      <CampusLayout activeTab={activeTab}>
        {child}
      </CampusLayout>
    </CampusProvider>
  );
}

function AppContent() {
  const [context, setContext] = useState<AppContext>("MAIN");

  useEffect(() => {
    setContext(resolveAppContext());
  }, []);

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const segments = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const firstSegment = segments[0] || "";
  const secondSegment = segments[1] || "";

  useEffect(() => {
    const isCampusRoute = !reservedCampusPaths.has(firstSegment) && firstSegment !== "";
    const noIndex =
      path === "/login" ||
      path === "/register" ||
      path === "/dashboard" ||
      path.startsWith("/forums/") ||
      path === "/verify-email" ||
      path === "/forgot-password" ||
      path === "/reset-password" ||
      path === "/unsubscribe";

    let title = "Student Ambassador Hub";
    let description = "Eventos, comunidades, grupos de estudo e conexões entre estudantes e embaixadores em universidades brasileiras.";
    let jsonLd: Record<string, unknown> | undefined = undefined;

    if (isCampusRoute) {
      const slugUpper = firstSegment.toUpperCase();
      if (secondSegment === "events") {
        title = `Eventos · Campus ${slugUpper} | Student Ambassador`;
        description = `Agenda de eventos, encontros e workshops universitários no campus ${slugUpper}.`;
      } else if (secondSegment === "workshops") {
        title = `Workshops & Study Jams · Campus ${slugUpper} | Student Ambassador`;
        description = `Oficinas práticas de IA, nuvem e desenvolvimento de software no campus ${slugUpper}.`;
      } else if (secondSegment === "resources") {
        title = `Recursos & Prompts · Campus ${slugUpper} | Student Ambassador`;
        description = `Cofre de prompts acadêmicos, guias de estudo e materiais didáticos para estudantes da ${slugUpper}.`;
      } else if (secondSegment === "gemini") {
        title = `Gemini & IA Acadêmica · Campus ${slugUpper} | Student Ambassador`;
        description = `Hub de Inteligência Artificial, grupos de estudo e ferramentas de IA da ${slugUpper}.`;
      } else if (secondSegment === "about") {
        title = `Sobre o Campus ${slugUpper} | Student Ambassador`;
        description = `Informações institucionais, liderança de embaixadores e validação de e-mail da ${slugUpper}.`;
      } else {
        title = `Campus ${slugUpper} · Espaço Universitário | Student Ambassador`;
        description = `Comunidade acadêmica e de tecnologia do campus ${slugUpper} no Student Ambassador Hub.`;
      }
    } else if (context === "EVENTS" || path === "/events") {
      title = "Eventos Globais & Study Jams | Student Ambassador";
      description = "Descubra eventos, palestras e summits universitários abertos em todo o Brasil.";
    } else if (path === "/map") {
      title = "Mapa da Comunidade no Brasil | Student Ambassador";
      description = "Explore embaixadores, instituições e eventos universitários públicos em todo o Brasil.";
    } else if (context === "CONNECT" || path === "/connect" || path === "/ambassadors") {
      title = "Connect & Ambassadors | Student Ambassador";
      description = "Diretório de embaixadores universitários por região e instituição de ensino.";
    } else if (context === "CAMPUS" || path === "/campuses") {
      title = "Diretório de Universidades & Campi | Student Ambassador";
      description = "Explore espaços acadêmicos dedicados de universidades em todo o Brasil.";
    } else if (path === "/students" || path === "/estudantes") {
      title = "Guia do Estudante: Inteligência Artificial & Gemini | Student Ambassador";
      description =
        "Como LLMs, Transformers e Embeddings funcionam, comparador interativo de prompts bons vs ruins, guia anti-alucinação e cofre de prompts exclusivos com resultados esperados para universitários.";
      jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Course",
            name: "Guia do Estudante: Domine IA Generativa & Estudos Universitários",
            description:
              "Aprenda arquitetura de LLMs, Transformers, Embeddings, Engenharia de Prompts avançada e técnicas anti-alucinação para estudos acadêmicos.",
            provider: {
              "@type": "Organization",
              name: "Student Ambassador",
              url: window.location.origin,
            },
            educationalLevel: "University / College",
            inLanguage: "pt-BR",
          },
        ],
      };
    }

    updateSeo({ title, description, canonical: `${window.location.origin}${path}`, noIndex, jsonLd });
  }, [path, firstSegment, secondSegment, context]);

  // 1. Auth & Account Action Routes (Shared across all contexts)
  if (path === "/login") return <AuthPage mode="login" />;
  if (path === "/register") return <AuthPage mode="register" />;
  if (path === "/verify-email") return <AccountActionPage action="verify" />;
  if (path === "/forgot-password") return <AccountActionPage action="forgot" />;
  if (path === "/reset-password") return <AccountActionPage action="reset" />;
  if (path === "/unsubscribe") return <AccountActionPage action="unsubscribe" />;
  if (path === "/terms") return <LegalPage kind="terms" />;
  if (path === "/privacy") return <LegalPage kind="privacy" />;
  if (path === "/students" || path === "/estudantes") return <StudentAIGuidePage />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/map") return <BrazilNetworkMap />;

  // 2. Global Resources Routes (accessible from anywhere)
  if (path.startsWith("/events/") && path.split("/")[2]) {
    return <EventPage eventId={path.split("/")[2]!} />;
  }

  if (path.startsWith("/u/") && path.split("/")[2]) {
    return <PublicProfile userId={path.split("/")[2]!} />;
  }

  // 3. CAMPUS CONTEXT (campus.studentembassador.com or ?context=campus)
  if (context === "CAMPUS") {
    // Dynamic Multi-Campus Routing (/:campusSlug/*)
    if (!reservedCampusPaths.has(firstSegment) && firstSegment !== "") {
      return renderCampusSpace(firstSegment, secondSegment);
    }
    // Default Campus directory home
    return <CampusDirectory />;
  }

  // 4. EVENTS CONTEXT (events.studentembassador.com or ?context=events)
  if (context === "EVENTS") {
    if (path === "/upcoming" || path === "/") {
      return <EventsPortal initialTab="upcoming" />;
    }
    if (path === "/calendar") {
      return <EventsPortal initialTab="calendar" />;
    }
    if (path === "/past") {
      return <EventsPortal initialTab="past" />;
    }
    if (firstSegment && !reservedCampusPaths.has(firstSegment)) {
      return <EventPage eventId={firstSegment} />;
    }
    return <EventsPortal initialTab="upcoming" />;
  }

  // 5. CONNECT CONTEXT (connect.studentembassador.com or ?context=connect)
  if (context === "CONNECT") {
    if (path.startsWith("/ambassadors/") && path.split("/")[2]) {
      return <AmbassadorProfileView identifier={path.split("/")[2]!} />;
    }
    if (path.startsWith("/@") && firstSegment.startsWith("@")) {
      return <AmbassadorProfileView identifier={firstSegment.replace(/^@/, "")} />;
    }
    if (path.startsWith("/regions/") && path.split("/")[2]) {
      return <ConnectPortal initialTab="regions" selectedRegionSlug={path.split("/")[2]!} />;
    }
    if (path === "/regions") {
      return <ConnectPortal initialTab="regions" />;
    }
    if (path === "/announcements") {
      return <ConnectPortal initialTab="announcements" />;
    }
    if (path === "/community") {
      return <ConnectPortal initialTab="community" />;
    }
    return <ConnectPortal initialTab="ambassadors" />;
  }

  // 6. MAIN CONTEXT (studentembassador.com, www.*, localhost, or ?context=main)
  if (path === "/about") return <AboutPage />;
  if (path === "/programs") return <ProgramsPage />;
  if (path === "/opportunities") return <OpportunitiesPage />;
  if (path === "/partners") return <PartnersPage />;
  if (path === "/campuses") return <CampusDirectory />;
  if (path === "/events") return <EventsPortal initialTab="upcoming" />;
  if (path === "/ambassadors") return <ConnectPortal initialTab="ambassadors" />;
  if (path.startsWith("/ambassadors/") && path.split("/")[2]) {
    return <AmbassadorProfileView identifier={path.split("/")[2]!} />;
  }
  if (path === "/regions") return <ConnectPortal initialTab="regions" />;
  if (path.startsWith("/regions/") && path.split("/")[2]) {
    return <ConnectPortal initialTab="regions" selectedRegionSlug={path.split("/")[2]!} />;
  }
  if (path === "/announcements") return <ConnectPortal initialTab="announcements" />;

  // Dynamic campus resolution if accessed directly on main
  if (!reservedCampusPaths.has(firstSegment) && firstSegment !== "") {
    return renderCampusSpace(firstSegment, secondSegment);
  }

  return path === "/" ? <GoogleTenant /> : <NotFoundPage />;
}

export default App;
