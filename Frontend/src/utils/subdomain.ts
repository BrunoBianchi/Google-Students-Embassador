export type AppContext = "MAIN" | "CAMPUS" | "EVENTS" | "CONNECT";

export function resolveAppContext(
  hostname: string = typeof window !== "undefined" ? window.location.hostname : "",
  searchParams?: URLSearchParams,
): AppContext {
  // 1. Query override for local development testing (e.g. ?context=campus)
  if (searchParams) {
    const override = searchParams.get("context")?.toUpperCase();
    if (override === "CAMPUS" || override === "EVENTS" || override === "CONNECT" || override === "MAIN") {
      return override as AppContext;
    }
  } else if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("context")?.toUpperCase();
    if (override === "CAMPUS" || override === "EVENTS" || override === "CONNECT" || override === "MAIN") {
      return override as AppContext;
    }
  }

  const host = hostname.toLowerCase();

  // 2. Subdomain check (production and local subdomains like campus.localhost)
  if (host.startsWith("campus.") || host === "campus.studentembassador.com" || host === "campus.studentambassador.com") {
    return "CAMPUS";
  }

  if (host.startsWith("events.") || host === "events.studentembassador.com" || host === "events.studentambassador.com") {
    return "EVENTS";
  }

  if (host.startsWith("connect.") || host === "connect.studentembassador.com" || host === "connect.studentambassador.com") {
    return "CONNECT";
  }

  // 3. Main site (studentembassador.com, www.studentembassador.com, localhost)
  return "MAIN";
}

export function getCrossSubdomainUrl(targetContext: AppContext, targetPath: string = "/"): string {
  if (typeof window === "undefined") return targetPath;

  const currentContext = resolveAppContext();
  const isProd = !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");
  const normalizedPath = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

  if (isProd) {
    const baseDomain = window.location.hostname.includes("studentambassador.com")
      ? "studentambassador.com"
      : "studentembassador.com";

    switch (targetContext) {
      case "MAIN":
        return `https://${baseDomain}${normalizedPath}`;
      case "CAMPUS":
        return `https://campus.${baseDomain}${normalizedPath}`;
      case "EVENTS":
        return `https://events.${baseDomain}${normalizedPath}`;
      case "CONNECT":
        return `https://connect.${baseDomain}${normalizedPath}`;
    }
  }

  // Local development handling:
  // If already on the same context, just return path
  if (currentContext === targetContext) {
    return normalizedPath;
  }

  // Supports ?context= parameter in local development or subdomain if configured
  if (window.location.hostname.endsWith(".localhost")) {
    const sub = targetContext.toLowerCase();
    const prefix = sub === "main" ? "" : `${sub}.`;
    return `${window.location.protocol}//${prefix}localhost:${window.location.port || "3000"}${normalizedPath}`;
  }

  const separator = normalizedPath.includes("?") ? "&" : "?";
  return `${normalizedPath}${separator}context=${targetContext.toLowerCase()}`;
}
