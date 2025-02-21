# Bookings Service

This document explains the functions available in the `bookingsService.js` file.

## Functions

### addBooking(booking)

Adds a new booking to the database.

### updateBooking(id, booking)

Updates an existing booking in the database.

### changeBookingStatus(id)

Enables or disables a booking in the database.

### enableBooking(id)

Enables a booking in the database.

### disableBooking(id)

Disables a booking in the database.

### getBooking(id, includeInactive = false)

Retrieves a booking from the database. Optionally includes inactive bookings.

### getBookingByName(name, includeInactive = false)

Retrieves a booking by name from the database. Optionally includes inactive bookings.

### getBookings(status)

Retrieves all bookings from the database. Can return all, active (default), or inactive bookings.

### checkBookingStatus(id)

Checks the status of a booking in the database.
