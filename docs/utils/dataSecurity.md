# Available functions in _dataSecurity_

## Introduction

In this module, you will find functions related to data security, including password encryption and validation, as well as data encryption and decryption.

## Available functions

**encryptPass(pass)**: Encrypts a password using HMAC-SHA256.

**validatePass(pass, hash)**: Validates a password by comparing it with a stored hash.

**encryptData(data)**: Encrypts data using AES-256-CBC.

**decryptData(encryptedData)**: Decrypts data encrypted with AES-256-CBC.
