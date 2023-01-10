import {createRequest, createResponse} from "node-mocks-http";
import getEventByHash from "src/pages/api/getEventByHash";

describe("/api/getEvent", () => {
  it ("should return success response", async () => {
    const request = createRequest({
      method: "POST",
      body: { hash: "hash1" }
    })
    const response = createResponse();
    await getEventByHash(request, response);
    expect(response.statusCode).toBe(200);
    expect(response._getJSONData()).toHaveProperty("data");
  })
})
