# Functions avaliable in _configController_

## Introduction

In this controller, you will find functions related to the application's configuration management.

These functions allow you to retrieve, save, update, and delete configuration settings.

Also, the format of the data is {key: key, value: value}, but to use the defined methods of dbController, we will use `key` as our `id`.

## Functions avaliable

- `setConfig`: saves the given configuration setting in the database (key, value)

- `getConfig`: gets the configuration setting that has the given key (key)

- `getConfigs`: gets all the configuration settings

- `updateConfig`: updates the configuration setting that has the given key (key, value)

- `deleteConfig`: deletes the configuration setting that has the given key (key)

- `checkConfigExistence`: checks if a configuration setting with the given key exists (key)

