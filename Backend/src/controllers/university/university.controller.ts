import { Router, type Request, type Response, type NextFunction } from "express";
import { searchUniversities } from "../../services/university.services";

const universityController = Router();

universityController.get("/search", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const query = typeof request.query.q === "string" ? request.query.q : "";
    const universities = await searchUniversities(query);
    return response.json({ universities: universities.map((university) => ({ id: university._id.toHexString(), name: university.name })) });
  } catch (error) {
    return next(error);
  }
});

export default universityController;
