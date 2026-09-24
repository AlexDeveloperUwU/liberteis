import { z } from "zod";

/**
 * Request-body schemas for the routes with the most direct exposure to
 * untrusted input (auth, bookings, events). Each schema is intentionally
 * loose on shape (`.passthrough()`) — it only pins down the fields the
 * service layer actually reads, as a type/format boundary check, not a
 * full data model.
 */

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const recurrenceSchema = z
  .object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    days: z
      .array(
        z.object({
          day: z.union([z.string(), z.number()]),
          time: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

export const createBookingSchema = z
  .object({
    eventId: z.string().min(1),
    space: z.string().min(1),
    bookedBy: z.string().min(1).optional(),
    info: z.string().optional(),
    bookingDate: z.string().optional(),
    recurrence: recurrenceSchema.optional(),
  })
  .passthrough();

export const updateBookingSchema = z
  .object({
    eventId: z.string().min(1).optional(),
    space: z.string().min(1).optional(),
    info: z.string().optional(),
    bookingDate: z.string().optional(),
  })
  .passthrough();

export const createEventSchema = z
  .object({
    title: z.string().min(1),
    info: z.string().min(1),
    category: z.string().min(1),
    duration: z.coerce.number().optional(),
    createdBy: z.string().min(1).optional(),
  })
  .passthrough();

export const updateEventSchema = z
  .object({
    title: z.string().min(1).optional(),
    info: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    duration: z.coerce.number().optional(),
  })
  .passthrough();

export const idQuerySchema = z.object({ id: z.string().min(1) });

export const optionalIdQuerySchema = z.object({ id: z.string().min(1).optional() }).passthrough();

export const scopeQuerySchema = z.object({ scope: z.enum(["single", "group"]).optional() });

export const eventIdQuerySchema = z.object({ eventId: z.string().min(1) });

export const userIdQuerySchema = z.object({ userId: z.string().min(1) });

export const optionalUserIdQuerySchema = z.object({ userId: z.string().min(1).optional() }).passthrough();

export const categoryIdQuerySchema = z.object({ categoryId: z.string().min(1) });

export const keyQuerySchema = z.object({ key: z.string().min(1) });

export const optionalKeyQuerySchema = z.object({ key: z.string().min(1).optional() });

export const emailQuerySchema = z.object({ email: z.string().email() });

export const resetTokenParamSchema = z.object({ token: z.string().min(1) });

export const createCategorySchema = z
  .object({
    name: z.string().min(1),
    spaces: z.array(z.unknown()),
  })
  .passthrough();

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).optional(),
    spaces: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const createSpaceSchema = z
  .object({
    name: z.string().min(1),
    location: z.string().min(1),
    info: z.string().optional(),
  })
  .passthrough();

export const updateSpaceSchema = z
  .object({
    name: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    info: z.string().optional(),
  })
  .passthrough();

const userTypeSchema = z.enum(["normalUser", "managerUser", "adminUser"]);

export const createUserSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    type: userTypeSchema.optional(),
    lang: z.string().min(1).optional(),
  })
  .passthrough();

export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    type: userTypeSchema.optional(),
    lang: z.string().min(1).optional(),
    theme: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    invalidateOtherSessions: z.boolean().optional(),
  })
  .passthrough();

export const setConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any().refine((v) => v !== undefined, "Value is required"),
});

/**
 * Parses `req.body` against `schema`, returning the parsed (and
 * type-coerced) data on success or `null` on failure.
 * @param {import('zod').ZodSchema} schema - The schema to validate against.
 * @param {object} body - The request body to validate.
 * @returns {object|null}
 */
export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  return result.success ? result.data : null;
}

/**
 * Parses `req.query` (or `req.params`) against `schema`, returning the parsed
 * data on success or `null` on failure. Same contract as `parseBody`.
 * @param {import('zod').ZodSchema} schema - The schema to validate against.
 * @param {object} query - The query/params object to validate.
 * @returns {object|null}
 */
export function parseQuery(schema, query) {
  const result = schema.safeParse(query);
  return result.success ? result.data : null;
}
