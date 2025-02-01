import { Router } from "express";
import * as categories from "../../db/categoriesService.js";

const api = Router();
export default api;

//! Basic CRUD operations

// POST /api/categories
// Receives an object with the category data to add
// Uses the addCategory function from categoriesService
api.post("/", async (req, res) => {});

// PUT /api/categories/:id
// Receives a category id and an object with the data to modify
// Uses the updateCategory function from categoriesService
api.put("/:id", async (req, res) => {});

// PUT /api/categories/:id/statusSwitch
// Receives a category id
// Uses the changeCategoryStatus function from categoriesService
api.patch("/:id/statusSwitch", async (req, res) => {});

// PATCH /api/categories/:id/enable
// Receives a category id
// Uses the enableCategory function from categoriesService
api.patch("/:id/enable", async (req, res) => {});

// PATCH /api/categories/:id/disable
// Receives a category id
// Uses the disableCategory function from categoriesService
api.patch("/:id/disable", async (req, res) => {});

//! Info retrieval operations

// GET /api/categories/:id
// Receives a category id and optionally a boolean query includeInactive
// Uses the getCategory function from categoriesService
api.get("/:id", async (req, res) => {});

// GET /api/categories/:name
// Receives a category name and optionally a boolean query includeInactive
// Uses the getCategoryByName function from categoriesService
api.get("/:name", async (req, res) => {});

// GET /api/categories
// Optionally receives a query string status
// The status query can be: all, active (DEFAULT) or inactive
// Uses the getCategories function from categoriesService
api.get("/", async (req, res) => {});

// GET /api/categories/:id/status
// Receives a category id
// Uses the checkCategoryStatus function from categoriesService
api.get("/:id/status", async (req, res) => {});

// GET /api/categories/:name/exists
// Receives a category name
// Uses the checkCategoryExists function from categoriesService
api.get("/:name/exists", async (req, res) => {});
