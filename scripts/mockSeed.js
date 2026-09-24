/**
 * Seeds a disposable "mock" MySQL database with sample data for manual
 * testing/demos: a manager user, a normal user, spaces, categories, events
 * and bookings. Never touches the real database.
 *
 * Must be run with DOTENV_CONFIG_PATH pointing at an env file whose
 * MYSQL_DATABASE is the mock schema (see init.sh's `run_dev_mock`), so
 * db/dbController.js connects to it instead of the real one.
 */
import mysql from "mysql2/promise";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.resolve();

const MOCK_DB_NAME = "liberteis-mock-db";

const mockEnvPath = process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, "./data/secrets/mockdbcreds.env");
const mockEnv = dotenv.config({ path: mockEnvPath }).parsed;

if (!mockEnv || mockEnv.MYSQL_DATABASE !== MOCK_DB_NAME) {
  console.error(
    `Refusing to run: expected DOTENV_CONFIG_PATH (${mockEnvPath}) to set MYSQL_DATABASE=${MOCK_DB_NAME}, ` +
      `got ${mockEnv && mockEnv.MYSQL_DATABASE}. This safety check exists so the mock seeder can never run ` +
      `against the real database.`,
  );
  process.exit(1);
}

async function recreateMockDatabase() {
  const rootConnection = await mysql.createConnection({
    host: mockEnv.MYSQL_HOST,
    user: "root",
    password: mockEnv.MYSQL_ROOT_PASSWORD,
  });

  try {
    await rootConnection.query(`DROP DATABASE IF EXISTS \`${MOCK_DB_NAME}\``);
    await rootConnection.query(`CREATE DATABASE \`${MOCK_DB_NAME}\``);
    await rootConnection.query(
      `GRANT ALL PRIVILEGES ON \`${MOCK_DB_NAME}\`.* TO '${mockEnv.MYSQL_USER}'@'%'; FLUSH PRIVILEGES;`,
    );
    console.log(`Recreated database \`${MOCK_DB_NAME}\`.`);
  } finally {
    await rootConnection.end();
  }
}

function isoInDays(days, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

async function seed() {
  const dbc = await import("../db/dbController.js");
  const userService = await import("../db/userService.js");
  const spacesService = await import("../db/spacesService.js");
  const categoriesService = await import("../db/categoriesService.js");
  const eventsService = await import("../db/eventsService.js");
  const bookingsService = await import("../db/bookingsService.js");

  await dbc.dbCreateTables();
  console.log("Tables created.");

  const managerUser = {
    name: "Mock Manager",
    email: "manager@mock.local",
    password: "MockPass123!",
    type: "managerUser",
    createdBy: "System",
  };
  const normalUser = {
    name: "Mock User",
    email: "user@mock.local",
    password: "MockPass123!",
    type: "normalUser",
    createdBy: "System",
  };
  const adminUser = {
    name: "Mock Admin",
    email: "admin@mock.local",
    password: "MockPass123!",
    type: "adminUser",
    createdBy: "System",
  };

  const managerResult = await userService.addUser(managerUser);
  if (!managerResult.success) throw new Error(`Failed to create manager user: ${managerResult.message}`);
  const normalResult = await userService.addUser(normalUser);
  if (!normalResult.success) throw new Error(`Failed to create normal user: ${normalResult.message}`);
  const adminResult = await userService.addUser(adminUser);
  if (!adminResult.success) throw new Error(`Failed to create admin user: ${adminResult.message}`);
  console.log("Users created:", managerUser.id, normalUser.id, adminUser.id);

  const spaces = [
    { name: "Mock Library Hall", location: "Ground floor", info: "Main hall", createdBy: managerUser.id },
    { name: "Mock Study Room A", location: "1st floor", info: "Quiet study room", createdBy: managerUser.id },
    { name: "Mock Auditorium", location: "2nd floor", info: "Large auditorium", createdBy: managerUser.id },
  ];
  for (const space of spaces) {
    const result = await spacesService.addSpace(space);
    if (!result.success) throw new Error(`Failed to create space "${space.name}": ${result.message}`);
  }
  console.log(
    "Spaces created:",
    spaces.map((s) => s.id),
  );

  const categories = [
    { name: "Mock Workshops", spaces: JSON.stringify([spaces[0].id, spaces[1].id]), createdBy: managerUser.id },
    { name: "Mock Talks", spaces: JSON.stringify([spaces[0].id, spaces[2].id]), createdBy: managerUser.id },
    { name: "Mock Study Sessions", spaces: JSON.stringify([spaces[1].id]), createdBy: managerUser.id },
  ];
  for (const category of categories) {
    const result = await categoriesService.addCategory(category);
    if (!result.success) throw new Error(`Failed to create category "${category.name}": ${result.message}`);
  }
  console.log(
    "Categories created:",
    categories.map((c) => c.id),
  );

  const events = [
    {
      title: "Mock Reading Workshop",
      info: "A sample workshop event",
      duration: 60,
      category: categories[0].id,
      createdBy: managerUser.id,
    },
    {
      title: "Mock Author Talk",
      info: "A sample talk event",
      duration: 45,
      category: categories[1].id,
      createdBy: managerUser.id,
    },
    {
      title: "Mock Study Session",
      info: "A sample study session event",
      duration: 30,
      category: categories[2].id,
      createdBy: managerUser.id,
    },
  ];
  for (const event of events) {
    const result = await eventsService.addEvent(event);
    if (!result.success) throw new Error(`Failed to create event "${event.title}": ${result.message}`);
  }
  console.log(
    "Events created:",
    events.map((e) => e.id),
  );

  const bookings = [
    { eventId: events[0].id, space: spaces[0].id, bookingDate: isoInDays(1, 10), bookedBy: normalUser.id },
    { eventId: events[1].id, space: spaces[2].id, bookingDate: isoInDays(2, 11), bookedBy: normalUser.id },
    { eventId: events[2].id, space: spaces[1].id, bookingDate: isoInDays(3, 12), bookedBy: managerUser.id },
  ];
  for (const booking of bookings) {
    const result = await bookingsService.addBooking(booking);
    if (!result.success) throw new Error(`Failed to create booking for event "${booking.eventId}": ${result.message}`);
  }
  console.log("Bookings created.");

  console.log("\nMock database seeded successfully.");
  console.log("Manager login: manager@mock.local / MockPass123!");
  console.log("Normal user login: user@mock.local / MockPass123!");
  console.log("Admin login: admin@mock.local / MockPass123!");
}

try {
  await recreateMockDatabase();
  await seed();
  process.exit(0);
} catch (error) {
  console.error("Mock seeding failed:", error.message);
  process.exit(1);
}
