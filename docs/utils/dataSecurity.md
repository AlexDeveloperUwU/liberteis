# Available functions in _dataSecurity_

## Introduction

In this module, you will find functions related to data security, including password encryption and validation, as well as data encryption and decryption.

## Available functions

### encryptPass(pass)

Encrypts a password using HMAC-SHA256.

- **Parameters:**
  - `pass` (string): The password to be encrypted.
- **Returns:**
  - (string): The encrypted password.

### validatePass(pass, hash)

Validates a password by comparing it with a stored hash.

- **Parameters:**
  - `pass` (string): The password to be validated.
  - `hash` (string): The hash to compare against.
- **Returns:**
  - (boolean): `true` if the password matches the hash, `false` otherwise.

### encryptData(data)

Encrypts data using AES-256-CBC.

- **Parameters:**
  - `data` (string): The data to be encrypted.
- **Returns:**
  - (string): The encrypted data.

### decryptData(encryptedData)

Decrypts data encrypted with AES-256-CBC.

- **Parameters:**
  - `encryptedData` (string): The data to be decrypted.
- **Returns:**
  - (string): The decrypted data.
