import { Router } from "express";
import * as spaces from "../../db/spacesController.js";

const api = Router();
export default api;

// GET / - returns all spaces or a specific space by id
api.get("/", async (req, res) => {
  const { id, name } = req.query;

  // If an id or a name is provided, return a specific space, else return all spaces
  try {
    if (id || name) {
      const exists = id ? await spaces.checkSpaceExistence(id) : await spaces.getSpaceByName(name);
      if (exists) {
        const response = id ? await spaces.getSpace(id) : await spaces.getSpaceByName(name);
        return res.json({ code: 200, data: response });
      } else {
        return res.status(404).json({ code: 404, message: "Space not found" });
      }
    } else {
      const response = await spaces.getSpaces();
      return res.json({ code: 200, data: response });
    }
  } catch (error) {
    console.error("Error fetching space:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// POST / - creates a new space
api.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "Space data is required" });
  }

  const { name, location, info } = req.body;

  if (!name || !location || !info) {
    return res.status(400).json({ code: 400, message: "Name, location and info are required" });
  }

  try {
    const exists = await spaces.getSpaceByName(name);

    if (exists && exists.length > 0) {
      return res.status(409).json({ code: 409, message: "Space already exists" });
    } else {
      const space = {
        name,
        location,
        info,
      };
      await spaces.addSpace(space);
      return res.status(201).json({ code: 201, message: "Space created sucessfully" });
    }
  } catch (error) {
    console.error("Error creating space:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// PUT / - updates a space
api.put("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ code: 400, message: "Space data is required" });
  }

  const { id, name, location, info } = req.body;

  if (!id) {
    return res.status(400).json({ code: 400, message: "Space id is required" });
  }

  try {
    const exists = await spaces.checkSpaceExistence(id);

    if (!exists) {
      return res.status(404).json({ code: 404, message: "Space not found" });
    } else {
      let space = await spaces.getSpace(id);
      space = space[0];

      if (name) space.name = name;
      if (location) space.location = location;
      if (info) space.info = info;

      await spaces.updateSpace(id, space);
      return res.json({ code: 200, message: "Space updated sucessfully" });
    }
  } catch (error) {
    console.error("Error updating space:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});

// DELETE / - deletes a space given an id
api.delete("/", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ code: 400, message: "Space id is required" });
  }

  try {
    const exists = await spaces.checkSpaceExistence(id);

    if (!exists) {
      return res.status(404).json({ code: 404, message: "Space not found" });
    } else {
      await spaces.deleteSpace(id);
      return res.json({ code: 200, message: "Space deleted sucessfully" });
    }
  } catch (error) {
    console.error("Error deleting space:", error);
    return res.status(500).json({ code: 500, error: error.message || error });
  }
});
