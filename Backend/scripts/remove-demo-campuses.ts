import { AppDataSource } from "../src/database/AppDataSource";
import { Campus } from "../src/database/models/campus.model";
import { CampusMember } from "../src/database/models/campus-member.model";
import { CommunityEvent } from "../src/database/models/event.model";

const demoCampuses = [
  ["unifei", "Universidade Federal de Itajubá", "Comunidade acadêmica e de inovação tecnológica da UNIFEI. Foco em engenharia, IA e ciência da computação."],
  ["usp", "Universidade de São Paulo", "Hub universitário de tecnologia e inteligência artificial dos estudantes e pesquisadores da USP."],
  ["unifesp", "Universidade Federal de São Paulo", "Comunidade de inovação multidisciplinar da UNIFESP, integrando tecnologia, saúde e ciências exatas."],
  ["unicamp", "Universidade Estadual de Campinas", "Hub acadêmico e tecnológico dos estudantes da UNICAMP para desenvolvimento em IA e computação."],
  ["ufmg", "Universidade Federal de Minas Gerais", "Comunidade universitária da UFMG voltada para inovação, liderança e engenharia de software."],
  ["ufrj", "Universidade Federal do Rio de Janeiro", "Polo de tecnologia e projetos acadêmicos da comunidade universitária da UFRJ."],
] as const;

const execute = process.argv.includes("--execute");

await AppDataSource.initialize();

try {
  const campusRepository = AppDataSource.getMongoRepository(Campus);
  const memberRepository = AppDataSource.getMongoRepository(CampusMember);
  const eventRepository = AppDataSource.getMongoRepository(CommunityEvent);

  for (const [slug, name, description] of demoCampuses) {
    const campus = await campusRepository.findOneBy({ slug });
    if (!campus) continue;

    const isExactDemo = campus.name === name && campus.description === description;
    const [members, events] = await Promise.all([
      memberRepository.countBy({ campusId: campus._id }),
      eventRepository.countBy({ campusId: campus._id }),
    ]);

    if (!isExactDemo || members > 0 || events > 0) {
      console.log(`PRESERVADO ${slug}: corresponde a dados reais ou possui vínculos (${members} membros, ${events} eventos).`);
      continue;
    }

    if (execute) {
      await campusRepository.deleteOne({ _id: campus._id });
      console.log(`REMOVIDO ${slug}: campus de demonstração sem vínculos.`);
    } else {
      console.log(`REMOVERIA ${slug}: campus de demonstração sem vínculos.`);
    }
  }
} finally {
  await AppDataSource.destroy();
}

if (!execute) {
  console.log("Simulação concluída. Execute novamente com --execute para aplicar a limpeza.");
}
