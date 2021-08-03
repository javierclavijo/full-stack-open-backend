const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const newBlog = {
        ...request.body,
        user: request.user._id
    }
    const blog = new Blog(newBlog)

    try {
        const savedBlog = await blog.save()
        request.user.blogs = request.user.blogs.concat(savedBlog._id)
        await request.user.save()

        response.status(201).json(savedBlog)
    } catch (err) {
        response.status(400).json({error: err.toString()})
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === request.user._id.toString()) {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } else {
        console.log('error!')
        response.status(401).json({error: 'only the user who created a blog can delete it'})
    }

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body;
    const newBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }

    Blog.findByIdAndUpdate(request.params.id, newBlog, {new: true})
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))

    // const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, {new: true})
    // response.json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
    const comment = request.body.comment

    if (comment) {
        const id = request.params.id

        Blog.findByIdAndUpdate(
            id,
            {$push: {comments: comment}},
            {new: true}
        )
            .then(data => {
                response.json(data)
            })
            .catch(error => next(error))
    } else {
        response.status(400)
    }
})

module.exports = blogsRouter