/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

import { dbCreateTables } from "../../db/dbController.js";
import * as bookingsSvc from "../../db/bookingsService.js";
import * as userSvc from "../../db/userService.js";
import * as eventsSvc from "../../db/eventsService.js";
import * as categoriesSvc from "../../db/categoriesService.js";
import * as spacesSvc from "../../db/spacesService.js";
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
let eventId;
let bookingId;
let bookingDisabled;
let categoryId;
let spaceId;
const bookingDate = new Date(2025, 2, 19, 10, 0, 0);

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

  const checkSpace = await spacesSvc.getSpaceByName("Test Space", true);
  if (checkSpace && !checkSpace.error) {
    spaceId = checkSpace.id;
  } else {
    const space = {
      name: "Test Space",
      location: "Test Location",
      info: "Test Info",
      createdBy: userId,
    };
    await spacesSvc.addSpace(space);
    const newSpace = await spacesSvc.getSpaceByName("Test Space", true);
    spaceId = newSpace.id;
  }

  const checkEvent = await eventsSvc.getEventByTitle("Test Event", true);
  if (checkEvent && !checkEvent.error) {
    eventId = checkEvent.id;
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
  }

  const checkBooking = await bookingsSvc.getBookingByEventAndDate(eventId, bookingDate, true);
  if (checkBooking && !checkBooking.error) {
    bookingId = checkBooking.id;
    bookingDisabled = checkBooking.deleted;
    await bookingsSvc.disableBooking(bookingId);
  } else {
    bookingDisabled = false;
  }
});

describe("Bookings Service Tests", () => {
  test("Insert a new booking if it does not exist", async () => {
    if (!bookingDisabled) {
      const booking = {
        eventId: eventId,
        space: spaceId,
        bookingDate: bookingDate,
        bookedBy: userId,
        info: "Test Booking Info",
      };
      await bookingsSvc.addBooking(booking);
      const newBooking = await bookingsSvc.getBookingByEventAndDate(eventId, bookingDate, true);
      bookingId = newBooking.id;
      logs("info", "Booking added");
    } else {
      logs("warn", "Booking already exists");
    }
  });

  test("Enable an existing booking if it is disabled", async () => {
    if (bookingDisabled) {
      await bookingsSvc.enableBooking(bookingId);
      logs("info", "Booking enabled");
    } else {
      logs("warn", "Booking is already enabled");
    }
  });

  test("Update an existing booking", async () => {
    const booking = {
      info: "Test Booking Info Updated",
    };
    await bookingsSvc.updateBooking(bookingId, booking);
    logs("info", "Booking updated");

    const dbBooking = await bookingsSvc.getBookingByEventAndDate(eventId, bookingDate, true);
    expect(dbBooking.info).toBe("Test Booking Info Updated");
  });

  test("Get a booking by its event ID and date", async () => {
    const dbBooking = await bookingsSvc.getBookingByEventAndDate(eventId, bookingDate, true);
    expect(dbBooking.eventId).toBe(eventId);
    expect(dbBooking.info).toBe("Test Booking Info Updated");
  });

  test("Get all bookings", async () => {
    const bookings = await bookingsSvc.getBookings("all");
    expect(bookings.length).toBeGreaterThan(0);
  });

  test("Get all active bookings", async () => {
    const bookings = await bookingsSvc.getBookings("active");
    expect(bookings.length).toBeGreaterThan(0);
  });

  test("Disable an existing booking", async () => {
    if (!bookingDisabled) {
      await bookingsSvc.disableBooking(bookingId);
      logs("info", "Booking disabled");
    } else {
      logs("warn", "Booking is already disabled");
    }
  });

  test("Get all active bookings after disabling one", async () => {
    const bookings = await bookingsSvc.getBookings("active");
    if (bookings === null || bookings.error === true) {
      expect(bookings.error).toBe(true);
    } else {
      const bookingIds = bookings.map((booking) => booking.id);
      expect(bookingIds).not.toContain(bookingId);
    }
  });

  test("Get all disabled bookings", async () => {
    const bookings = await bookingsSvc.getBookings("inactive");
    expect(bookings.length).toBeGreaterThan(0);
  });
});
