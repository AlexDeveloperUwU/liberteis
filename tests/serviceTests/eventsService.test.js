/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as eventsSvc from "../../db/eventsService.js";
import * as userSvc from "../../db/userService.js";
import * as categoriesSvc from "../../db/categoriesService.js";
import { testsLogger } from "../../utils/logger.js";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const fileName = path.basename(__filename).replace(".test.js", "");

function logs(type, msg) {
  const formattedMsg = `[${fileName}] ${msg}`;
  switch (type) {
    case "info":
      testsLogger.info(formattedMsg);
      break;
    case "warn":
      testsLogger.warn(formattedMsg);
      break;
    case "error":
      testsLogger.error(formattedMsg);
      break;
    default:
      testsLogger.info(formattedMsg);
      break;
  }
}

let userId;
let categoryId;
let eventId;
let eventStatus;

beforeAll(async () => {
  await dbCreateTables();
  const checkUser = await userSvc.getUserByEmail("test@mail.com", true);
  if (checkUser && !checkUser.error) {
    userId = checkUser.id;
    await userSvc.enableUser(userId);
  } else {
    const user = {
      name: "John Doe",
      email: "test@mail.com",
      type: "normalUser",
      createdBy: "System",
    };
    await userSvc.addUser(user);
    const newUser = await userSvc.getUserByEmail("test@mail.com", true);
    userId = newUser.id;
  }

  const checkCategory = await categoriesSvc.getCategoryByName("Test Category Updated", true);
  if (checkCategory && !checkCategory.error) {
    categoryId = checkCategory.id;
  } else {
    const category = {
      name: "Test Category",
      createdBy: userId,
      spaces: [],
    };
    await categoriesSvc.addCategory(category);
    const newCategory = await categoriesSvc.getCategoryByName("Test Category", true);
    categoryId = newCategory.id;
  }

  const checkEvent = await eventsSvc.getEventByTitle("Test Event", true);
  if (checkEvent && !checkEvent.error) {
    eventId = checkEvent.id;
    eventStatus = await eventsSvc.checkEventStatus(eventId);
    if (!eventStatus) {
      await eventsSvc.enableEvent(eventId);
      eventStatus = true;
    }
  } else {
    const event = {
      title: "Test Event",
      info: "Test Info",
      duration: 60,
      coverUrl: "http://example.com/cover.jpg",
      qrUrl: "http://example.com/qr.jpg",
      category: categoryId,
      createdBy: userId,
    };
    await eventsSvc.addEvent(event);
    const newEvent = await eventsSvc.getEventByTitle("Test Event", true);
    eventId = newEvent.id;
    eventStatus = true;
  }
});

describe("Events Service Tests", () => {
  test("Insert a new event if it does not exist", async () => {
    if (!eventStatus) {
      const event = {
        title: "Test Event",
        info: "Test Info",
        duration: 60,
        coverUrl: "http://example.com/cover.jpg",
        qrUrl: "http://example.com/qr.jpg",
        category: categoryId,
        createdBy: userId,
      };
      await eventsSvc.addEvent(event);
      logs("info", "Event added");
    } else {
      logs("warn", "Event already exists");
    }
  });

  test("Enable an existing event if it is disabled", async () => {
    if (eventStatus) {
      await eventsSvc.enableEvent(eventId);
      logs("info", "Event enabled");
    } else {
      logs("warn", "Event is already enabled");
    }
  });

  test("Update an existing event", async () => {
    const event = {
      title: "Test Event Updated",
      info: "Test Info Updated",
      duration: 90,
      coverUrl: "http://example.com/cover_updated.jpg",
      qrUrl: "http://example.com/qr_updated.jpg",
      category: categoryId,
      createdBy: userId,
    };
    await eventsSvc.updateEvent(eventId, event);
    logs("info", "Event updated");

    const dbEvent = await eventsSvc.getEventByTitle("Test Event Updated", true);
    expect(dbEvent.title).toBe("Test Event Updated");
    expect(dbEvent.info).toBe("Test Info Updated");
    expect(dbEvent.duration).toBe(90);
  });

  test("Get an event by its title", async () => {
    const dbEvent = await eventsSvc.getEventByTitle("Test Event Updated", true);
    expect(dbEvent.title).toBe("Test Event Updated");
    expect(dbEvent.info).toBe("Test Info Updated");
    expect(dbEvent.duration).toBe(90);
  });

  test("Get all events", async () => {
    const events = await eventsSvc.getEvents("all");
    expect(events.length).toBeGreaterThan(0);
  });

  test("Get all active events", async () => {
    const events = await eventsSvc.getEvents("active");
    expect(events.length).toBeGreaterThan(0);
  });

  test("Disable an existing event", async () => {
    if (eventStatus) {
      await eventsSvc.disableEvent(eventId);
      logs("info", "Event disabled");
    } else {
      logs("warn", "Event is already disabled");
    }
  });

  test("Get all active events after disabling one", async () => {
    const events = await eventsSvc.getEvents("active");
    expect(events.error).toBe(true);
  });

  test("Get all disabled events", async () => {
    const events = await eventsSvc.getEvents("inactive");
    expect(events.length).toBeGreaterThan(0);
  });
});
