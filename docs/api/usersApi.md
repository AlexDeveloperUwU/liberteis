# Endpoints available in _usersApi_

## Introduction

In this API, you will find endpoints related to user management with their respective methods.
These endpoints allow you to retrieve, create, update, and delete user records.

To be able to access this API, you must have the appropriate permissions applied to your account.

## Endpoints available

**GET**: `/?id=ID` or `/email=EMAIL` - Gets all users or a specific user by id or email

**POST**: `/` - Creates a new user (name, email, type)

**PUT**: `/` - Updates an existing user (id or email, name, type, lastLogin, lang)

**DELETE**: `/?id=ID` or `/?email=EMAIL` - Deletes an existing user by id or email
