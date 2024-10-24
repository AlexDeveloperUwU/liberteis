const { Kysely, SqliteDialect, sql } = require("kysely");
const Database = require("better-sqlite3");

const db = new Kysely({
  dialect: new SqliteDialect({
    database: new Database("./data/liberteis.db"),
  }),
});

async function createTables() {
  await db.schema
    .createTable("events")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("info", "varchar", (col) => col.notNull())
    .addColumn("duration", "integer", (col) => col.defaultTo(30).notNull())
    .addColumn("thumbUrl", "varchar")
    .addColumn("qrUrl", "varchar")
    .addColumn("category", "varchar", (col) => col.references("categories.id"))
    .addColumn("creator", "varchar", (col) => col.references("users.id"))
    .execute();

  await db.schema
    .createTable("bookings")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("eventId", "varchar", (col) => col.references("events.id"))
    .addColumn("space", "varchar", (col) => col.references("spaces.id"))
    .addColumn("bookingDate", "date", (col) => col.notNull())
    .addColumn("bookedBy", "varchar", (col) => col.references("users.id"))
    .addColumn("bookedDate", "date", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("info", "varchar")
    .addColumn("status", "varchar", (col) => col.defaultTo("active").check(sql`status IN ('active', 'cancelled')`))
    .execute();

  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("email", "varchar", (col) => col.unique().notNull())
    .addColumn("hashedPassword", "varchar", (col) => col.notNull())
    .addColumn("type", "varchar", (col) =>
      col.defaultTo("normalUser").check(sql`type IN ('normalUser', 'managerUser', 'adminUser')`)
    )
    .addColumn("createdBy", "varchar", (col) => col.references("users.id"))
    .addColumn("createdDate", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("lastLogin", "datetime")
    .addColumn("lang", "varchar", (col) => col.defaultTo("gl").check(sql`lang IN ('gl', 'es', 'en')`))
    .execute();

  await db.schema
    .createTable("spaces")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("location", "varchar", (col) => col.notNull())
    .addColumn("info", "varchar")
    .execute();

  await db.schema
    .createTable("categories")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("spaces", "json")
    .execute();

  await db.schema
    .createTable("config")
    .ifNotExists()
    .addColumn("key", "varchar", (col) => col.primaryKey())
    .addColumn("value", "varchar", (col) => col.notNull())
    .execute();
}

//! Sentencias SQL para uso en utilidades

async function checkExistence(table, id) {
  const result = await db.selectFrom(table).select("id").where("id", "=", id).execute();
  return result.length > 0;
}

//! Sentencias SQL relacionadas con la tabla de eventos

// Insertar un evento en la base de datos
async function addEvent(event) {
  return await db
    .insertInto("events")
    .values({
      id: event.id,
      title: event.title,
      info: event.info,
      duration: event.duration,
      thumbUrl: event.thumbUrl,
      qrUrl: event.qrUrl,
      category: event.category,
      creator: event.creator,
    })
    .execute();
}

// Obtener los datos de un evento de la base de datos
async function getEvent(eventId) {
  return await db.selectFrom("events").selectAll().where("id", "=", eventId).execute();
}

// Obtener todos los eventos de la base de datos
async function getEvents() {
  return await db.selectFrom("events").selectAll().execute();
}

// Actualizar los datos de un evento en la base de datos
async function updateEvent(eventId, fieldName, newValue) {
  if (fieldName === "createdDate" || fieldName === "lastLogin") {
    newValue = new Date(newValue).toISOString();
  }

  const updateObject = { [fieldName]: newValue };

  return await db.updateTable("events").set(updateObject).where("id", "=", eventId).execute();
}

// Eliminar un evento de la base de datos
async function deleteEvent(eventId) {
  return await db.deleteFrom("events").where("id", "=", eventId).execute();
}

//! Sentencias SQL relacionadas con la tabla de reservas

// Insertar una reserva en la base de datos
async function addBooking(booking) {
  return await db
    .insertInto("bookings")
    .values({
      id: booking.id,
      eventId: booking.eventId,
      space: booking.space,
      bookingDate: booking.bookingDate.toISOString(),
      bookedBy: booking.bookedBy,
      bookedDate: booking.bookedDate.toISOString(),
      info: booking.info,
      status: booking.status,
    })
    .execute();
}

// Obtener los datos de una reserva de la base de datos
async function getBooking(bookingId) {
  return await db.selectFrom("bookings").selectAll().where("id", "=", bookingId).execute();
}

// Obtener las reservas de un evento de la base de datos
async function getEventBookings(eventId) {
  return await db.selectFrom("bookings").selectAll().where("eventId", "=", eventId).execute();
}

// Obtener todas las reservas de la base de datos
async function getBookings() {
  return await db.selectFrom("bookings").selectAll().execute();
}

// Actualizar los datos de una reserva en la base de datos
async function updateBooking(bookingId, fieldName, newValue) {
  if (fieldName === "bookingDate" || fieldName === "bookedDate") {
    newValue = new Date(newValue).toISOString();
  }

  const updateObject = { [fieldName]: newValue };

  return await db.updateTable("bookings").set(updateObject).where("id", "=", bookingId).execute();
}

// Actualizar el estado de una reserva en la base de datos
async function updateBookingStatus(bookingId, status) {
  return await db
    .updateTable("bookings")
    .set({
      status: status,
    })
    .where("id", "=", bookingId)
    .execute();
}

// Eliminar una reserva de la base de datos
async function deleteBooking(bookingId) {
  return await db.deleteFrom("bookings").where("id", "=", bookingId).execute();
}

//! Sentencias SQL relacionadas con la tabla de usuarios

// Insertar un usuario en la base de datos
async function addUser(user) {
  return await db
    .insertInto("users")
    .values({
      id: user.id,
      email: user.email,
      hashedPassword: user.hashedPassword,
      type: user.type,
      createdBy: user.createdBy,
      createdDate: user.createdDate.toISOString(),
      lastLogin: user.lastLogin.toISOString(),
      lang: user.lang,
    })
    .execute();
}

// Obtener los datos de un usuario de la base de datos
async function getUser(userId) {
  return await db.selectFrom("users").selectAll().where("id", "=", userId).execute();
}

// Obtener todos los usuarios de la base de datos
async function getUsers() {
  return await db.selectFrom("users").selectAll().execute();
}

// Actualizar los datos de un usuario en la base de datos
async function updateUser(userId, fieldName, newValue) {
  if (fieldName === "createdDate" || fieldName === "lastLogin") {
    newValue = new Date(newValue).toISOString();
  }

  const updateObject = { [fieldName]: newValue };

  return await db.updateTable("users").set(updateObject).where("id", "=", userId).execute();
}

// Actualizar la fecha de último acceso de un usuario en la base de datos
async function updateUserLastLogin(userId, lastLogin) {
  return await db
    .updateTable("users")
    .set({
      lastLogin: lastLogin.toISOString(),
    })
    .where("id", "=", userId)
    .execute();
}

// Eliminar un usuario de la base de datos
async function deleteUser(userId) {
  return await db.deleteFrom("users").where("id", "=", userId).execute();
}

//! Sentencias SQL relacionadas con la tabla de configuración

// Insertar un valor de configuración en la base de datos
async function setConfig(key, value) {
  return await db
    .insertInto("config")
    .values({
      key: key,
      value: value,
    })
    .execute();
}

// Obtener un valor de configuración de la base de datos
async function getConfig(key) {
  return await db.selectFrom("config").selectAll().where("key", "=", key).execute();
}

// Obtener todos los valores de configuración de la base de datos
async function getAllConfig() {
  return await db.selectFrom("config").selectAll().execute();
}

// Actualizar un valor de configuración en la base de datos
async function updateConfig(key, value) {
  return await db
    .updateTable("config")
    .set({
      value: value,
    })
    .where("key", "=", key)
    .execute();
}

// Eliminar un valor de configuración de la base de datos
async function deleteConfig(key) {
  return await db.deleteFrom("config").where("key", "=", key).execute();
}

//! Sentencias SQL relacionadas con la tabla de espacios

// Insertar un espacio en la base de datos
async function addSpace(space) {
  return await db
    .insertInto("spaces")
    .values({
      id: space.id,
      name: space.name,
      location: space.location,
      info: space.info,
    })
    .execute();
}

// Obtener los datos de un espacio de la base de datos
async function getSpace(spaceId) {
  return await db.selectFrom("spaces").selectAll().where("id", "=", spaceId).execute();
}

// Obtener todos los espacios de la base de datos
async function getSpaces() {
  return await db.selectFrom("spaces").selectAll().execute();
}

// Actualizar los datos de un espacio en la base de datos
async function updateSpace(spaceId, fieldName, newValue) {
  const updateObject = { [fieldName]: newValue };

  return await db.updateTable("spaces").set(updateObject).where("id", "=", spaceId).execute();
}

// Eliminar un espacio de la base de datos
async function deleteSpace(spaceId) {
  return await db.deleteFrom("spaces").where("id", "=", spaceId).execute();
}

//! Sentencias SQL relacionadas con la tabla de categorías

// Insertar una categoría en la base de datos
async function addCategory(category) {
  return await db
    .insertInto("categories")
    .values({
      id: category.id,
      title: category.title,
      spaces: category.spaces,
    })
    .execute();
}

// Obtener los datos de una categoría de la base de datos
async function getCategory(categoryId) {
  return await db.selectFrom("categories").selectAll().where("id", "=", categoryId).execute();
}

// Obtener todas las categorías de la base de datos
async function getCategories() {
  return await db.selectFrom("categories").selectAll().execute();
}

// Actualizar los datos de una categoría en la base de datos
async function updateCategory(categoryId, fieldName, newValue) {
  const updateObject = { [fieldName]: newValue };

  return await db.updateTable("categories").set(updateObject).where("id", "=", categoryId).execute();
}

// Eliminar una categoría de la base de datos
async function deleteCategory(categoryId) {
  return await db.deleteFrom("categories").where("id", "=", categoryId).execute();
}

//! Exportar todas las funciones
module.exports = {
  createTables,
  checkExistence,
  addEvent,
  getEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  addBooking,
  getBooking,
  getBookings,
  getEventBookings,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  addUser,
  getUser,
  getUsers,
  updateUser,
  updateUserLastLogin,
  deleteUser,
  addSpace,
  getSpace,
  getSpaces,
  updateSpace,
  deleteSpace,
  addCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  setConfig,
  getConfig,
  getAllConfig,
  updateConfig,
  deleteConfig,
};
