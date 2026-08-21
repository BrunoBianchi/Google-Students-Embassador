import { describe, it, expect, beforeAll } from "bun:test";
import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { Campus } from "../database/models/campus.model";
import { CommunityEvent } from "../database/models/event.model";
import { User } from "../database/models/user.model";
import { Announcement } from "../database/models/announcement.model";
import { isAllowedOrigin } from "../controllers/middleware/security.middleware";
import { listGlobalEvents, createEvent } from "../services/community.services";
import { listAmbassadors, getAmbassadorPublicProfile } from "../services/user.services";
import {
  createAnnouncement,
  listAnnouncements,
  ensureAnnouncementIndexes,
} from "../services/announcement.services";
import {
  getRegionByState,
  getStatesForRegionSlug,
  MACRO_REGIONS,
} from "../services/region.services";
import { createOrFindCampus, ensureCampusIndexes } from "../services/campus.services";

describe("Subdomain Architecture & Privacy Isolation Suite", () => {
  let testCampusId: ObjectId;
  let testAmbassadorId: ObjectId;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await ensureCampusIndexes();
    await ensureAnnouncementIndexes();

    // Create a mock campus
    const campus = await createOrFindCampus("Universidade Subdomain Test USP", {
      slug: "usp-subdomain-test",
      emailDomains: ["usp.br"],
      city: "São Paulo",
      state: "SP",
      region: "Sudeste",
    });
    testCampusId = campus._id;

    // Create a mock ambassador
    const userRepo = AppDataSource.getMongoRepository(User);
    const existing = await userRepo.findOneBy({ email: "ambassador.usp@usp.br" });
    if (!existing) {
      const amb = userRepo.create({
        name: "Ana Silva",
        email: "ambassador.usp@usp.br",
        password: "hashed_test_pass",
        nickname: "anasilva_usp",
        state: "SP",
        city: "São Paulo",
        region: "Sudeste",
        course: "Ciência da Computação",
        birth: new Date(2000, 0, 1),
        universityId: testCampusId,
        userType: "ambassador",
        emailVerifiedAt: new Date(),
        bio: "Embaixadora de IA e Cloud na USP",
        likes: 12,
        privacySettings: {
          isPublic: true,
          showCampus: true,
          showRegion: true,
          showCourse: true,
          showBio: true,
          showSocialLinks: true,
        },
      });
      const saved = await userRepo.save(amb);
      testAmbassadorId = Array.isArray(saved) ? saved[0]._id : saved._id;
    } else {
      testAmbassadorId = existing._id;
    }
  });

  it("1. CORS Allowlist aceita todos os subdomínios oficiais da plataforma", () => {
    expect(isAllowedOrigin("https://studentembassador.com")).toBe(true);
    expect(isAllowedOrigin("https://www.studentembassador.com")).toBe(true);
    expect(isAllowedOrigin("https://campus.studentembassador.com")).toBe(true);
    expect(isAllowedOrigin("https://events.studentembassador.com")).toBe(true);
    expect(isAllowedOrigin("https://connect.studentembassador.com")).toBe(true);
    expect(isAllowedOrigin("https://studentambassador.com")).toBe(true);

    // Domínios maliciosos ou não autorizados devem ser rejeitados
    expect(isAllowedOrigin("https://malicious-site.com")).toBe(false);
    expect(isAllowedOrigin("https://evil-studentembassador.com")).toBe(false);
  });

  it("2. Mapeamento geográfico de Macrorregiões Brasileiras (Sudeste, Sul, Nordeste, Norte, Centro-Oeste)", () => {
    expect(getRegionByState("SP")).toBe("Sudeste");
    expect(getRegionByState("MG")).toBe("Sudeste");
    expect(getRegionByState("RS")).toBe("Sul");
    expect(getRegionByState("BA")).toBe("Nordeste");
    expect(getRegionByState("DF")).toBe("Centro-Oeste");
    expect(getRegionByState("AM")).toBe("Norte");

    const sudesteStates = getStatesForRegionSlug("sudeste");
    expect(sudesteStates).toContain("SP");
    expect(sudesteStates).toContain("MG");
    expect(sudesteStates).toContain("RJ");
    expect(sudesteStates).toContain("ES");

    expect(MACRO_REGIONS.length).toBe(5);
  });

  it("3. Isolamento estrito de Eventos Globais (events.* nunca vaza eventos de campus)", async () => {
    const eventRepo = AppDataSource.getMongoRepository(CommunityEvent);

    // Create 1 global event and 1 campus-specific event
    const globalEvent = eventRepo.create({
      title: "Summit Nacional de IA 2026",
      description: "Evento aberto a todos os estudantes do Brasil",
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      location: "Auditório Virtual Google Meet",
      createdBy: testAmbassadorId,
      visibility: "GLOBAL",
      tags: ["ai", "summit", "global"],
      createdAt: new Date().toISOString(),
    });
    await eventRepo.save(globalEvent);

    const campusEvent = eventRepo.create({
      title: "Hackathon Interno Exclusivo USP",
      description: "Apenas para alunos matriculados no campus USP",
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      location: "Laboratório 3 - IME USP",
      createdBy: testAmbassadorId,
      visibility: "CAMPUS",
      campusId: testCampusId,
      tags: ["usp", "hackathon"],
      createdAt: new Date().toISOString(),
    });
    await eventRepo.save(campusEvent);

    // Query global events
    const globalResult = await listGlobalEvents({ timeframe: "upcoming" });
    const titles = globalResult.events.map((e) => e.title);

    expect(titles).toContain("Summit Nacional de IA 2026");
    expect(titles).not.toContain("Hackathon Interno Exclusivo USP");

    // All events returned by listGlobalEvents MUST have visibility === "GLOBAL"
    for (const ev of globalResult.events) {
      expect(ev.visibility).toBe("GLOBAL");
    }
  });

  it("4. Filtros de Ambassadors no Connect Hub por macrorregião e campus", async () => {
    // List ambassadors filtered by Sudeste
    const sudesteResult = await listAmbassadors({ region: "sudeste" });
    expect(sudesteResult.ambassadors.length).toBeGreaterThan(0);
    expect(sudesteResult.ambassadors.some((a) => a.id === testAmbassadorId.toHexString())).toBe(true);

    // List ambassadors filtered by Norte (should not include SP ambassador)
    const norteResult = await listAmbassadors({ region: "norte" });
    expect(norteResult.ambassadors.some((a) => a.id === testAmbassadorId.toHexString())).toBe(false);

    // Verify DTO does not leak private sensitive fields
    for (const amb of sudesteResult.ambassadors) {
      expect((amb as any).passwordHash).toBeUndefined();
      expect((amb as any).email).toBeUndefined();
      expect((amb as any).phone).toBeUndefined();
    }
  });

  it("5. Perfil público de Ambassador respeita configurações de privacidade", async () => {
    const profile = await getAmbassadorPublicProfile(testAmbassadorId.toHexString());
    expect(profile).toBeDefined();
    expect(profile.name).toBe("Ana Silva");
    expect(profile.course).toBe("Ciência da Computação");
    expect(profile.bio).toBe("Embaixadora de IA e Cloud na USP");

    // Private fields MUST never be present
    expect((profile as any).email).toBeUndefined();
    expect((profile as any).phone).toBeUndefined();
    expect((profile as any).passwordHash).toBeUndefined();
  });

  it("6. Comunicados oficiais com escopo GLOBAL vs CAMPUS", async () => {
    const annRepo = AppDataSource.getMongoRepository(Announcement);

    await createAnnouncement(
      {
        title: "Abertura das Inscrições para o Programa 2026",
        content: "Estão abertas as inscrições nacionais de novos embaixadores.",
        summary: "Inscrições abertas para estudantes.",
        visibility: "GLOBAL",
        category: "OPPORTUNITY",
      },
      testAmbassadorId,
      "Ana Silva",
    );

    await createAnnouncement(
      {
        title: "Reunião de Alinhamento Interno USP",
        content: "Encontro local no bloco B do campus USP.",
        summary: "Apenas para embaixadores da USP.",
        visibility: "CAMPUS",
        campusId: testCampusId.toHexString(),
        category: "GENERAL",
      },
      testAmbassadorId,
      "Ana Silva",
    );

    // Global query
    const globalAnn = await listAnnouncements({ scope: "GLOBAL" });
    const globalTitles = globalAnn.announcements.map((a) => a.title);

    expect(globalTitles).toContain("Abertura das Inscrições para o Programa 2026");
    expect(globalTitles).not.toContain("Reunião de Alinhamento Interno USP");

    // Campus query
    const campusAnn = await listAnnouncements({ scope: "CAMPUS", campusId: testCampusId.toHexString() });
    const campusTitles = campusAnn.announcements.map((a) => a.title);

    expect(campusTitles).toContain("Reunião de Alinhamento Interno USP");
  });
});
