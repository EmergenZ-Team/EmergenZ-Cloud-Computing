'use strict'
const express = require('express')
const path = require('path');
const Multer = require('multer')
const recordRouter = require('./routes')
const bodyParser = require('body-parser')

const app = express()

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(recordRouter)

app.get("/", (req, res) => {
    console.log("Response success")
    res.send("Response Success!")
})

app.get("/home", (req, res) => {
    console.log("You're entering home")
    res.send("Home entered")
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is up and listening at port: ${PORT}`)
})


