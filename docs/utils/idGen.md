# Available functions in _idGen_

## Introduction

This module provides functions for generating unique identifiers for different types of entities. The identifiers are designed to be unique and follow a specific format based on the entity type.

## Available functions

### generateId(type)

Generates a unique identifier for the specified type. The identifier consists of a prefix letter representing the type, followed by a combination of random letters and numbers.

- **Parameters:**
  - `type` (string): The type of entity for which the ID is being generated. Valid types are: "event", "user", "booking", "space", "category".

- **Returns:**
  - `string`: A unique identifier for the specified type.

- **Example:**
  ```javascript
  const id = await generateId("user");
  console.log(id); 
  ```

### generateCombination(letter)

Generates a unique combination of letters and numbers based on a provided initial letter.

- **Parameters:**
  - `letter` (string): The initial letter to be used in the combination.

- **Returns:**
  - `string`: A unique combination of letters and numbers.

- **Example:**
  ```javascript
  const combination = generateCombination("E");
  console.log(combination); 
  ```
