const express = require('express')

const convertToHandwritten = require('../controllers/handwriter')

const router = new express.Router()

router.post('/convert',convertToHandwritten)

module.exports =  router