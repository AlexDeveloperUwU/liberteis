const { Kysely, SqliteDialect } = require("kysely");
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
    .addColumn("bookedDate", "date", (col) => col.notNull())
    .addColumn("info", "varchar")
    .execute();

  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("email", "varchar", (col) => col.unique().notNull())
    .addColumn("hashedPassword", "varchar", (col) => col.notNull())
    .addColumn("type", "varchar", (col) => col.defaultTo("normalUser"))
    .addColumn("createdBy", "varchar", (col) => col.references("users.id"))
    .addColumn("createdDate", "datetime")
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
    .addColumn("key", "varchar", (col) => col.primaryKey())
    .addColumn("value", "varchar", (col) => col.notNull())
    .execute();
}
