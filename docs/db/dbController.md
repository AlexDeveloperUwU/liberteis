# Functions available in _dbController_

## Introduction

All the functions listed here are boilerplate implementations, meaning they only include basic data validations.

To improve organization, each table should have its own dedicated controller.

These functions are defined here to avoid code duplication and redundancy.

## Functions available

### `dbCreateTables`

Creates all the required tables.

### `dbCheckExistence`

Checks if an entry with the given ID exists in the given table.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry to check.

### `dbGetOne`

Gets the entry that has the given ID in the given table.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry to retrieve.

### `dbGetAll`

Gets all the entries in the given table.

**Parameters:**
- `table` (string): The name of the table.

### `dbGetWhere`

Gets all the entries in the given table that match the given conditions.

**Parameters:**
- `table` (string): The name of the table.
- `conditions` (array|object): The conditions to match. Each condition should be an object with `field`, `operator`, and `value`.

### `dbSaveData`

Saves the given data in the given table.

**Parameters:**
- `table` (string): The name of the table.
- `data` (object): The data to save.

### `dbUpdateData`

Updates the data of the entry that has the given ID in the given table.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry to update.
- `data` (object): The new data.

### `dbGetDeletionStatus`

Obtains the deletion status of the entry with the given ID from the given table.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry.

### `dbSwitchDeletionStatus`

Switches the deletion status of the entry with the given ID from the given table.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry.

### `dbSetDeleteStatus`

Sets the deletion status of the entry with the given ID from the given table to the given value.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry.
- `deletionStatus` (boolean): The new deletion status.

### `dbDeleteData`

Deletes the entry with the given ID from the given table. This function should only be used in the configService.

**Parameters:**
- `table` (string): The name of the table.
- `id` (string): The ID of the entry to delete.