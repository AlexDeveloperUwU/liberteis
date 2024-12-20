# Available functions in _password_

## Introduction

This module provides functions for generating secure passwords. The passwords are designed to be strong and meet various security criteria.

## Available functions

### generatePass()

Generates a secure password with a length of 12 characters. The password includes numbers, symbols, uppercase and lowercase letters, and meets strict criteria for security.

- **Returns:**
  - `string`: A secure password.

- **Example:**
  ```javascript
  const password = await generatePass();
  console.log(password);
  ```
