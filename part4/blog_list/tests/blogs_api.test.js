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

test('making an HTTP POST request successfully creates a new blog post', async () => {
    const newBlog = {
        title: 'PHP: a fractal of bad design',
        author: 'Eevee',
        url: 'https://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/',
        likes: 6
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    content = blogs.map(b => {
        return {
            title: b.title, author: b.author, url: b.url, likes: b.likes
        }
    })
    expect(content).toContainEqual(newBlog)
})

afterAll(async () => {
    await mongoose.connection.close()
})