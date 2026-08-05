import { body } from "express-validator";

export const addInventoryValidation = [
  body("name").trim().notEmpty(),

  body("category").trim().notEmpty(),

  body("quantity").isInt({ min: 1 }),

  body("buyingPrice").isFloat({ min: 0 }),

  body("expiryDate").isISO8601(),
];

export const updateInventoryValidation = [
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1."),

  body("buyingPrice")
    .notEmpty()
    .withMessage("Buying price is required.")
    .isFloat({ min: 0 })
    .withMessage("Buying price must be a valid positive number."),

  body("manufactureDate")
    .notEmpty()
    .withMessage("Manufacture date is required.")
    .isISO8601()
    .withMessage("Invalid manufacture date."),

  body("expiryDate")
    .notEmpty()
    .withMessage("Expiry date is required.")
    .isISO8601()
    .withMessage("Invalid expiry date.")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.manufactureDate)) {
        throw new Error("Expiry date must be after manufacture date.");
      }
      return true;
    }),
];
