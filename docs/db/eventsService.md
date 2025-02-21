# Events Service

This document explains the functions available in the `eventsService.js` file.

## Functions

### addEvent(event)

Adds a new event to the database.

### updateEvent(id, event)

Updates an existing event in the database.

### changeEventStatus(id)

Enables or disables an event in the database.

### enableEvent(id)

Enables an event in the database.

### disableEvent(id)

Disables an event in the database.

### getEvent(id, includeInactive = false)

Retrieves an event from the database. Optionally includes inactive events.

### getEventByTitle(title, includeInactive = false)

Retrieves an event by title from the database. Optionally includes inactive events.

### getEvents(status)

Retrieves all events from the database. Can return all, active (default), or inactive events.

### checkEventStatus(id)

Checks the status of an event in the database.

### checkEventExists(title)

Checks if an event exists in the database by title.
