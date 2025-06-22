import { Kysely, MysqlDialect, sql } from "kysely";
import mysql from "mysql2";
import path from "path";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
import fs from "fs/promises";

const __dirname = path.resolve();

const envConfig = dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.resolve(__dirname, "./data/secrets/dbcreds.env"),
}).parsed;

/**
 * MySQL database connection configuration.
 */
const dbPool = mysql.createPool({
  host: envConfig.MYSQL_HOST,
  user: envConfig.MYSQL_USER,
  password: envConfig.MYSQL_PASSWORD,
  database: envConfig.MYSQL_DATABASE,

  /**
   * Maps tinyint(1) to boolean.
   * @param {Object} field - Database field.
   * @param {Function} next - Function to continue processing.
   * @returns {boolean|*} - Returns a boolean if the field is tinyint(1), otherwise continues.
   */
  typeCast(field, next) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1";
    }
    return next();
  },
});

/**
 * Event triggered when a connection is established with the database.
 */
dbPool.on("connection", () => {
  logger.info(`Conexión establecida con la base de datos`);
});

/**
 * Event triggered when an error occurs in the connection pool.
 * @param {Error} err - Error occurred.
 */
dbPool.on("error", (err) => {
  if (err instanceof AggregateError) {
    logger.error(`AggregateError en la conexión a la base de datos: ${err.errors}`);
  } else {
    logger.error(`Error en la conexión a la base de datos: ${err}`);
  }
});

/**
 * Handles connection errors and closes the application if a critical error occurs.
 * @param {Error} err - Connection error.
 * @param {Object} connection - Database connection.
 */
dbPool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "ECONNREFUSED") {
      logger.error(
        "La conexión a la base de datos fue rechazada. Verifica que el servidor de MySQL esté en funcionamiento.",
      );
    } else {
      logger.error(`Error al conectar con la base de datos: ${err.message}`);
    }
    process.exit(1);
  }
  if (connection) connection.release();
});

/**
 * Instancia de Kysely configurada para usar el pool de conexiones MySQL.
 */
const db = new Kysely({
  dialect: new MysqlDialect({
    pool: dbPool,
  }),
});

/**
 * Crea las tablas necesarias en la base de datos si no existen.
 * @async
 */
export async function dbCreateTables() {
  await db.transaction().execute(async (trx) => {
    await trx.schema
      .createTable("config")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("value", "varchar(255)", (col) => col.notNull())
      .execute();

    await trx.schema
      .createTable("users")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("name", "varchar(100)", (col) => col.notNull())
      .addColumn("email", "varchar(255)", (col) => col.unique().notNull())
      .addColumn("hashedPassword", "varchar(255)", (col) => col.notNull())
      .addColumn("type", "varchar(20)", (col) => col.defaultTo("normalUser"))
      .addColumn("createdBy", "varchar(50)", (col) => col.notNull())
      .addColumn("createdDate", "timestamp", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("lastLogin", "timestamp")
      .addColumn("lang", "varchar(2)", (col) => col.defaultTo("gl"))
      .addColumn("theme", "varchar(5)", (col) => col.defaultTo("light"))
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();

    await trx.schema
      .createTable("spaces")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("name", "varchar(100)", (col) => col.notNull())
      .addColumn("location", "varchar(255)", (col) => col.notNull())
      .addColumn("info", "varchar(500)")
      .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();

    await trx.schema
      .createTable("categories")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("name", "varchar(100)", (col) => col.notNull())
      .addColumn("spaces", "json")
      .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();

    await trx.schema
      .createTable("events")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("title", "varchar(200)", (col) => col.notNull())
      .addColumn("info", "varchar(500)", (col) => col.notNull())
      .addColumn("duration", "integer", (col) => col.defaultTo(30).notNull())
      .addColumn("coverUrl", "varchar(500)")
      .addColumn("category", "varchar(50)", (col) => col.references("categories.id"))
      .addColumn("createdBy", "varchar(50)", (col) => col.references("users.id"))
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();

    await trx.schema
      .createTable("bookings")
      .ifNotExists()
      .addColumn("id", "varchar(50)", (col) => col.notNull().primaryKey())
      .addColumn("eventId", "varchar(50)", (col) => col.references("events.id"))
      .addColumn("space", "varchar(50)", (col) => col.references("spaces.id"))
      .addColumn("bookingDate", "timestamp", (col) => col.notNull())
      .addColumn("bookedBy", "varchar(50)", (col) => col.references("users.id"))
      .addColumn("bookedDate", "timestamp", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("info", "varchar(500)")
      .addColumn("status", "varchar(20)", (col) =>
        col.defaultTo("active").check(sql`status IN ('active', 'cancelled')`),
      )
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();

    const configRows = await trx.selectFrom("config").selectAll().execute();

    const hasEnableWeekends = configRows.some((row) => row.id === "enableWeekends");
    const hasAppName = configRows.some((row) => row.id === "appName");
    const domain = configRows.some((row) => row.id === "domain");

    if (!hasEnableWeekends) {
      await trx.insertInto("config").values({ id: "enableWeekends", value: "false" }).execute();
    }
    if (!hasAppName) {
      await trx.insertInto("config").values({ id: "appName", value: "EvenTeis" }).execute();
    }
    if (!domain) {
      await trx.insertInto("config").values({ id: "domain", value: "http://localhost:3000" }).execute();
    }

    await createAdminUser();
  });
}

/**
 * Checks if a record exists in a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @returns {Promise<boolean>} - Returns true if the record exists, false otherwise.
 */
export async function dbCheckExistence(table, id) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx.selectFrom(table).select("id").where("id", "=", id).execute();
    return result.length > 0;
  });
}

/**
 * Gets a record from a table by its ID.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @returns {Promise<Object>} - Returns the found record.
 */
export async function dbGetOne(table, id) {
  return await db.transaction().execute(async (trx) => {
    return await trx.selectFrom(table).selectAll().where("id", "=", id).execute();
  });
}

/**
 * Gets all records from a table.
 * @async
 * @param {string} table - Table name.
 * @returns {Promise<Array>} - Returns all records from the table.
 */
export async function dbGetAll(table) {
  return await db.transaction().execute(async (trx) => {
    return await trx.selectFrom(table).selectAll().execute();
  });
}

/**
 * Gets records from a table that meet certain conditions.
 * @async
 * @param {string} table - Table name.
 * @param {Array|Object} conditions - Conditions to filter the records.
 * @returns {Promise<Array>} - Returns the records that meet the conditions.
 */
export async function dbGetWhere(table, conditions) {
  return await db.transaction().execute(async (trx) => {
    if (!Array.isArray(conditions)) {
      conditions = [conditions];
    }
    let query = trx.selectFrom(table).selectAll();
    conditions.forEach((condition) => {
      query = query.where(condition.field, condition.operator, condition.value);
    });
    return await query.execute();
  });
}

/**
 * Inserts data into a table.
 * @async
 * @param {string} table - Table name.
 * @param {Object} data - Data to insert.
 * @returns {Promise<Object>} - Returns the result of the insertion.
 */
export async function dbSaveData(table, data) {
  return await db.transaction().execute(async (trx) => {
    return await trx.insertInto(table).values(data).execute();
  });
}

/**
 * Updates the data of a record in a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @param {Object} data - Data to update.
 * @returns {Promise<Object>} - Returns the result of the update.
 */
export async function dbUpdateData(table, id, data) {
  return await db.transaction().execute(async (trx) => {
    return await trx.updateTable(table).set(data).where("id", "=", id).execute();
  });
}

/**
 * Gets the deletion status of a record in a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @returns {Promise<boolean>} - Returns the deletion status of the record.
 */
export async function dbGetDeletionStatus(table, id) {
  return await db.transaction().execute(async (trx) => {
    const data = await dbGetOne(table, id);
    return data[0].deleted; // This should now return true/false as a boolean
  });
}

/**
 * Switches the deletion status of a record in a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @returns {Promise<Object>} - Returns the result of the update.
 */
export async function dbSwitchDeletionStatus(table, id) {
  return await db.transaction().execute(async (trx) => {
    const data = await dbGetOne(table, id);
    return await dbUpdateData(table, id, { deleted: !data[0].deleted });
  });
}

/**
 * Sets the deletion status of a record in a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @param {boolean} deletionStatus - Deletion status to set.
 * @returns {Promise<Object>} - Returns the result of the update.
 */
export async function dbSetDeleteStatus(table, id, deletionStatus) {
  return await db.transaction().execute(async (trx) => {
    return await dbUpdateData(table, id, { deleted: deletionStatus });
  });
}

/**
 * Deletes a record from a table.
 * @async
 * @param {string} table - Table name.
 * @param {string} id - Record ID.
 * @returns {Promise<Object>} - Returns the result of the deletion.
 */
export async function dbDeleteData(table, id) {
  return await db.transaction().execute(async (trx) => {
    return await trx.deleteFrom(table).where("id", "=", id).execute();
  });
}

/**
 * Deletes all records from all tables in the database.
 * @async
 * @description This function SHOULD NOT be used in the application, only for testing with a clean database.
 */
export async function clearDb() {
  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("bookings").execute();
    await trx.deleteFrom("events").execute();
    await trx.deleteFrom("categories").execute();
    await trx.deleteFrom("spaces").execute();
    await trx.deleteFrom("users").execute();
    await trx.deleteFrom("config").execute();
  });
}

/**
 * Creates the initial admin user if it doesn't exist.
 * @async
 */
async function createAdminUser() {
  const adminEmail = "admin@lolcat.host";
  const adminExists = await dbGetWhere("users", {
    field: "email",
    operator: "=",
    value: adminEmail,
  });

  if (adminExists.length === 0) {
    try {
      const adminPassPath = path.resolve(__dirname, "./data/secrets/adminaccount.key");
      const adminPass = await fs.readFile(adminPassPath, "utf8");

      const adminUser = {
        name: "Administrador",
        email: adminEmail,
        type: "adminUser",
        password: adminPass.trim(),
        createdBy: "System",
      };

      await import("./userService.js").then((userService) => {
        userService.addUser(adminUser);
      });
    } catch (error) {
      logger.error(`Error creando usuario admin: ${error.message}`);
    }
  }
}
