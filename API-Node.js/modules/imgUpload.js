'use strict'
const {Storage} = require('@google-cloud/storage')
const fs = require('fs')
const path = require('path');

const pathKey = path.resolve('./serviceaccount.json')

const gcs = new Storage({
    projectId: 'emergenz-project-plan',
    keyFilename: pathKey
})

const bucketName = 'emergenz'
const folderName = 'KTP'
const bucket = gcs.bucket(bucketName)

function getPublicUrl(filename) {
    return 'https://storage.googleapis.com/' + bucketName + '/' + folderName + '/' + filename;
}

let ImgUpload = {}

ImgUpload.uploadToGcs = (req, res) => {
    if (!req.file) return res.status(500).send({message: "File tidak ada"})
    const {nik} = req.body

    const gcsname = folderName + '/' + nik
    const file = bucket.file(gcsname)

    const stream = file.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    })

    stream.on('error', (err) => {
        req.file.cloudStorageError = err
        return res.status(500).send({message: "Error"})
    })

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
    })

    stream.end(req.file.buffer)
}

module.exports = ImgUpload