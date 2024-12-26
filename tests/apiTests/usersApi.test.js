const baseUrl = "http://localhost:3000/api/users";

describe("Users API Tests", () => {
  beforeAll(async () => {
    // Delete the testing user if exists
    await fetch(`${baseUrl}?email=test@test.com`, { method: "DELETE" });
  });

  test("POST /api/users - should create a new user", async () => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: "test@test.com", type: "normalUser" }),
    });
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.message).toBe("User created sucessfully");
  });

  test("GET /api/users - should return all users", async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("GET /api/users - should return a specific user", async () => {
    const response = await fetch(`${baseUrl}?email=test@test.com`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data[0].email).toBe("test@test.com");
    expect(data.data[0].type).toBe("normalUser");
    expect(data.data[0].name).toBe("Test User");
  });

  test("PUT /api/users - should update an existing user", async () => {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", name: "Updated User", lang: "es" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("User updated successfully");
  });

  test("GET /api/users - should return a specific user", async () => {
    const response = await fetch(`${baseUrl}?email=test@test.com`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data[0].email).toBe("test@test.com");
    expect(data.data[0].lang).toBe("es");
    expect(data.data[0].name).toBe("Updated User");
  });

  test("DELETE /api/users - should delete a user", async () => {
    const response = await fetch(`${baseUrl}?email=test@test.com`, { method: "DELETE" });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("User deleted sucessfully");
  });

  test("GET /api/users - should return an empty array", async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data).toEqual([]);
  });
});
