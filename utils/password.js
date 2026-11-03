import { randomInt } from "crypto";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~';
const POOL = LOWERCASE + UPPERCASE + NUMBERS + SYMBOLS;
const CLASSES = [LOWERCASE, UPPERCASE, NUMBERS, SYMBOLS];
const LENGTH = 12;

/**
 * Generates a random 12-character password containing at least one lowercase letter, one uppercase letter,
 * one digit and one symbol. Characters are drawn uniformly from the full pool with `crypto.randomInt` and the
 * result is regenerated until every class is present, so no class placement bias is introduced.
 * @returns {string} The generated password.
 */
export function generatePass() {
  for (;;) {
    let password = "";
    for (let i = 0; i < LENGTH; i++) {
      password += POOL[randomInt(POOL.length)];
    }
    if (CLASSES.every((chars) => [...chars].some((c) => password.includes(c)))) return password;
  }
}
