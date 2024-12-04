# Functions avaliable in _usersController_

## Introduction

In this controller, you will find functions related to the application's user management.

These functions allow you to retrieve, save, update, and delete user data.
Additionally, the controller includes comprehensive validation to ensure that the data being saved or updated is valid, correctly structured, and of the appropriate data type.

## Functions avaliable

- `addUser`: saves the given user data in the database (see the data structure below)

## Data structure for the functions

### `addUser`:

```json
{
  "name": "name",
  "email": "email",
  "createdBy": "createdBy",
  "userType": "userType"
}
```
