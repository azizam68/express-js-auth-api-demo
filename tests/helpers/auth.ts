// tests/helpers/auth.ts

import request from "supertest"
import app from "../../src/app.js"

export async function createAuthenticatedUser() {
  const email = `test-${Date.now()+Math.floor(Math.random() * 10000000)}@example.com`
  const password = "Password123!"

  const createResponse = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      password,
      passwordConfirm: password
    })

  if (createResponse.status !== 201) {
    throw new Error("Failed to create test user")
  }

  const user = createResponse.body

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password
    })

  if (loginResponse.status !== 200) {
    throw new Error("Failed to login test user")
  }

  return {
    user,
    accessToken: loginResponse.body.accessToken
  }
}

export async function getAuthenticatedAdmin() {
  const email = `admin@example.com`
  const password = "Admin123!"

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password
    })

  if (loginResponse.status !== 200) {
    console.table(email)
    console.table(password)
    console.error(loginResponse.error)
    throw new Error("Failed to login admin user")
  }


    console.log(`${email} with ${password}`)

  const authMeResponse = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)


  if (authMeResponse.status !== 200) {
    throw new Error("Failed to authenticate admin user using jwt")
  }

  const rolesResponse = await request(app)
    .get("/api/admin")
    .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)


  if (rolesResponse.status !== 200) {
    throw new Error("this user has lost the admin role")
  }

  return {
    user: authMeResponse.body,
    accessToken: loginResponse.body.accessToken
  }
}