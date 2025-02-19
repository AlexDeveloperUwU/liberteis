# User Service

This document explains the functions available in the `userService.js` file.

## Functions

### addUser(user) ✔
Adds a new user to the database.

### updateUser(id, user) ✔
Updates an existing user in the database.

### updateUserPassword(id, pass) ✔
Updates the password of an existing user in the database.

### changeUserStatus(id) ✔
Enables or disables a user in the database.

### enableUser(id) ✔
Enables a user in the database.

### disableUser(id) ✔
Disables a user in the database.

### getUser(id, includeInactive = false) ✔
Retrieves a user from the database. Optionally includes inactive users.

### getUserByEmail(email, includeInactive = false) ✔
Retrieves a user by email from the database. Optionally includes inactive users.

### getUsers(status = "active") ✔
Retrieves all users from the database. Can return all, active (default), or inactive users.

### checkUserStatus(id) ✔
Checks the status of a user in the database.

### checkUserExists(email) ✔
Checks if a user exists in the database by email.
