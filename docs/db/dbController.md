# Database Controller

This document explains the functions available in the `dbController.js` file.

## Functions

### dbCreateTables()
Creates the necessary tables in the database.

### dbCheckExistence(table, id)
Checks if a record exists in a table.

### dbGetOne(table, id)
Returns data given a table and an id.

### dbGetAll(table)
Returns all data from a given table.

### dbGetWhere(table, conditions)
Returns data with given conditions from a table.

### dbSaveData(table, data)
Inserts data into a given table.

### dbUpdateData(table, id, data)
Updates data of an entry with the given id in a table.

### dbGetDeletionStatus(table, id)
Obtains the deletion status of an entry with the given id from a table.

### dbSwitchDeletionStatus(table, id)
Switches the deletion status of an entry with the given id from a table.

### dbSetDeleteStatus(table, id, deletionStatus)
Sets the deletion status of an entry with the given id from a table to the given value.

### dbDeleteData(table, id)
Deletes the entry with the given id from a table. This function should only be used in the configService.
