import { Router } from "express";
import * as events from "../../db/eventsService.js";

const api = Router();
export default api;

//! Basic CRUD operations

// POST /api/events
// Receives an object with the event data to add
// Uses the addEvent function from eventsService
api.post("/", async (req, res) => {});

// PUT /api/events/:id
// Receives an event id and an object with the data to modify
// Uses the updateEvent function from eventsService
api.put("/:id", async (req, res) => {});

// PUT /api/events/:id/statusSwitch
// Receives an event id
// Uses the changeEventStatus function from eventsService
api.patch("/:id/statusSwitch", async (req, res) => {});

// PATCH /api/events/:id/enable
// Receives an event id
// Uses the enableEvent function from eventsService
api.patch("/:id/enable", async (req, res) => {});

// PATCH /api/events/:id/disable
// Receives an event id
// Uses the disableEvent function from eventsService
api.patch("/:id/disable", async (req, res) => {});

//! Info retrieval operations

// GET /api/events/:id
// Receives an event id and optionally a boolean query includeInactive
// Uses the getEvent function from eventsService
api.get("/:id", async (req, res) => {});

// GET /api/events/:name
// Receives an event name and optionally a boolean query includeInactive
// Uses the getEventByName function from eventsService
api.get("/:name", async (req, res) => {});

// GET /api/events
// Optionally receives a query string status
// The status query can be: all, active (DEFAULT) or inactive
// Uses the getEvents function from eventsService
api.get("/", async (req, res) => {});

// GET /api/events/:id/status
// Receives an event id
// Uses the checkEventStatus function from eventsService
api.get("/:id/status", async (req, res) => {});

// GET /api/events/:name/exists
// Receives an event name
// Uses the checkEventExists function from eventsService
api.get("/:name/exists", async (req, res) => {});
