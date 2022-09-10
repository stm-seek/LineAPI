const line = require('@line/bot-sdk')
const express = require('express')
const axios = require('axios').default
const dotenv = require('dotenv')
const mysql = require('mysql')
const cors = require('cors')

const env = dotenv.config().parsed
const app = express()

app.use(cors())

 
const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}


//create line client
const client = new line.Client(lineConfig)

app.post('/webhook', line.middleware(lineConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

const handleEvent = async (event) => {
    console.log('this is event from handleEvent => ', event)

    //get user profile id
    const UID = await client.getProfile(event.source.userId).then(profile => {
        return profile.userId
    })

    //get user profile name
    const UName = await client.getProfile(event.source.userId).then(profile => {
        return profile.displayName
    })

    //get user profile picture
    const UPic = await client.getProfile(event.source.userId).then(profile => {
        return profile.pictureUrl
    })


    if (event.type !== 'message' || event.message.type !== 'text') {
        return null;
    } else if (event.type === 'message' && event.message.type === 'text') {

        if (event.message.text === 'ลงทะเบียน') {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'ลงทะเบียน'
            })
        } else if (event.message.text === 'ชำระค่าบริการ') {
            //const rows = await axios.get(`http://localhost:3000/api/parent/${UID}`)

            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'ชำระค่าบริการ'
            })
        } else if (event.message.text === 'สรุปรายการ') {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'สรุปรายการ'
            })
        } else {
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'สวัสดีคุณ : ' + UName
            })
        }
    } else {
        return null
    }
}

app.use(express.json())

app.post('/push/message', async (req, res) => {
    const {
        user_child_id,
        name,
        date,
        token
    } = req.body

    try {
        client.pushMessage(user_child_id, {
            type: 'text',
            text: 'สวัสดีคุณ ' + name + ' ขอบคุณที่ลงทะเบียนกับเรา'
        })

        setTimeout(function() {
            greeting(user_child_id, name, date, token)
        }, 1000);
        
        console.log('this is user_child_id => ', user_child_id)
        return res.status(200).send('OK')

    } catch (err) {
        console.log(err)
        return res.status(500).send('Error to push message')
    }
})

function greeting(uid, name, date, token) {
    //const user_id = "Ub8964ea0adaaea3ab31f5445693dd8a3"
    //const user_id = "U3baae0eaaf4ce9c57dedcba5984021a2"

    try {
        client.pushMessage(uid, {
            "type": "flex",
            "altText": "ขอบคุณที่ลงทะเบียน",
            "contents": {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": "https://scontent.fbkk28-1.fna.fbcdn.net/v/t39.30808-6/293618700_589799195841764_5664771749612573522_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=09cbfe&_nc_eui2=AeFG-5YvnjsHMF6ya-VqwcoNq_bwHXYUgEur9vAddhSASxw6LCzdgyLed5oGu5UFXEH8NIQ345UQneMNQPwoWgry&_nc_ohc=9cwXFw77c9YAX8wchga&_nc_ht=scontent.fbkk28-1.fna&oh=00_AT_9K540WKxlC3XxkJvg13733i2Ax5dE3PlgfU0DIE5fxQ&oe=6312731B",
                  "size": "full",
                  "aspectRatio": "20:13",
                  "aspectMode": "cover",
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "md",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ขอบคุณที่ลงทะเบียน",
                      "weight": "bold",
                      "size": "xl",
                      "align": "start",
                      "gravity": "center",
                      "wrap": true,
                      "contents": []
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "margin": "lg",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "ชื่อ",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": name,
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "สถานที่",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": "โรงเรียนละอออุทิศ",
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "วันที่",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": `${date}`,
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "margin": "xxl",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "image",
                          "url": `https://api.qrserver.com/v1/create-qr-code/?data=${token}&amp;size=150x150`,
                          "size": "xl",
                          "aspectMode": "cover"
                        },
                        {
                          "type": "text",
                          "text": "กรุณานำ QR code นี้มาแสดงเพื่อรับ ริสแบนด์",
                          "size": "xs",
                          "color": "#AAAAAA",
                          "margin": "xxl",
                          "wrap": true,
                          "contents": []
                        }
                      ]
                    }
                  ]
                }
              }
          })
    }catch (err){
        console.log('Error to push message greeting')
    }
}

function fuck() {
    const id = 'Uf1eed7a6fe4dea234737975170937c6f';
    client.pushMessage(id, {
        type: 'text',
        text: 'ควยอะ'
    })
}

app.listen(4000, () => {
    //greeting();
    //fuck();
    console.log('server is running on port 4000')
})


//!database zone

const connection = mysql.createConnection({
    host: env.HOST,
    user: env.USER,
    password: env.PASSWORD,
    database: env.DATABASE,
    post: env.PORT
})

try {
    connection.connect(err => {
        if (err) {
            console.log('Error to connect database => ', err)
            return;
        }
        console.log('Mysql connected')

    })
}catch (err) {
    console.log('Error : ', err)
}

//create router
app.post('/create/parent', async (req, res) => {
    const {
        name,
        phone,
        line_user_id,
        token
    } = req.body

    try {
        connection.query(
            "INSERT INTO parent (name, phone, line_user_id, token) VALUES (?, ?, ?, ?)",
            [name, phone, line_user_id, token],
            (err, result, fields) => {
                if (err) {
                    console.log('Error to create parent => ', err)
                    return res.status(400).send('Error while insert parent')
                }

                return res.status(201).json({
                    message: 'Create parent success'
                })
            }
        )
    } catch (err) {
        console.log(err)
        return res.status(500).send('Error to create parent')
    }
})

// create user
app.post('/create/user', async (req, res) => {
    const {
        rfid,
        firstName,
        lastName,
        age,
        level,
        moneyUse,
        parentName,
    } = req.body

    try {
        connection.query(
            `INSERT INTO user (rfid, firstName, lastName,age, level, moneyUse, parent_parentID) VALUES (?, ?, ?, ?, ?, ?, (SELECT parentID FROM parent WHERE name = '${parentName}'))`,
            [rfid, firstName, lastName, age, level, moneyUse],
            (err, result, fields) => {
                if (err) {
                    console.log('Error to create parent => ', err)
                    return res.status(400).send('Error while insert parent')
                }

                return res.status(201).json({
                    message: 'Create user success'
                })
            }
        )
    } catch (err) {
        console.log(err)
        return res.status(500).send('Error to create parent')
    }
})

//read single parent
app.post('/read/single', async (req, res) => {
    const parentID = req.body.parentID

    try {
        connection.query(
            "SELECT * FROM parent WHERE parentID = ?",
            [parentID],
            (err, result, fields) => {
                if (err) {
                    console.log('Error to get data => ', err)
                    return res.status(400).send('Error while get data')
                }

                return res.status(200).json(result)
            }
        )
    } catch (err) {
        console.log(err)
        return res.status(500).send('Error to get data')
    }
})

//push message to line
app.post('/api/push/message', async (req, res) => {
    const parentID = req.body.parentID

    try {
        connection.query(
            "SELECT line_user_id FROM parent WHERE parentID = ?",
            [parentID],
            (err, result, fields) => {
                if (err) {
                    console.log('Error to get data => ', err)
                    return res.status(400).send('Error while get data')
                }
                
                axios.post("http://localhost:4000/push/message", {
                    user_child_id: result[0].line_user_id
                })

                return res.status(200).json(result[0].line_user_id)
            }
        )

    } catch (err) {
        console.log(err)
        return res.status(500).send('Error to get data')
    }
})

app.post('/sql', (req, res) => {
    const sql = req.body.sql

    try {
        connection.query(`${sql}`, (err, result, fields) => {
            if (err) {
                console.log("Error sql : ", err)
                return res.status(400).send('Error to query');
            }

            console.log("Success to qeury: ", result)
            return res.status(200).send(`Success to qeury`);
        })
    } catch (err) {

    }
})

