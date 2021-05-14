const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const bcrypt = require("bcrypt");


beforeEach(async () => {
    await User.deleteMany({})

    await api
        .post('/api/users')
        .send(helper.initialUser)
})

afterAll(async () => {
    await mongoose.connection.close()
})

test('user creation is successful when posted data is valid', async () => {
    const initialUsers = await helper.usersInDb()

    const newUser = {
        username: "manue",
        password: "manolo",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length + 1)

    const usernames = usersInDb.map(u => u.username)
    expect(usernames).toContain(newUser.username)
})

test('user creation is unsuccessful when password is less than 3 characters long', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
        username: "manue",
        password: "ma",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
    const usernames = usersInDb.map(u => u.username)
    expect(usernames).not.toContain(newUser.username)
})

test('user creation is unsuccessful when password is missing', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
        username: "manue",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
    const usernames = usersInDb.map(u => u.username)
    expect(usernames).not.toContain(newUser.username)
})

test('user creation is unsuccessful when username is less than 3 characters long', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
        username: "me",
        password: "manolo",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
    const usernames = usersInDb.map(u => u.username)
    expect(usernames).not.toContain(newUser.username)
})

test('user creation is unsuccessful when username is missing', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
        password: "manue",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
    const usernames = usersInDb.map(u => u.username)
    expect(usernames).not.toContain(newUser.username)
})

test('user creation is unsuccessful when username is not unique', async () => {
    const initialUsers = await helper.usersInDb()
    const newUser = {
        username: "paco",
        password: "manolo",
        name: "manolo el del bombo"
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersInDb = await helper.usersInDb()
    expect(usersInDb).toHaveLength(initialUsers.length)
})