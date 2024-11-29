# Endpoints avaliable in _configApi_

## Introduction

In this API, you will find endpoints related to the application's configuration management with their respective methods.
These endpoints allow you to retrieve, save, update, and delete configuration settings.

To be able to access this API, you must have the admin role applied to your account.

## Endpoints avaliable

**GET**: `/` - Gets all the configuration settings avaliable

**GET**: `/?key=KEY` - Gets the configuration setting that has the given key

**POST**: `/` - Saves the given configuration setting in the database (key, value)

**PUT**: `/` - Updates the configuration setting that has the given key (key, value)

**DELETE**: `/?key=KEY` - Deletes the configuration setting that has the given key
