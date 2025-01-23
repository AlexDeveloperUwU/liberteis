# Functions available in _eventsController_

## Introduction

In this controller, you will find functions related to the application's event management.

These functions allow you to retrieve, save, update, and delete event data.
Additionally, the controller includes comprehensive validation to ensure that the data being saved or updated is valid, successfully structured, and of the appropriate data type.

## Functions available

- `addEvent`: saves the given event data in the database (see the data structure below)

- `getEvent`: retrieves the event data from the database based on the given event ID

- `getEvents`: retrieves all event data from the database

- `getEventByName`: retrieves the event data from the database based on the given event name

- `updateEvent`: updates the event data in the database based on the given event ID

- `deleteEvent`: deletes the event data from the database based on the given event ID

- `checkEventExistence`: checks if the event exists in the database based on the given event ID
