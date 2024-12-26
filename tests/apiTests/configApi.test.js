const baseUrl = "http://localhost:3000/api/config/";

describe("Config API Tests", () => {
  beforeAll(async () => {
    // Eliminar la configuración si existe
    await fetch(`${baseUrl}?key=testKey`, { method: "DELETE" });

    // Crear la configuración inicial
    await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "testKey", value: "testValue" }),
    });
  });

  test("GET /api/config - should return all configs", async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("GET /api/config?key=testKey - should return specific config if exists", async () => {
    const response = await fetch(`${baseUrl}?key=testKey`);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.data[0].value).toBe("testValue");
  });

  test("POST /api/config - should create a new config", async () => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "newKey", value: "newValue" }),
    });
    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.code).toBe(201);
    expect(data.message).toBe("Config created correctly");
  });

  test("PUT /api/config - should update an existing config", async () => {
    const response = await fetch(baseUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "newKey", value: "updatedValue" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("Config updated correctly");
  });

  test("DELETE /api/config?key=newKey - should delete a config", async () => {
    const response = await fetch(`${baseUrl}?key=newKey`, { method: "DELETE" });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.code).toBe(200);
    expect(data.message).toBe("Config deleted correctly");
  });
});
