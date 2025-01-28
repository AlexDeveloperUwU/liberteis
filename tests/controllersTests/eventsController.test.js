/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as events from "../../db/eventsController.js";
import * as categories from "../../db/categoriesController.js";
import * as users from "../../db/usersController.js";

let userId = null;
let categoryId = null;

beforeAll(async () => {
  await dbCreateTables();

  let result = await users.getUserByEmail("test@test.com");
  if (result.length === 0) {
    const user = { name: "Test user", email: "test@test.com", createdBy: "System", type: "normalUser" };
    await users.addUser(user);
    result = await users.getUserByEmail("test@test.com");
  }
  expect(result).toBeDefined();
  userId = result[0].id;

  let result2 = await categories.getCategoryByName("testCategory");
  if (result2.length === 0) {
    const category = { name: "testCategory", spaces: JSON.stringify([]), createdBy: userId };
    await categories.addCategory(category);
    result2 = await categories.getCategoryByName("testCategory");
  }
  expect(result2).toBeDefined();
  categoryId = result2[0].id;

  const event = await events.getEventByTitle("testEvent");
  if (event !== undefined && event.length > 0) {
    await events.deleteEvent(event[0].id);
  }
});

describe("Events Controller Tests", () => {
  let eventId = null;

  test("addEvent should insert a new event", async () => {
    const event = {
      title: "testEvent",
      info: "Info sobre el evento",
      duration: 30,
      coverUrl: "https://www.google.com/image.png",
      qrUrl: "https://www.google.com/qr.png",
      category: categoryId,
      createdBy: userId,
    };
    await events.addEvent(event);
    const result = await events.getEventByTitle("testEvent");
    expect(result).toBeDefined();
    eventId = result[0].id;
  });

  test("getEvent should return an event", async () => {
    const result = await events.getEvent(eventId);
    expect(result).toBeDefined();
    expect(result[0].title).toBe("testEvent");
    expect(result[0].info).toBe("Info sobre el evento");
    expect(result[0].duration).toBe(30);
    expect(result[0].coverUrl).toBe("https://www.google.com/image.png");
    expect(result[0].qrUrl).toBe("https://www.google.com/qr.png");
    expect(result[0].category).toBe(categoryId);
  });

  test("getEvents should return a list of events", async () => {
    const result = await events.getEvents();
    expect(result).toBeDefined();
  });

  test("getEventByTitle should return an event", async () => {
    const result = await events.getEventByTitle("testEvent");
    expect(result).toBeDefined();
    expect(result[0].title).toBe("testEvent");
    expect(result[0].info).toBe("Info sobre el evento");
    expect(result[0].duration).toBe(30);
    expect(result[0].coverUrl).toBe("https://www.google.com/image.png");
    expect(result[0].qrUrl).toBe("https://www.google.com/qr.png");
    expect(result[0].category).toBe(categoryId);
  });

  test("updateEvent should update an event", async () => {
    const event = {
      title: "testEvent updated",
      info: "Updated info",
      duration: 60,
      coverUrl: "https://www.google.com/image2.png",
      qrUrl: "https://www.google.com/qr2.png",
      category: categoryId,
    };
    await events.updateEvent(eventId, event);
    const result = await events.getEvent(eventId);
    expect(result).toBeDefined();
    expect(result[0].title).toBe("testEvent updated");
    expect(result[0].info).toBe("Updated info");
    expect(result[0].duration).toBe(60);
    expect(result[0].coverUrl).toBe("https://www.google.com/image2.png");
    expect(result[0].qrUrl).toBe("https://www.google.com/qr2.png");
    expect(result[0].category).toBe(categoryId);
  });

  test("deleteEvent should remove an event", async () => {
    await events.deleteEvent(eventId);
  });
});
