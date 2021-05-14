const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require("../models/user");

beforeEach(async () => {
    await Blog.deleteMany({})

    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }

    await User.deleteMany({})

})

test('application returns the correct amount of blog posts', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('application returns blogs in JSON format', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-type', /application\/json/)
})

test('UUID property of blog posts is named "id"', async () => {
    const response = await api.get('/api/blogs')
    for (let blog of response.body) {
        expect(blog.id).toBeDefined()
    }
})

test('blog creation fails if token is not provided', async () => {
    await api
        .post('/api/blogs')
        .send(helper.newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length)

    const content = blogs.map(b => {
        return {
            title: b.title, author: b.author, url: b.url, likes: b.likes
        }
    })
    expect(content).not.toContainEqual(helper.newBlog)
})

test('if likes property is missing, it will default to 0', async () => {
    await api
        .post('/api/blogs')
        .send(helper.newBlogWithoutLikesProperty)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    const content = blogs.map(b => {
        return {
            title: b.title, author: b.author, url: b.url, likes: b.likes
        }
    })
    expect(content).toContainEqual({...helper.newBlogWithoutLikesProperty, likes: 0})
})

test('if title or url property is missing, response status code is 400', async () => {
    for (let blog of [helper.blogsWithoutTitleAndURL])
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(400)
})

afterAll(async () => {
    await mongoose.connection.close()
})