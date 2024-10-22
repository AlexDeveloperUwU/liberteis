const db = require("../functions/dbController");
const idGen = require("../functions/idGen");

describe("Database Functions", () => {
  let userId;
  let spaceId;
  let categoryId;
  let eventId;
  let bookingId;
  let configKey = "testConfig";

  // Antes de todas las pruebas, creamos las tablas y añadimos datos básicos (usuario, espacio, categoría)
  beforeAll(async () => {
    await db.createTables();

    // Creamos un usuario
    userId = await idGen.generateUniqueId("user");
    const user = {
      id: userId,
      email: "testuser@example.com",
      hashedPassword: "hashed_password",
      type: "adminUser",
      createdBy: null,
      createdDate: new Date(),
      lastLogin: new Date(),
      lang: "es",
    };
    await db.addUser(user);

    // Creamos un espacio
    spaceId = await idGen.generateUniqueId("space");
    const space = {
      id: spaceId,
      name: "Test Space",
      location: "123 Main St",
      info: "Test Info",
    };
    await db.addSpace(space);

    // Creamos una categoría
    categoryId = await idGen.generateUniqueId("category");
    const category = {
      id: categoryId,
      title: "Test Category",
      spaces: JSON.stringify([spaceId]), // Asignamos el espacio creado a esta categoría
    };
    await db.addCategory(category);
  });

  it("should check existence of a user", async () => {
    const exists = await db.checkExistence("users", userId);
    expect(exists).toBe(true);
  });

  it("should add and retrieve a user", async () => {
    const result = await db.getUser(userId);
    expect(result[0].email).toBe("testuser@example.com");
  });

  it("should retrieve all users", async () => {
    const users = await db.getUsers();
    expect(users.length).toBeGreaterThan(0);
  });

  it("should update a user's info", async () => {
    const fieldName = "lang";
    const newValue = "en";
    await db.updateUser(userId, fieldName, newValue);

    const updatedUser = await db.getUser(userId);
    expect(updatedUser[0].lang).toBe("en");
  });

  it("should update user last login", async () => {
    const fieldName = "lastLogin";
    const lastLogin = new Date();
    await db.updateUser(userId, fieldName, lastLogin);

    const updatedUser = await db.getUser(userId);
    expect(new Date(updatedUser[0].lastLogin)).toEqual(lastLogin);
  });

  it("should add and retrieve a space", async () => {
    const result = await db.getSpace(spaceId);
    expect(result[0].name).toBe("Test Space");
  });

  it("should retrieve all spaces", async () => {
    const spaces = await db.getSpaces();
    expect(spaces.length).toBeGreaterThan(0);
  });

  it("should update a space's info", async () => {
    const fieldName = "name";
    const newValue = "Updated Space";

    await db.updateSpace(spaceId, fieldName, newValue);
    const updatedSpace = await db.getSpace(spaceId);
    expect(updatedSpace[0].name).toBe("Updated Space");
  });

  it("should add and retrieve a category", async () => {
    const result = await db.getCategory(categoryId);
    expect(result[0].title).toBe("Test Category");
  });

  it("should retrieve all categories", async () => {
    const categories = await db.getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  it("should update a category's info", async () => {
    const fieldName = "title";
    const newValue = "Updated Category";

    await db.updateCategory(categoryId, fieldName, newValue);
    const updatedCategory = await db.getCategory(categoryId);
    expect(updatedCategory[0].title).toBe("Updated Category");
  });

  it("should add and retrieve an event", async () => {
    eventId = await idGen.generateUniqueId("event");
    const event = {
      id: eventId,
      title: "Test Event",
      info: "Test Event Info",
      duration: 60,
      thumbUrl: "http://testimage.com/thumb.png",
      qrUrl: "http://testimage.com/qr.png",
      category: categoryId,
      creator: userId,
    };
    await db.addEvent(event);
    const result = await db.getEvent(eventId);
    expect(result[0].title).toBe("Test Event");
  });

  it("should retrieve all events", async () => {
    const events = await db.getEvents();
    expect(events.length).toBeGreaterThan(0);
  });

  it("should update an event's info", async () => {
    const fieldName = "title";
    const newValue = "Updated Event Title";

    await db.updateEvent(eventId, fieldName, newValue);
    const updatedEvent = await db.getEvent(eventId);
    expect(updatedEvent[0].title).toBe(newValue);
  });

  it("should add and retrieve a booking", async () => {
    bookingId = await idGen.generateUniqueId("booking");
    const booking = {
      id: bookingId,
      eventId: eventId,
      space: spaceId,
      bookingDate: new Date(),
      bookedBy: userId,
      bookedDate: new Date(),
      info: "Booking for test event",
      status: "active",
    };
    await db.addBooking(booking);
    const result = await db.getBooking(bookingId);
    expect(result[0].status).toBe("active");
  });

  it("should retrieve all bookings", async () => {
    const bookings = await db.getBookings();
    expect(bookings.length).toBeGreaterThan(0);
  });

  it("should update a booking's bookingDate", async () => {
    const fieldName = "bookingDate";
    const newValue = "2024-10-07T12:00:00.000Z";

    await db.updateBooking(bookingId, fieldName, newValue);
    const updatedBooking = await db.getBooking(bookingId);
    expect(updatedBooking[0].bookingDate).toBe(newValue);
  });

  it("should update booking status", async () => {
    await db.updateBookingStatus(bookingId, "cancelled");
    const updatedBooking = await db.getBooking(bookingId);
    expect(updatedBooking[0].status).toBe("cancelled");
  });

  it("should add, retrieve and update config", async () => {
    const configKey = "testConfig";
    await db.setConfig(configKey, "testValue");

    const configArray = await db.getConfig(configKey);
    const config = configArray[0];
    expect(config.value).toBe("testValue");

    await db.updateConfig(configKey, "updatedValue");

    const updatedConfigArray = await db.getConfig(configKey);
    const updatedConfig = updatedConfigArray[0];
    expect(updatedConfig.value).toBe("updatedValue");

    // Recuperar todas las configuraciones
    const allConfig = await db.getAllConfig();
    expect(allConfig.length).toBeGreaterThan(0);
  });

  // Eliminar datos y pruebas de eliminaciones
  it("should delete a booking", async () => {
    await db.deleteBooking(bookingId);
    const result = await db.getBooking(bookingId);
    expect(result).toEqual([]);
  });

  it("should delete an event", async () => {
    await db.deleteEvent(eventId);
    const result = await db.getEvent(eventId);
    expect(result).toEqual([]);
  });

  it("should delete a category", async () => {
    await db.deleteCategory(categoryId);
    const result = await db.getCategory(categoryId);
    expect(result).toEqual([]);
  });

  it("should delete a space", async () => {
    await db.deleteSpace(spaceId);
    const result = await db.getSpace(spaceId);
    expect(result).toEqual([]);
  });

  it("should delete a user", async () => {
    await db.deleteUser(userId);
    const result = await db.getUser(userId);
    expect(result).toEqual([]);
  });

  it("should delete config", async () => {
    await db.deleteConfig(configKey);
    const result = await db.getConfig(configKey);
    expect(result).toEqual([]);
  });
});
