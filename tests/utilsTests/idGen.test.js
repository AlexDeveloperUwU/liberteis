import { generateId } from "../../utils/idGen";

describe("generateId Tests", () => {
  const types = ["event", "user", "booking", "space", "category"];
  const typeToLetterMap = {
    event: "E",
    user: "U",
    booking: "B",
    space: "S",
    category: "C",
  };

  types.forEach((type) => {
    test(`should generate a unique ID for type: ${type}`, async () => {
      const id = await generateId(type);
      expect(id).toMatch(new RegExp(`^${typeToLetterMap[type]}[A-Z0-9]{4}$`));
    });
  });

  test("should throw an error for an invalid type", async () => {
    const type = "invalidType";

    await expect(generateId(type)).rejects.toThrow(`Invalid type: ${type}`);
  });
});
