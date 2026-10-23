import { body, param } from "express-validator";

export const createRequestProductValidation = [
  body("productName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),

  body("productId").isMongoId().withMessage("Product Id is not Valid."),

  body("holderId").isMongoId().withMessage("Holder Id is not Valid."),

  body("quantity").isInt({ min: 1 }).withMessage("Quantity is required."),
];

export const addProductToPackagingValidation = [
  param("id").isMongoId().withMessage("Request Id is not Valid."),
];

export const deleteRequestProductValidation = [
  param("id").isMongoId().withMessage("Request Id is not Valid."),
];

export const transferPackedProductValidation = [
  body("status")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Request Status is not vaild"),

  body("from._id").isMongoId().withMessage("Invalid supplier Id"),
  body("to._id").isMongoId().withMessage("Invalid supplier Id"),
  param("id").isMongoId().withMessage("Invalid request Id"),
];

export const approveRequestProductValidation = [
  body("status")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Request Status is not vaild"),

  body("to._id").isMongoId().withMessage("Supplier Id is not Valid."),
  param("id").isMongoId().withMessage("Request Id is not Valid."),
];

export const updateRequestProductValidation = [
  body("productId").isMongoId().withMessage("Product Id is not Valid."),

  body("quantity").isInt({ min: 1 }).withMessage("Quantity is required."),
];
