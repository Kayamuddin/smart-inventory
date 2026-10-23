import { body } from "express-validator";

export const createProductValidation = [
  body("name").trim().notEmpty(),

  body("category").trim().notEmpty(),
];

export const updateProductValidation = [
  body("name").trim().notEmpty(),

  body("category").trim().notEmpty(),
];
