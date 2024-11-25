# Functions avaliable in _dbController_

## Introduction

All the functions listed here are boilerplate implementations, meaning they only include basic data validations.
To improve organization, each table should have its own dedicated controller.
These functions are defined here to avoid code duplication and redundancy.

## Functions avaliable

`dbCreateTables`: creates all the required tables

`dbCheckExistence`: checks if an entry with the given ID exists in the given table

`dbGetOne`: gets the entry that has the ID that is given in the given table

`dbSaveData`: saves the given data in the given table

`dbUpdateData`: updates the data of the entry that has the given ID in the given table

`dbDeleteData`: deletes the entry that has the given ID in the given table

## See also

- [configController](./configController.md)