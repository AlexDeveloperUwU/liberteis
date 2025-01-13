/**
 * @jest-environment node
 * @type {import('@jest/globals').Jest}
 */

const baseUrl = "http://localhost:3000/api/spaces/";

describe("Spaces API Tests", () => {
  var spaceId = "";
  beforeAll(async () => {
    // Delete the space if it exists
    const response = await fetch(`${baseUrl}?name=testSpace`);
    const data = await response.json();
    if (data.data.length > 0) {
      await fetch(`${baseUrl}?id=${data.data[0].id}`, { method: "DELETE" });
    }
  });

  test("GET /api/spaces - should return all spaces", async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("POST /api/spaces - should create a new space", async () => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "testSpace", location: "testLocation", info: "testInfo" }),
    });
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.message).toBe("Space created successfully");
  });

  test("GET /api/spaces?name=testSpace - should return specific space if exists", async () => {
    const response = await fetch(`${baseUrl}?name=testSpace`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    spaceId = data.data[0].id;
    expect(data.data[0].name).toBe("testSpace");
    expect(data.data[0].location).toBe("testLocation");
    expect(data.data[0].info).toBe("testInfo");
  });

  test("PUT /api/spaces - should update an existing space", async () => {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: spaceId, name: "testSpace", location: "updatedLocation", info: "updatedInfo" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("Space updated successfully");
  });

  test("DELETE /api/spaces?id=ID - should delete a space", async () => {
    const response = await fetch(`${baseUrl}?id=${spaceId}`, { method: "DELETE" });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("Space deleted successfully");
  });
});
