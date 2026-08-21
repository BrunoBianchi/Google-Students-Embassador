import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { Campus } from "../database/models/campus.model";
import { CampusMember } from "../database/models/campus-member.model";
import { CommunityEvent } from "../database/models/event.model";
import { User } from "../database/models/user.model";
import {
  createOrFindCampus,
  ensureCampusIndexes,
  findCampusBySlug,
  getCampusMembership,
  validateInstitutionalEmail,
  ensureUserCampusMembership,
} from "../services/campus.services";
import { createEvent, listCampusEvents } from "../services/community.services";

describe("Multi-Campus Architecture & Security Isolation Suite", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await ensureCampusIndexes();
  });

  it("1. Resolução e normalização de slug de campus sem duplicação", async () => {
    const campus1 = await createOrFindCampus("Universidade Federal de Itajubá Test", {
      slug: "unifei-test",
      emailDomains: ["unifei.edu.br"],
      city: "Itajubá",
      state: "MG",
    });

    expect(campus1).toBeDefined();
    expect(campus1.slug).toBe("unifei-test");

    // Attempting to create same campus under different casing should find existing
    const campusDuplicate = await createOrFindCampus("universidade federal de itajubá test", {
      slug: "unifei-test",
    });

    expect(campusDuplicate._id.toHexString()).toBe(campus1._id.toHexString());

    const resolved = await findCampusBySlug("unifei-test");
    expect(resolved).toBeDefined();
    expect(resolved?._id.toHexString()).toBe(campus1._id.toHexString());
  });

  it("2. Validação estrita de domínios institucionais de e-mail (Prevenção de bypass)", () => {
    const campus: Campus = {
      _id: new ObjectId(),
      name: "UNIFEI",
      slug: "unifei",
      emailDomains: ["unifei.edu.br"],
      country: "BR",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Valid institutional emails
    expect(validateInstitutionalEmail("bruno@unifei.edu.br", campus)).toBe(true);
    expect(validateInstitutionalEmail("aluno.eng@unifei.edu.br", campus)).toBe(true);
    expect(validateInstitutionalEmail("PROFESSOR@UNIFEI.EDU.BR", campus)).toBe(true);

    // Invalid & spoofing attempts
    expect(validateInstitutionalEmail("aluno@usp.br", campus)).toBe(false);
    expect(validateInstitutionalEmail("aluno@gmail.com", campus)).toBe(false);
    expect(validateInstitutionalEmail("attacker@unifei.edu.br.attacker.com", campus)).toBe(false);
    expect(validateInstitutionalEmail("attacker@fake-unifei.edu.br", campus)).toBe(false);
    expect(validateInstitutionalEmail("", campus)).toBe(false);
  });

  it("3. Concessão e persistência de membership de campus", async () => {
    const campus = await createOrFindCampus("USP Test", {
      slug: "usp-test",
      emailDomains: ["usp.br"],
    });

    const userRepo = AppDataSource.getMongoRepository(User);
    const testUser = userRepo.create({
      name: "Estudante USP",
      email: `estudante.usp.${Date.now()}@usp.br`,
      password: "hashedpassword",
      birth: new Date(2000, 1, 1),
      state: "SP",
      city: "São Paulo",
      userType: "student",
      universityId: campus._id,
      emailVerifiedAt: new Date(),
      avatarFrame: "none",
      likes: 0,
      likedByIds: [],
      emailPreferences: { eventUpdates: true, forumUpdates: true, productUpdates: true },
    });
    const savedUser = await userRepo.save(testUser);

    const member = await ensureUserCampusMembership(savedUser, campus, "STUDENT");
    expect(member).toBeDefined();
    expect(member.status).toBe("ACTIVE");
    expect(member.role).toBe("STUDENT");

    const checkedMembership = await getCampusMembership(savedUser._id, campus._id);
    expect(checkedMembership).toBeDefined();
    expect(checkedMembership?.status).toBe("ACTIVE");
  });

  it("4. Isolamento estrito de eventos entre campuses (GLOBAL vs CAMPUS)", async () => {
    const campusUnifei = await createOrFindCampus("UNIFEI Event Test", {
      slug: "unifei-ev-test",
      emailDomains: ["unifei.edu.br"],
    });
    const campusUsp = await createOrFindCampus("USP Event Test", {
      slug: "usp-ev-test",
      emailDomains: ["usp.br"],
    });

    const userRepo = AppDataSource.getMongoRepository(User);

    // Ambassador UNIFEI
    const ambUnifei = await userRepo.save(
      userRepo.create({
        name: "Ambassador UNIFEI",
        email: `amb.unifei.${Date.now()}@unifei.edu.br`,
        password: "hash",
        birth: new Date(2000, 1, 1),
        state: "MG",
        city: "Itajubá",
        userType: "ambassador",
        universityId: campusUnifei._id,
        emailVerifiedAt: new Date(),
        avatarFrame: "none",
        likes: 0,
        likedByIds: [],
        emailPreferences: { eventUpdates: true, forumUpdates: true, productUpdates: true },
      }),
    );
    await ensureUserCampusMembership(ambUnifei, campusUnifei, "AMBASSADOR");

    // Student UNIFEI
    const studentUnifei = await userRepo.save(
      userRepo.create({
        name: "Student UNIFEI",
        email: `student.unifei.${Date.now()}@unifei.edu.br`,
        password: "hash",
        birth: new Date(2001, 1, 1),
        state: "MG",
        city: "Itajubá",
        userType: "student",
        universityId: campusUnifei._id,
        emailVerifiedAt: new Date(),
        avatarFrame: "none",
        likes: 0,
        likedByIds: [],
        emailPreferences: { eventUpdates: true, forumUpdates: true, productUpdates: true },
      }),
    );
    await ensureUserCampusMembership(studentUnifei, campusUnifei, "STUDENT");

    // Student USP
    const studentUsp = await userRepo.save(
      userRepo.create({
        name: "Student USP",
        email: `student.usp.${Date.now()}@usp.br`,
        password: "hash",
        birth: new Date(2001, 1, 1),
        state: "SP",
        city: "São Paulo",
        userType: "student",
        universityId: campusUsp._id,
        emailVerifiedAt: new Date(),
        avatarFrame: "none",
        likes: 0,
        likedByIds: [],
        emailPreferences: { eventUpdates: true, forumUpdates: true, productUpdates: true },
      }),
    );
    await ensureUserCampusMembership(studentUsp, campusUsp, "STUDENT");

    // 1. Create Global Event
    const globalEvent = await createEvent(
      {
        title: "Summit Nacional de IA 2026",
        description: "Evento global aberto para todos os estudantes do país.",
        startsAt: new Date(Date.now() + 86400000),
        location: "Online",
        visibility: "GLOBAL",
        imageUrls: [],
        tags: ["ai", "conference"],
        organizerIds: [],
        createForum: false,
      },
      ambUnifei._id,
    );

    // 2. Create Private UNIFEI Event
    const unifeiEvent = await createEvent(
      {
        title: "Hackathon Interno UNIFEI 2026",
        description: "Hackathon exclusivo para estudantes matriculados na UNIFEI.",
        startsAt: new Date(Date.now() + 86400000 * 2),
        location: "Prédio Central UNIFEI",
        visibility: "CAMPUS",
        campusId: campusUnifei._id.toHexString(),
        imageUrls: [],
        tags: ["hackathon", "workshop"],
        organizerIds: [],
        createForum: false,
      },
      ambUnifei._id,
    );

    // Student of UNIFEI querying UNIFEI events -> receives GLOBAL + LOCAL UNIFEI
    const unifeiStudentView = await listCampusEvents("unifei-ev-test", studentUnifei._id);
    expect(unifeiStudentView.isMember).toBe(true);
    const unifeiEventIds = unifeiStudentView.events.map((e) => e.id);
    expect(unifeiEventIds).toContain(globalEvent.id);
    expect(unifeiEventIds).toContain(unifeiEvent.id);

    // Student of USP querying UNIFEI events -> receives GLOBAL, but NOT private UNIFEI event!
    const uspStudentViewOnUnifei = await listCampusEvents("unifei-ev-test", studentUsp._id);
    expect(uspStudentViewOnUnifei.isMember).toBe(false);
    const uspViewEventIds = uspStudentViewOnUnifei.events.map((e) => e.id);
    expect(uspViewEventIds).toContain(globalEvent.id);
    expect(uspViewEventIds).not.toContain(unifeiEvent.id);

    // Unauthenticated user querying UNIFEI events -> receives GLOBAL only
    const publicView = await listCampusEvents("unifei-ev-test", null);
    expect(publicView.isMember).toBe(false);
    const publicEventIds = publicView.events.map((e) => e.id);
    expect(publicEventIds).toContain(globalEvent.id);
    expect(publicEventIds).not.toContain(unifeiEvent.id);
  });

  it("5. Tentativa de escalação horizontal de privilégios por embaixador (Bloqueio de IDOR)", async () => {
    const campusUnifei = await createOrFindCampus("UNIFEI Security Test", { slug: "unifei-sec-test" });
    const campusUsp = await createOrFindCampus("USP Security Test", { slug: "usp-sec-test" });

    const userRepo = AppDataSource.getMongoRepository(User);
    const ambUnifei = await userRepo.save(
      userRepo.create({
        name: "Ambassador UNIFEI Hacker Attempt",
        email: `amb.hacker.${Date.now()}@unifei.edu.br`,
        password: "hash",
        birth: new Date(2000, 1, 1),
        state: "MG",
        city: "Itajubá",
        userType: "ambassador",
        universityId: campusUnifei._id,
        emailVerifiedAt: new Date(),
        avatarFrame: "none",
        likes: 0,
        likedByIds: [],
        emailPreferences: { eventUpdates: true, forumUpdates: true, productUpdates: true },
      }),
    );
    await ensureUserCampusMembership(ambUnifei, campusUnifei, "AMBASSADOR");

    // Ambassador UNIFEI maliciously sends campusId of USP
    let errorThrown = false;
    try {
      await createEvent(
        {
          title: "Malicious Workshop at USP",
          description: "Trying to inject event into another campus",
          startsAt: new Date(Date.now() + 86400000),
          location: "USP Campus",
          visibility: "CAMPUS",
          campusId: campusUsp._id.toHexString(), // USP ID!
          imageUrls: [],
          tags: ["workshop"],
          organizerIds: [],
          createForum: false,
        },
        ambUnifei._id,
      );
    } catch (err: any) {
      errorThrown = true;
      expect(err.message).toBe("Event management denied");
    }

    expect(errorThrown).toBe(true);
  });

  it("6. Resolução de campus inexistente (404 Campus not found)", async () => {
    let errorThrown = false;
    try {
      await listCampusEvents("campus-totalmente-inexistente-123", null);
    } catch (err: any) {
      errorThrown = true;
      expect(err.message).toBe("Campus not found");
    }
    expect(errorThrown).toBe(true);
  });
});
