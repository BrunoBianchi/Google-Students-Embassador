import { ObjectId } from "mongodb";
import { AppDataSource } from "../database/AppDataSource";
import { University } from "../database/models/university.model";
import { normalizeUniversityName } from "../database/schemas/university.schema";

const universityRepository = () => AppDataSource.getMongoRepository(University);
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const ensureUniversityIndex = async () => {
  await universityRepository().createCollectionIndex({ name: 1 }, { unique: true, name: "university_name_unique" });
};

export const searchUniversities = async (query: string): Promise<University[]> => {
  const normalizedQuery = normalizeUniversityName(query);
  if (normalizedQuery.length < 2) return [];

  return universityRepository().find({
    where: { name: { $regex: escapeRegex(normalizedQuery) } } as never,
    take: 8,
    order: { name: "ASC" },
  });
};

export const findUniversityById = async (id: string): Promise<University | null> => {
  if (!ObjectId.isValid(id)) return null;
  return universityRepository().findOneBy({ _id: new ObjectId(id) });
};

export const createOrFindUniversity = async (name: string): Promise<University> => {
  const normalizedName = normalizeUniversityName(name);
  const existing = await universityRepository().findOneBy({ name: normalizedName });
  if (existing) return existing;

  try {
    return await universityRepository().save(universityRepository().create({ name: normalizedName }));
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const concurrentUniversity = await universityRepository().findOneBy({ name: normalizedName });
      if (concurrentUniversity) return concurrentUniversity;
    }
    throw error;
  }
};
