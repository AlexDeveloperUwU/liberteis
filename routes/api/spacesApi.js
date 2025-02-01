import { Router } from "express";
import * as spaces from "../../db/spacesService.js";

const api = Router();
export default api;

//! Basic CRUD operations

// POST /api/spaces
// Receives an object with the space data to add
// Uses the addSpace function from spacesService
api.post("/", async (req, res) => {});

// PUT /api/spaces/:id
// Receives a space id and an object with the data to modify
// Uses the updateSpace function from spacesService
api.put("/:id", async (req, res) => {});

// PUT /api/spaces/:id/statusSwitch
// Receives a space id
// Uses the changeSpaceStatus function from spacesService
api.patch("/:id/statusSwitch", async (req, res) => {});

// PATCH /api/spaces/:id/enable
// Receives a space id
// Uses the enableSpace function from spacesService
api.patch("/:id/enable", async (req, res) => {});

// PATCH /api/spaces/:id/disable
// Receives a space id
// Uses the disableSpace function from spacesService
api.patch("/:id/disable", async (req, res) => {});

//! Info retrieval operations

// GET /api/spaces/:id
// Receives a space id and optionally a boolean query includeInactive
// Uses the getSpace function from spacesService
api.get("/:id", async (req, res) => {});

// GET /api/spaces/:name
// Receives a space name and optionally a boolean query includeInactive
// Uses the getSpaceByName function from spacesService
api.get("/:name", async (req, res) => {});

// GET /api/spaces
// Optionally receives a query string status
// The status query can be: all, active (DEFAULT) or inactive
// Uses the getSpaces function from spacesService
api.get("/", async (req, res) => {});

// GET /api/spaces/:id/status
// Receives a space id
// Uses the checkSpaceStatus function from spacesService
api.get("/:id/status", async (req, res) => {});

// GET /api/spaces/:name/exists
// Receives a space name
// Uses the checkSpaceExists function from spacesService
api.get("/:name/exists", async (req, res) => {});
