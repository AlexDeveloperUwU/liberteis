import { generate } from "generate-password";

export async function generatePass() {
  return generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    strict: true,
  });
}
