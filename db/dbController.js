import { Kysely, SqliteDialect, sql } from "kysely";
import Database from "better-sqlite3";

//! Database connection
const db = new Kysely({
  dialect: new SqliteDialect({
    database: new Database("./data/liberteis.db"),
  }),
});

//! SQL function to create tables
export async function dbCreateTables() {
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
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("email", "varchar", (col) => col.unique().notNull())
    .addColumn("hashedPassword", "varchar", (col) => col.notNull())
    .addColumn("type", "varchar", (col) => col.defaultTo("normalUser"))
    .addColumn("createdBy", "varchar", (col) => col.notNull())
    .addColumn("createdDate", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("lastLogin", "datetime")
    .addColumn("lang", "varchar", (col) => col.defaultTo("gl"))
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
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("value", "varchar", (col) => col.notNull())
    .execute();
}

//! SQL queries for utilities

// Check if a record exists in a table
export async function dbCheckExistence(table, id) {
  const result = await db.selectFrom(table).select("id").where("id", "=", id).execute();
  return result.length > 0;
}

// Returns data given a table and an id
export async function dbGetOne(table, id) {
  return await db.selectFrom(table).selectAll().where("id", "=", id).execute();
}

// Returns all data from a given table
export async function dbGetAll(table) {
  return await db.selectFrom(table).selectAll().execute();
}

// Return data with a given where
export async function dbGetWhere(table, column, operation, data) {
  return await db.selectFrom(table).selectAll().where(column, operation, data).execute();
}

// Inserts the data into a given table
export async function dbSaveData(table, data) {
  return await db.insertInto(table).values(data).execute();
}

// Updates the data of the entry with the given id in a given table
export async function dbUpdateData(table, id, data) {
  return await db.updateTable(table).set(data).where("id", "=", id).execute();
}

// Deletes the entry with the given id from a given table
export async function dbDeleteData(table, id) {
  return await db.deleteFrom(table).where("id", "=", id).execute();
}
