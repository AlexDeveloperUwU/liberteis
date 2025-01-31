import * as dbc from "./dbController.js";
import * as id from "../utils/idGen.js";

//! Basic CRUD operations

// Function to add a booking to the database
export async function addBooking(booking) {}

// Function to update a booking in the database
export async function updateBooking(id, booking) {}

// Function to enable or disable a booking in the database
export async function changeBookingStatus(id) {}

// Function to enable a booking in the database
export async function enableBooking(id) {}

// Function to disable a booking in the database
export async function disableBooking(id) {}

//! Info retrieval operations

// Function to get a booking from the database
// It includes the option to include inactive bookings
export async function getBooking(id, includeInactive = false) {}

// Function to get a booking by name from the database
// It includes the option to include inactive bookings
export async function getBookingByName(name, includeInactive = false) {}

// Function to get all bookings from the database
// It can return: all, active (DEFAULT) or inactive bookings
export async function getBookings(status) {}

// Function to check a booking's status
export async function checkBookingStatus(id) {}