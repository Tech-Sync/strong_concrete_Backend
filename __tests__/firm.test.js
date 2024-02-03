const request = require("supertest");
const app = require("../index");
const { dbConnection } = require("../src/configs/dbConnection");

const accesToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZmlyc3ROYW1lIjoiYWRtaW4iLCJsYXN0TmFtZSI6ImFkbWluIiwibnJjTm8iOiIxMTExIiwicGhvbmVOTyI6IisxMTExIiwiYWRkcmVzcyI6IkliZXgiLCJyb2xlIjo1LCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImlzQWN0aXZlIjp0cnVlLCJpc1ZlcmlmaWVkIjp0cnVlLCJlbWFpbFRva2VuIjoiNzFiZmVhYzM3NmFkZDcxNDM0ODNmZjJmZGU4YmE2OGQwZDYxOGI0ZmZjMWQzMDEwMjk1MWY3ZjQyOGM3NGUyYjE5YWIyMzI1MmIxMjU0ZjA4N2E2NGRlZjY1MzM2Y2Q3OTZiMWNlMDhkMTliZTAyMWQ1MzFmNzkxMzhjMTg4NmEiLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTIwVDE1OjQxOjM4LjczMloiLCJ1cGRhdGVkQXQiOiIyMDI0LTAxLTIwVDE1OjQxOjM4LjczMloiLCJkZWxldGVkQXQiOm51bGwsImlhdCI6MTcwNTk1MDA4MSwiZXhwIjoxNzA2MDM2NDgxfQ.GBaFspVQ0ORM5EK9C-HNG5klH2Dd9JU3s_GDX4ixW2c";

beforeAll(async () => {
  await dbConnection();
});

describe("FIRM", () => {
  describe("GET", () => {
    it("should return 200 status code ", async () => {
      const response = await request(app)
        .get("/firms")
        .set("Authorization", `Bearer ${accesToken}`);
      expect(response.statusCode).toBe(200);
    });
  });
  describe("UPDATE", () => {
    it("should return 200 status code ", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
    });
  });
  describe("POST", () => {
    const newFirmData = {
      name: "E",
      address: "Ibex",
      phoneNo: "+55",
      tpinNo: "55",
      email: "E@gmail.com",
      status: 2,
    };
    it("should return 200 status code ", async () => {
      const response = await request(app)
        .post("/firms")
        .send(newFirmData)
        .set("Authorization", `Bearer ${accesToken}`);

        console.log(response.body);
      expect(response.status).toBe(200);
    });
  });
});
