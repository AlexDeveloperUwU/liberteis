import { generatePass } from "../../utils/password";

describe("Password Tests", () => {
  test("Should generate a password", async () => {
    const pass = await generatePass();
    expect(pass).toBeDefined();
  });
});
