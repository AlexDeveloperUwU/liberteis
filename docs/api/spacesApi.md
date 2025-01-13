# Endpoints available in _spacesApi_

## Introduction

In this API, you will find endpoints related to space management with their respective methods.
These endpoints allow you to retrieve, create, update, and delete space records.

To be able to access this API, you must have the appropriate permissions applied to your account.

## Endpoints available

**GET**: `/?id=ID` or `/?name=NAME` - Gets all spaces or a specific space by id or name

**POST**: `/` - Creates a new space (name, location, info)

**PUT**: `/` - Updates an existing space (id, name, location, info)

**DELETE**: `/?id=ID` - Deletes an existing space by id
