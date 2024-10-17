const { Kysely, SqliteDialect, sql } = require("kysely");
const Database = require("better-sqlite3");

const db = new Kysely({
  dialect: new SqliteDialect({
    database: new Database("../data/liberteis.db"),
  }),
});

export async function createTables() {
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
    .addColumn("status", "varchar", (col) => col.defaultTo("active").check(sql`status IN ('active', 'canceled')`))
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

//! Sentencias SQL relacionadas con la tabla de eventos

// Insertar un evento en la base de datos
export async function addEvent(event) {
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
export async function getEvent(eventId) {
  return await db.select().from("events").where("id", "=", eventId).execute();
}

// Obtener todos los eventos de la base de datos
export async function getEvents() {
  return await db.select().from("events").execute();
}

// Actualizar los datos de un evento en la base de datos
export async function updateEvent(event) {
  return await db
    .update("events")
    .set({
      title: event.title,
      info: event.info,
      duration: event.duration,
      thumbUrl: event.thumbUrl,
      qrUrl: event.qrUrl,
      category: event.category,
      creator: event.creator,
    })
    .where("id", "=", event.id)
    .execute();
}

// Eliminar un evento de la base de datos
export async function deleteEvent(eventId) {
  return await db.deleteFrom("events").where("id", "=", eventId).execute();
}

//! Sentencias SQL relacionadas con la tabla de reservas

// Insertar una reserva en la base de datos
export async function addBooking(booking) {
  return await db
    .insertInto("bookings")
    .values({
      id: booking.id,
      eventId: booking.eventId,
      space: booking.space,
      bookingDate: booking.bookingDate,
      bookedBy: booking.bookedBy,
      bookedDate: booking.bookedDate,
      info: booking.info,
      status: booking.status,
    })
    .execute();
}

// Obtener los datos de una reserva de la base de datos
export async function getBooking(bookingId) {
  return await db.select().from("bookings").where("id", "=", bookingId).execute();
}

// Obtener todas las reservas de la base de datos
export async function getBookings() {
  return await db.select().from("bookings").execute();
}

// Actualizar los datos de una reserva en la base de datos
export async function updateBooking(booking) {
  return await db
    .update("bookings")
    .set({
      eventId: booking.eventId,
      space: booking.space,
      bookingDate: booking.bookingDate,
      bookedBy: booking.bookedBy,
      bookedDate: booking.bookedDate,
      info: booking.info,
      status: booking.status,
    })
    .where("id", "=", booking.id)
    .execute();
}

// Actualizar el estado de una reserva en la base de datos
export async function updateBookingStatus(bookingId, status) {
  return await db
    .update("bookings")
    .set({
      status: status,
    })
    .where("id", "=", bookingId)
    .execute();
}

// Eliminar una reserva de la base de datos
export async function deleteBooking(bookingId) {
  return await db.deleteFrom("bookings").where("id", "=", bookingId).execute();
}

//! Sentencias SQL relacionadas con la tabla de usuarios

// Insertar un usuario en la base de datos
export async function addUser(user) {
  return await db
    .insertInto("users")
    .values({
      id: user.id,
      email: user.email,
      hashedPassword: user.hashedPassword,
      type: user.type,
      createdBy: user.createdBy,
      createdDate: user.createdDate,
      lastLogin: user.lastLogin,
      lang: user.lang,
    })
    .execute();
}

// Obtener los datos de un usuario de la base de datos
export async function getUser(userId) {
  return await db.select().from("users").where("id", "=", userId).execute();
}

// Obtener todos los usuarios de la base de datos
export async function getUsers() {
  return await db.select().from("users").execute();
}

// Actualizar los datos de un usuario en la base de datos
export async function updateUser(user) {
  return await db
    .update("users")
    .set({
      email: user.email,
      hashedPassword: user.hashedPassword,
      type: user.type,
      createdBy: user.createdBy,
      createdDate: user.createdDate,
      lastLogin: user.lastLogin,
      lang: user.lang,
    })
    .where("id", "=", user.id)
    .execute();
}

// Actualizar la fecha de último acceso de un usuario en la base de datos
export async function updateUserLastLogin(userId, lastLogin) {
  return await db
    .update("users")
    .set({
      lastLogin: lastLogin,
    })
    .where("id", "=", userId)
    .execute();
}

// Eliminar un usuario de la base de datos
export async function deleteUser(userId) {
  return await db.deleteFrom("users").where("id", "=", userId).execute();
}