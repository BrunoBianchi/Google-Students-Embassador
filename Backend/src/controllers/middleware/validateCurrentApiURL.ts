import type { NextFunction, Request, Response } from "express";

const allowedCompanies = ["google", "aws", "microsoft"] as const;

export const validateCurrentApiURL = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const year = Number(req.params.year);
  const company = String(req.params.company ?? "").toLowerCase();
  const currentYear = new Date().getFullYear();

  if (Number.isNaN(year)) {
    return res.status(400).json({ error: "Invalid year parameter" });
  }

  if (!allowedCompanies.includes(company as (typeof allowedCompanies)[number])) {
    return res.status(400).json({
      error: "Invalid company parameter. Allowed values: google, aws, microsoft",
    });
  }

  if (year > currentYear) {
    return res.redirect(`/api/${currentYear}/${company}/`);
  }

  return next();
};