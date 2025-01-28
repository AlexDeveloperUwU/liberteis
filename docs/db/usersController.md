# Functions available in _usersController_

## Introduction

In this controller, you will find functions related to the application's user management.

These functions allow you to retrieve, save, update, and delete user data.
Additionally, the controller includes comprehensive validation to ensure that the data being saved or updated is valid, successfully structured, and of the appropriate data type.

## Functions available

- `addUser`: saves the given user data in the database

- `getUser`: retrieves the user data from the database based on the given user ID

- `getUsers`: retrieves all user data from the database

- `getUserByEmail`: retrieves the user data from the database based on the given user email

- `updateUser`: updates the user data in the database based on the given user ID

- `updateUserPassword`: updates the user password in the database based on the given user ID

- `disableUser`: sets the user status to inactive based on the given user ID

- `enableUser`: sets the user status to active based on the given user ID

- `changeUserStatus`: toggles the user status between active and inactive based on the given user ID

- `checkUserExistence`: checks if the user exists in the database based on the given user ID
