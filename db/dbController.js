import { Kysely, MysqlDialect, sql } from "kysely";
import mysql from "mysql2";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.resolve();

const envConfig = dotenv.config({
  path: path.resolve(__dirname, "./data/secrets/dbcreds.env"),
}).parsed;

//! Database connection
const db = new Kysely({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: envConfig.MYSQL_HOST,
      user: envConfig.MYSQL_USER,
      password: envConfig.MYSQL_PASSWORD,
      database: envConfig.MYSQL_DATABASE,
    }),
  }),
});

//! SQL function to create tables
export async function dbCreateTables() {
  await db.schema
    .createTable("config")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey()) 
    .addColumn("value", "varchar(255)", (col) => col.notNull()) 
    .execute();

  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
    .addColumn("name", "varchar(100)", (col) => col.notNull()) 
    .addColumn("email", "varchar(255)", (col) => col.unique().notNull()) 
    .addColumn("hashedPassword", "varchar(255)", (col) => col.notNull()) 
    .addColumn("type", "varchar(20)", (col) => col.defaultTo("normalUser")) 
    .addColumn("createdBy", "varchar(50)", (col) => col.notNull()) 
    .addColumn("createdDate", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("lastLogin", "datetime")
    .addColumn("lang", "varchar(2)", (col) => col.defaultTo("gl"))
    .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
    .execute();

  await db.schema
    .createTable("spaces")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey()) 
    .addColumn("name", "varchar(100)", (col) => col.notNull()) 
    .addColumn("location", "varchar(255)", (col) => col.notNull())
    .addColumn("info", "varchar(500)") 
    .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
    .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
    .execute();

  await db.schema
    .createTable("categories")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey()) 
    .addColumn("name", "varchar(100)", (col) => col.notNull()) 
    .addColumn("spaces", "json")
    .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
    .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
    .execute();

  await db.schema
    .createTable("events")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey()) 
    .addColumn("title", "varchar(200)", (col) => col.notNull()) 
    .addColumn("info", "varchar(500)", (col) => col.notNull())
    .addColumn("duration", "integer", (col) => col.defaultTo(30).notNull())
    .addColumn("coverUrl", "varchar(500)")
    .addColumn("qrUrl", "varchar(500)") 
    .addColumn("category", "varchar(50)", (col) => col.references("categories.id"))
    .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
    .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
    .execute();

  await db.schema
    .createTable("bookings")
    .ifNotExists()
    .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey()) 
    .addColumn("eventId", "varchar(50)", (col) => col.references("events.id"))
    .addColumn("space", "varchar(50)", (col) => col.references("spaces.id"))
    .addColumn("bookingDate", "date", (col) => col.notNull())
    .addColumn("bookedBy", "varchar(50)", (col) => col.references("users.id"))
    .addColumn("bookedDate", "datetime", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("info", "varchar(500)")
    .addColumn("status", "varchar(20)", (col) => col.defaultTo("active").check(sql`status IN ('active', 'cancelled')`))
    .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
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
export async function dbGetWhere(table, conditions) {
  if (!Array.isArray(conditions)) {
    conditions = [conditions];
  }
  let query = db.selectFrom(table).selectAll();
  conditions.forEach((condition) => {
    query = query.where(condition.field, condition.operator, condition.value);
  });
  return await query.execute();
}

// Inserts the data into a given table
export async function dbSaveData(table, data) {
  return await db.insertInto(table).values(data).execute();
}

// Updates the data of the entry with the given id in a given table
export async function dbUpdateData(table, id, data) {
  return await db.updateTable(table).set(data).where("id", "=", id).execute();
}

// Obtains the status of an entry with the given id from a given table
export async function dbGetDeletionStatus(table, id) {
  const data = await dbGetOne(table, id);
  return data[0].deleted;
}

// Switches deletion status of the entry with the given id from a given table
export async function dbSwitchDeletionStatus(table, id) {
  const data = await dbGetOne(table, id);
  return await dbUpdateData(table, id, { deleted: !data[0].deleted });
}

// Sets deletion status of the entry with the given id from a given table to the given value
export async function dbSetDeleteStatus(table, id, deletionStatus) {
  return await dbUpdateData(table, id, { deleted: deletionStatus });
}

// Deletes the entry with the given id from a given table
//* This function SHOULD NOT be used in the app, JUST in the configService
//* This is due to the fact that we don't have to keep a history of the deleted configurations
export async function dbDeleteData(table, id) {
  return await db.deleteFrom(table).where("id", "=", id).execute();
}
