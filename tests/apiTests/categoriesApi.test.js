/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

const baseUrl = "http://localhost:3000/api/categories/";

describe("Categories API Tests", () => {
  var categoryId = "";

  beforeAll(async () => {
    // Delete the category if it exists
    const response = await fetch(`${baseUrl}?name=testCategory`);
    const data = await response.json();
    if (data.data.length > 0) {
      await fetch(`${baseUrl}?id=${data.data[0].id}`, { method: "DELETE" });
    }
  });

  test("GET /api/categories - should return all categories", async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("POST /api/categories - should create a new category", async () => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "testCategory", spaces: [] }),
    });
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.message).toBe("Category created successfully");
  });

  test("GET /api/categories?name=testCategory - should return specific category if exists", async () => {
    const response = await fetch(`${baseUrl}?name=testCategory`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    categoryId = data.data[0].id;
    expect(data.data[0].name).toBe("testCategory");
  });

  test("PUT /api/categories - should update an existing category", async () => {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoryId, name: "testCategoryUpdated", spaces: [] }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("Category updated successfully");
  });

  test("DELETE /api/categories - should delete an existing category", async () => {
    const response = await fetch(`${baseUrl}?id=${categoryId}`, { method: "DELETE" });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
  });
});
