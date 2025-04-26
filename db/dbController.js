import { Kysely, MysqlDialect, sql } from "kysely";
import mysql from "mysql2";
import path from "path";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

const __dirname = path.resolve();

const envConfig = dotenv.config({
  path: path.resolve(__dirname, "./data/secrets/dbcreds.env"),
}).parsed;

/**
 * Configuración de la conexión a la base de datos MySQL.
 */
const dbPool = mysql.createPool({
  host: envConfig.MYSQL_HOST,
  user: envConfig.MYSQL_USER,
  password: envConfig.MYSQL_PASSWORD,
  database: envConfig.MYSQL_DATABASE,

  /**
   * Mapea tinyint(1) a boolean.
   * @param {Object} field - Campo de la base de datos.
   * @param {Function} next - Función para continuar con el procesamiento.
   * @returns {boolean|*} - Devuelve un booleano si el campo es tinyint(1), de lo contrario continúa.
   */
  typeCast(field, next) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1";
    }
    return next();
  },
});

/**
 * Evento que se dispara cuando se establece una conexión con la base de datos.
 */
dbPool.on("connection", () => {
  logger.info(`Conexión establecida con la base de datos`);
});

/**
 * Evento que se dispara cuando ocurre un error en el pool de conexiones.
 * @param {Error} err - Error ocurrido.
 */
dbPool.on("error", (err) => {
  if (err instanceof AggregateError) {
    logger.error(`AggregateError en la conexión a la base de datos: ${err.errors}`);
  } else {
    logger.error(`Error en la conexión a la base de datos: ${err}`);
  }
});

/**
 * Maneja errores de conexión y cierra la aplicación si ocurre un error crítico.
 * @param {Error} err - Error de conexión.
 * @param {Object} connection - Conexión de la base de datos.
 */
dbPool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "ECONNREFUSED") {
      logger.error("La conexión a la base de datos fue rechazada. Verifica que el servidor de MySQL esté en funcionamiento.");
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
      .addColumn("createdDate", "datetime", (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("lastLogin", "datetime")
      .addColumn("lang", "varchar(2)", (col) => col.defaultTo("gl"))
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
      .addColumn("qrUrl", "varchar(500)")
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
      .addColumn("bookingDate", "datetime", (col) => col.notNull())
      .addColumn("bookedBy", "varchar(50)", (col) => col.references("users.id"))
      .addColumn("bookedDate", "datetime", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn("info", "varchar(500)")
      .addColumn("status", "varchar(20)", (col) => col.defaultTo("active").check(sql`status IN ('active', 'cancelled')`))
      .addColumn("deleted", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();
  });
}

/**
 * Verifica si un registro existe en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @returns {Promise<boolean>} - Devuelve true si el registro existe, de lo contrario false.
 */
export async function dbCheckExistence(table, id) {
  return await db.transaction().execute(async (trx) => {
    const result = await trx.selectFrom(table).select("id").where("id", "=", id).execute();
    return result.length > 0;
  });
}

/**
 * Obtiene un registro de una tabla dado su ID.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @returns {Promise<Object>} - Devuelve el registro encontrado.
 */
export async function dbGetOne(table, id) {
  return await db.transaction().execute(async (trx) => {
    return await trx.selectFrom(table).selectAll().where("id", "=", id).execute();
  });
}

/**
 * Obtiene todos los registros de una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @returns {Promise<Array>} - Devuelve todos los registros de la tabla.
 */
export async function dbGetAll(table) {
  return await db.transaction().execute(async (trx) => {
    return await trx.selectFrom(table).selectAll().execute();
  });
}

/**
 * Obtiene registros de una tabla que cumplen con ciertas condiciones.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {Array|Object} conditions - Condiciones para filtrar los registros.
 * @returns {Promise<Array>} - Devuelve los registros que cumplen con las condiciones.
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
 * Inserta datos en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {Object} data - Datos a insertar.
 * @returns {Promise<Object>} - Devuelve el resultado de la inserción.
 */
export async function dbSaveData(table, data) {
  return await db.transaction().execute(async (trx) => {
    return await trx.insertInto(table).values(data).execute();
  });
}

/**
 * Actualiza los datos de un registro en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @param {Object} data - Datos a actualizar.
 * @returns {Promise<Object>} - Devuelve el resultado de la actualización.
 */
export async function dbUpdateData(table, id, data) {
  return await db.transaction().execute(async (trx) => {
    return await trx.updateTable(table).set(data).where("id", "=", id).execute();
  });
}

/**
 * Obtiene el estado de eliminación de un registro en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @returns {Promise<boolean>} - Devuelve el estado de eliminación del registro.
 */
export async function dbGetDeletionStatus(table, id) {
  return await db.transaction().execute(async (trx) => {
    const data = await dbGetOne(table, id);
    return data[0].deleted; // This should now return true/false as a boolean
  });
}

/**
 * Cambia el estado de eliminación de un registro en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @returns {Promise<Object>} - Devuelve el resultado de la actualización.
 */
export async function dbSwitchDeletionStatus(table, id) {
  return await db.transaction().execute(async (trx) => {
    const data = await dbGetOne(table, id);
    return await dbUpdateData(table, id, { deleted: !data[0].deleted });
  });
}

/**
 * Establece el estado de eliminación de un registro en una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @param {boolean} deletionStatus - Estado de eliminación a establecer.
 * @returns {Promise<Object>} - Devuelve el resultado de la actualización.
 */
export async function dbSetDeleteStatus(table, id, deletionStatus) {
  return await db.transaction().execute(async (trx) => {
    return await dbUpdateData(table, id, { deleted: deletionStatus });
  });
}

/**
 * Elimina un registro de una tabla.
 * @async
 * @param {string} table - Nombre de la tabla.
 * @param {string} id - ID del registro.
 * @returns {Promise<Object>} - Devuelve el resultado de la eliminación.
 */
export async function dbDeleteData(table, id) {
  return await db.transaction().execute(async (trx) => {
    return await trx.deleteFrom(table).where("id", "=", id).execute();
  });
}

/**
 * Elimina todos los registros de todas las tablas de la base de datos.
 * @async
 * @description Esta función NO DEBE ser utilizada en la aplicación, solo para pruebas con una base de datos limpia.
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
