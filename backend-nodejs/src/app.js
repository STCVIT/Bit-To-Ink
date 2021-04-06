const express = require('express')
const path = require('path')
const cors = require('cors')
const handwriter = require('./routes/handwriter')

// setting path for env variables
require('dotenv').config({path:path.resolve(__dirname, '../.env') })

const app = express()

// enabling cors
app.use(cors())

// setting path for serving static files
app.use(express.static('public'))

app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Working...')
})

app.use('/handwriter',handwriter)

app.use((err,req,res,next) => {
    res.status(500).json({message: err.message})
})

module.exports = app 