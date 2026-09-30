// /tests/users/users.roles.tests
import { describe, expect, it, beforeAll } from "vitest"
import request from "supertest"

import app from "../../src/app.js"
import { ROLES } from "../../src/constants/roles.js"
import { uuid } from "zod"

import { getAuthenticatedAdmin, createAuthenticatedUser } from "../../tests/helpers/auth.js"

describe("User roles endpoints", () => {

  it("assigns invalid role to a user", async () => {
    //-- get a role from the test database
    const invalidRole = uuid();

    // log a user
    const user = await createAuthenticatedUser();

    //-- creates a user
    const email = `users-roles-${Date.now()}@example.com`
    const password = 'tititoto'

    const userResponse = await request(app).post("/api/users").send({
      email,
      password
    }).set("Authorization", `Bearer ${user.accessToken}`)

    const userCreated = userResponse.body;

    //-- assigns the role to the user
    //const user_role = await db.insert(userRoles).values({roleId: roleAdmin.id, userId: user.id}).returning();
    const userRoleResponse = await request(app).post(`/api/users/${userCreated.id}/roles`)
      .send({
        roleId: invalidRole
      }).set("Authorization", `Bearer ${user.accessToken}`)

    expect(userRoleResponse.status).toBe(400)
  })

  it("assigns a role to a user", async () => {
    //-- get a role from the test database
    const admin = await getAuthenticatedAdmin();

    const rolesResponse = await request(app).get("/api/roles").set("Authorization", `Bearer ${admin.accessToken}`)
    const roleIndex = rolesResponse.body.findIndex(r => r.name == ROLES.ADMIN)
    const roleAdmin = rolesResponse.body[roleIndex]
    expect(roleAdmin).toBeDefined()

    //-- creates a user
    const email = `users-roles-${Date.now()}@example.com`
    const password = 'notAGoodPassword'

    const userResponse = await request(app).post("/api/users").send({
      email,
      password
    }).set("Authorization", `Bearer ${admin.accessToken}`)
    const user = userResponse.body;

    //-- assigns the role to the user
    //const user_role = await db.insert(userRoles).values({roleId: roleAdmin.id, userId: user.id}).returning();
    const userRoleResponse = await request(app).post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleAdmin.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(userRoleResponse.status).toBe(201)

    const user_role = userRoleResponse.body
    //-- gets the role of the user
    expect(user_role).toHaveProperty("roleId", roleAdmin.id)
    expect(user_role).toHaveProperty("userId", user.id)
  })

  it("returns 409 when the user already has the role", async () => {
    //-- get a role from the test database
    const admin = await getAuthenticatedAdmin();

    //-- get a role from the test database
    const rolesResponse = await request(app).get("/api/roles").set("Authorization", `Bearer ${admin.accessToken}`)
    const roleIndex = rolesResponse.body.findIndex(r => r.name == ROLES.ADMIN)
    const roleAdmin = rolesResponse.body[roleIndex]
    expect(roleAdmin).toBeDefined()

    //-- creates a user
    const email = `users-roles-${Date.now()}@example.com`
    const password = 'tititoto'

    const userResponse = await request(app).post("/api/users").send({
      email,
      password
    }).set("Authorization", `Bearer ${admin.accessToken}`)
    const user = userResponse.body;

    //-- assigns the role to the user
    //const user_role = await db.insert(userRoles).values({roleId: roleAdmin.id, userId: user.id}).returning();
    const userRoleResponse = await request(app).post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleAdmin.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(userRoleResponse.status).toBe(201)

    // attribuer ADMIN une deuxième fois
    const userRoleResponseAgain = await request(app).post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleAdmin.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    // expect 409
    expect(userRoleResponseAgain.status).toBe(409)
  })

  it("returns a list of roles for a users", async () => {
    //-- get a role from the test database
    const admin = await getAuthenticatedAdmin();

    //-- get a role from the test database
    const rolesResponse = await request(app).get("/api/roles").set("Authorization", `Bearer ${admin.accessToken}`)

    // admin
    const roleAdminIndex = rolesResponse.body.findIndex(r => r.name == ROLES.ADMIN)
    const roleAdmin = rolesResponse.body[roleAdminIndex]
    // user
    const roleUserIndex = rolesResponse.body.findIndex(r => r.name == ROLES.USER)
    const roleUser = rolesResponse.body[roleUserIndex]

    expect(roleAdmin).toBeDefined()
    expect(roleUser).toBeDefined()

    //-- creates a user
    const email = `users-2roles-${Date.now()}@example.com`
    const password = 'tititoto'

    const userResponse = await request(app).post("/api/users").send({ email, password }).set("Authorization", `Bearer ${admin.accessToken}`)
    const user = userResponse.body;

    //-- assignation of 2 roles to the user
    const adminResponse = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleAdmin.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(adminResponse.status).toBe(201)
    expect(adminResponse.body).toHaveProperty("userId", user.id)
    expect(adminResponse.body).toHaveProperty("roleId", roleAdmin.id)

    const userRoleResponse = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleUser.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(userRoleResponse.status).toBe(201)
    expect(userRoleResponse.body).toHaveProperty("userId", user.id)
    expect(userRoleResponse.body).toHaveProperty("roleId", roleUser.id)


    const twoRoleResponse = await request(app).get(`/api/users/${user.id}/roles`).set("Authorization", `Bearer ${admin.accessToken}`)
    expect(twoRoleResponse.status).toBe(200)
    const user_roles = twoRoleResponse.body;
    expect(user_roles).toBeInstanceOf(Array);
    expect(user_roles).toHaveLength(2);
    expect(user_roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: user.id,
          roleId: roleAdmin.id
        }),
        expect.objectContaining({
          userId: user.id,
          roleId: roleUser.id
        })
      ])
    )
  })

  it("remove a role for a user", async () => {
    //-- get a role from the test database
    const admin = await getAuthenticatedAdmin();

    //-- get a role from the test database
    const rolesResponse = await request(app).get("/api/roles").set("Authorization", `Bearer ${admin.accessToken}`)

    // admin
    const roleAdminIndex = rolesResponse.body.findIndex(r => r.name == ROLES.ADMIN)
    const roleAdmin = rolesResponse.body[roleAdminIndex]
    // user
    const roleUserIndex = rolesResponse.body.findIndex(r => r.name == ROLES.USER)
    const roleUser = rolesResponse.body[roleUserIndex]

    expect(roleAdmin).toBeDefined()
    expect(roleUser).toBeDefined()

    //-- creates a user
    const email = `users-2roles-${Date.now()}@example.com`
    const password = 'tititoto'

    const userResponse = await request(app).post("/api/users").send({ email, password }).set("Authorization", `Bearer ${admin.accessToken}`)
    const user = userResponse.body;

    //-- assignation of 2 roles to the user
    const adminResponse = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleAdmin.id
      })
      .set("Authorization", `Bearer ${admin.accessToken}`)

    expect(adminResponse.status).toBe(201)
    expect(adminResponse.body).toHaveProperty("userId", user.id)
    expect(adminResponse.body).toHaveProperty("roleId", roleAdmin.id)

    const userRoleResponse = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        roleId: roleUser.id
      }).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(userRoleResponse.status).toBe(201)
    expect(userRoleResponse.body).toHaveProperty("userId", user.id)
    expect(userRoleResponse.body).toHaveProperty("roleId", roleUser.id)

    const twoRoleResponse = await request(app).get(`/api/users/${user.id}/roles`).set("Authorization", `Bearer ${admin.accessToken}`)
    expect(twoRoleResponse.status).toBe(200)
    const user_roles = twoRoleResponse.body;
    expect(user_roles).toBeInstanceOf(Array);
    expect(user_roles).toHaveLength(2);

    // then remove the role
    const deleteOneRole = await request(app).delete(`/api/users/${user.id}/roles/${roleUser.id}`).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(deleteOneRole.status).toBe(204);

    const oneRoleOnlyLeft = await request(app).get(`/api/users/${user.id}/roles`).set("Authorization", `Bearer ${admin.accessToken}`)

    expect(oneRoleOnlyLeft.status).toBe(200)
    const user_role = oneRoleOnlyLeft.body;
    expect(user_role).toBeInstanceOf(Array);
    expect(user_role).toHaveLength(1);
    expect(user_role).toEqual([
      expect.objectContaining({
        userId: user.id,
        roleId: roleAdmin.id
      })
    ])
  })
  
  it("returns 401 without authentication", async () => {
    const response = await request(app)
      .get("/api/users/whatever/roles")

    expect(response.status).toBe(401)
  })
})
