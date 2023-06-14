require('dotenv').config()

const express = require('express')
const router = express.Router()
const Multer = require('multer')
const mysql = require('mysql')
const bcrypt = require('bcrypt');
const imgUpload = require('./modules/imgUpload')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const https = require('https')

const multer = Multer({
    storage: Multer.MemoryStorage,
    fileSize: 5 * 1024 * 1024
})

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'emergenz',
    multipleStatements: true
})

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

router.post("/add_detail_user", authenticateToken, multer.single('image'), (req, res) => {
    const {email, name, nik, gender, province, city, address} = req.body
    var imageUrl = 'https://storage.googleapis.com/emergenz/KTP/'+nik

    if (req.file && req.file.cloudStoragePublicUrl) {
        imageUrl = req.file.cloudStoragePublicUrl
    }
    const query = "INSERT INTO user(email, name, gender, nik, province, city, address, image_url) values(?, ?, ?, ?, ?, ?, ?, ?)"
    con.query(query, [email, name, gender, nik, province, city, address, imageUrl], (err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage})
        } else{
            imgUpload.uploadToGcs(req, res)
            res.status(200).send({error: false, message: `Data ${name} telah dimasukkan`, link: imageUrl})
        }
    })
})

function authenticateToken(req, res, next){
    const autHeader = req.headers['authorization']
    const token = autHeader && autHeader.split(' ')[1]
    if(token == null) return res.status(500).send({message: "Token tidak ada"})
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(500).send({message: "Token tidak sesuai"})
        req.user = user
        next()
        }
    )
}

router.get("/user_data/:email", authenticateToken, (req, res) => {
    const email = req.params.email
    const query = `SELECT email, name, gender, nik, province, city, address, image_url FROM user WHERE email = '${email}'`
    con.query(query, (err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage})
        } else if(rows.length == 0){
            res.status(500).send({error: true, message: `Data ${email} tidak ditemukan`})
        }
        else{
            res.status(200).send({
                error: false, 
                message: `Data ${email} ditemukan`,
                data: {
                    email: rows[0].email, 
                    name: rows[0].name, 
                    gender: rows[0].gender, 
                    nik: rows[0].nik, 
                    province: rows[0].province, 
                    city: rows[0].city, 
                    address: rows[0].address, 
                    image_url: rows[0].image_url
                }
            })
        }
    })
})

router.get("/news/:email", authenticateToken, (req, res) => {
    const email = req.params.email
    let all_title = []
    const query = `
    SELECT title FROM history
    INNER JOIN news
    ON history.news_id = news.news_id
    WHERE email = '${email}'
    ORDER BY history.time DESC
    `
    con.query(query, (err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage})
        } else{
            for(let i = 0; i< rows.length; i++){
                all_title.push(rows[i].title)
            }
            if(all_title.length<10){
                const news_query = `SELECT * FROM
                ((SELECT news_id, title, author, category, image FROM news
                WHERE category = "kebakaran"
                ORDER BY rand()
                LIMIT 5)
                UNION
                (SELECT news_id, title, author, category, image FROM news
                WHERE category = "polisi"
                ORDER BY rand()
                LIMIT 5)
                UNION
                (SELECT news_id, title, author, category, image FROM news
                WHERE category = "rumah sakit"
                ORDER BY rand()
                LIMIT 5)) AS t
                ORDER BY rand()`
                con.query(news_query, (err, rows2, field) => {
                    if(err){
                        return res.status(500).send({error: true, message: err.sqlMessage})
                    }else{
                        return res.status(200).send({
                            error: false, 
                            message: `Data berita untuk ${email}`,
                            data: rows2
                        })
                    }
                })
            } else{
                let rs = 3;
                let polisi = 3;
                let kebakaran = 3;
                var body = JSON.stringify({
                    "title" : all_title
                })
                const options = {
                    hostname: 'news-api-d3qwx4cb6q-as.a.run.app',
                    path: '/news',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': body.length
                    },
                };
                    
                const req = https.request(options, (res2) => {
                    let data = ''
                     
                    res2.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res2.on('end', () => {
                        const result = JSON.parse(data).result
                        if(result == 'rumah sakit'){
                            rs = 8
                        } else if(result == 'polisi'){
                            polisi = 8
                        } else{
                            kebakaran = 8;
                        }
                        const news_query = `SELECT * FROM
                        ((SELECT news_id, title, author, category, image FROM news
                        WHERE category = "kebakaran"
                        ORDER BY rand()
                        LIMIT ${kebakaran})
                        UNION
                        (SELECT news_id, title, author, category, image FROM news
                        WHERE category = "polisi"
                        ORDER BY rand()
                        LIMIT ${polisi})
                        UNION
                        (SELECT news_id, title, author, category, image FROM news
                        WHERE category = "rumah sakit"
                        ORDER BY rand()
                        LIMIT ${rs})) AS t
                        ORDER BY rand()`
                        con.query(news_query, (err, rows2, field) => {
                            if(err){
                                return res.status(500).send({error: true, message: err.sqlMessage})
                            }else{
                                return res.status(200).send({
                                    error: false, 
                                    message: `Data berita untuk ${email}`,
                                    data: rows2
                                })
                            }
                        })
                    });
                       
                })
                req.write(body);
                req.end();
    
                req.on('error', function(e) {
                console.error(e);
                });
                
    
    
    
    
    
                
            }
        }
    })
})

router.post("/news/:news_id", authenticateToken, (req, res) => {
    const {email} = req.body
    const news_id = req.params.news_id
    const query = `INSERT INTO history(email, news_id) VALUES(?, ${news_id}); 
    SELECT * FROM news WHERE news_id =  ${news_id}`
    con.query(query, [email], (err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage, code: err.errno})
        }else{
            res.status(200).send({
                error: false, 
                message: `History telah ditambahkan dan pengambilan berita sukses`,
                data: rows[1]
            })
        }
    })
})

router.get("/all_news", authenticateToken, (req, res) => {
    const query = "SELECT news_id, title, author, category, image FROM news ORDER BY upload_date DESC"
    con.query(query, (err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage})
        }else{
            res.status(200).send({
                error: false, 
                message: `Pengambilan berita sukses`,
                data: rows
            })
        }
    })
})

router.post("/register", async(req, res) => {
    const {email, username, password} = req.body
    if(password.length < 8){
        return res.status(500).send({error: true, message: "Password minimal terdiri atas 8 karakter"})
    }
    const query = "INSERT INTO account(user_id, email, username, password) values(CONCAT('user-', md5(?)), ?, ?, ?)"
    const hash = await bcrypt.hash(password, 10)
    con.query(query, [email, email, username, hash], (err, rows, field) => {
        if(err){
            if(err.code === "ER_DUP_ENTRY"){
                res.status(500).send({error: true, message: "Email sudah terdaftar"})
            } else{
                res.status(500).send({error: true, message: err.sqlMessage})
            }
        } else{
            res.status(200).send({error: false, message: `Data ${username} telah dimasukkan`})
        }
    })
})

router.post("/login", (req, res) => {
    const {email, password} = req.body
    const query = "SELECT * FROM account WHERE email = ?"
    con.query(query, [email], async(err, rows, field) => {
        if(err){
            res.status(500).send({error: true, message: err.sqlMessage})
        } else if(rows.length == 0){
            res.status(500).send({error: true, message: "Data tidak ditemukan"})
        } else{
            console.log(rows[0].password)
            const isMatch = await bcrypt.compare(password, rows[0].password)
            if(isMatch){
                const user = {email: email, name: rows[0].username}
                const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                res.status(200).send({
                    error: false, 
                    message: `Login ${email} berhasil`,
                    data: {
                        user_id: rows[0].user_id,
                        email: rows[0].email,
                        name: rows[0].username,
                        token: access_token
                    }
                })
            } else{
                res.status(200).send({error: true, message: `Password Salah`})
            }
        }
    })

})

module.exports = router