import { describe, expect, it } from "vitest"
import app from "../src/app.js"

describe("API", () => {
  it("should be defined", () => {
    expect(app).toBeDefined()
  })
})