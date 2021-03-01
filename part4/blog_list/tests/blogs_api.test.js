const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('application returns the correct amount of blog posts', async () => {
    const expectedNumberOfBlogs = helper.initialBlogs.length
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(expectedNumberOfBlogs)
})

test('application returns blogs in JSON format', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-type', /application\/json/)
})

afterAll(async () => {
    await mongoose.connection.close()
})