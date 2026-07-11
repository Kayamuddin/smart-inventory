import { body } from "express-validator";

export const addInventoryValidation = [
  body("name").trim().notEmpty(),

  body("category").trim().notEmpty(),

  body("quantity").isInt({ min: 1 }),

  body("buyingPrice").isFloat({ min: 0 }),

  body("expiryDate").isISO8601(),
];

export const updateInventoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .isLength({ max: 50 })
    .withMessage("Category must not exceed 50 characters."),
];
