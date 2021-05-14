const logger = require('./logger')
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({error: error.message})
    }
}


const tokenExtractor = (request, response, next) => {
    try {
        const authorization = request.get('authorization')
        if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
            request.token = authorization.substring(7)
        } else {
            request.token = null
        }
        next()
    } catch (error) {
        next(error)
    }
}

const userExtractor = async (req, res, next) => {
    if (req.token) {
        const decodedToken = jwt.verify(req.token, process.env.SECRET)

        if (!req.token || !decodedToken.id) {
            req.user = null
        } else {
            req.user = await User.findById(decodedToken.id)
        }
    }

    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor,
}