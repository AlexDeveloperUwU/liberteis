import { Router } from "express";
import * as categories from "../../db/categoriesController.js";

const api = Router();
export default api;

// GET / - returns all categories or a specific category by id
api.get("/", async (req, res) => {
  const { id, name } = req.query;

  // If an id or a name is provided, return a specific category, else return all categories
  try {
    if (id || name) {
      const exists = id ? await categories.checkCategoryExistence(id) : await categories.getCategoryByName(name);
      if (exists) {
        const response = id ? await categories.getCategory(id) : await categories.getCategoryByName(name);
        return res.json({ code: 200, data: response });
      } else {
        return res.status(404).json({ code: 404, message: "Category not found" });
      }
    } else {
      const response = await categories.getCategories();
      return res.json({ code: 200, data: response });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// POST / - creates a new category
api.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "Category data is required" });
  }

  const { name, spaces } = req.body;

  if (!name || !spaces) {
    return res.status(400).json({ code: 400, message: "Name and spaces are required" });
  }

  try {
    const exists = await categories.getCategoryByName(name);

    if (exists && exists.length > 0) {
      return res.status(409).json({ code: 409, message: "Category already exists" });
    } else {
      const jsonSpaces = JSON.parse(spaces);
      const category = {
        name,
        spaces: jsonSpaces,
      };
      await categories.addCategory(category);
      return res.status(201).json({ code: 201, message: "Category created successfully" });
    }
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// PUT / - updates a category
api.put("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "Category data is required" });
  }

  const { id, name, spaces } = req.body;

  if (!id) {
    return res.status(400).json({ code: 400, message: "Category id is required" });
  }

  try {
    const exists = await categories.checkCategoryExistence(id);

    if (!exists) {
      return res.status(404).json({ code: 404, message: "Category not found" });
    } else {
      const category = await categories.getCategory(id);

      if (name) category.name = name;
      if (spaces) category.spaces = JSON.parse(spaces);

      await categories.updateCategory(id, category);
      return res.json({ code: 200, message: "Category updated successfully" });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// DELETE / - deletes a category
api.delete("/", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ code: 400, message: "Category id is required" });
  }

  try {
    const exists = await categories.checkCategoryExistence(id);

    if (!exists) {
      return res.status(404).json({ code: 404, message: "Category not found" });
    } else {
      await categories.deleteCategory(id);
      return res.json({ code: 200, message: "Category deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});
