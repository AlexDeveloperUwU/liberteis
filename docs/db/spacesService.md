# Spaces Service

This document explains the functions available in the `spacesService.js` file.

## Functions

### addSpace(space)

Adds a new space to the database.

### updateSpace(id, space)

Updates an existing space in the database.

### changeSpaceStatus(id)

Enables or disables a space in the database.

### enableSpace(id)

Enables a space in the database.

### disableSpace(id)

Disables a space in the database.

### getSpace(id, includeInactive = false)

Retrieves a space from the database. Optionally includes inactive spaces.

### getSpaceByName(name, includeInactive = false)

Retrieves a space by name from the database. Optionally includes inactive spaces.

### getSpaces(status)

Retrieves all spaces from the database. Can return all, active (default), or inactive spaces.

### checkSpaceStatus(id)

Checks the status of a space in the database.

### checkSpaceExists(name)

Checks if a space exists in the database by name.
