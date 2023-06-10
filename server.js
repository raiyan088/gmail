require('events').EventEmitter.prototype._maxListeners = 100
const bodyParser = require('body-parser')
const express = require('express')
const request = require('request')

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(process.env.PORT || 3000, ()=> {
    console.log("Listening on port 3000...")
})


app.get('/', async function (req, res) {
    res.end('Gmail Server')
})

app.get('/ip', async function (req, res) {
    request({
        url: 'https://ifconfig.me/ip'
    }, function (error, response, body) {
        if (error) {
            res.end('0.0.0.0')
        } else {
            res.end(body.toString())
        }
    })
})

app.post('/', async function (req, res) {
    if(req.body) {
        try {
            let mData = req.body

            request({
                url: 'https://accounts.google.com/_/signup/'+mData['url'],
                method: 'POST',
                headers: getHeader(mData['cookies'], mData['user']),
                gzip: true,
                body: getPostBody(mData['fReq'], mData['azt'], mData['id'])
            }, function (error, response, body) {
                if (error) {
                    res.end(JSON.stringify({ 'status': 'ERROR' }))
                } else {
                    if (body.includes('"er"')) {
                        res.end(JSON.stringify({ 'status': 'ERROR' }))
                    } else {
                        let cookies = response.headers['set-cookie']
                        let hostGPS = null
                        
                        for (let i = 0; i < cookies.length; i++) {
                            let data = cookies[i]
                            if (data.startsWith('__Host-GAPS=')) {
                                hostGPS = data.substring(12, data.indexOf(';'))
                            }
                        }

                        if (hostGPS) {
                            res.end(JSON.stringify({ 'status': 'SUCCESS', 'gps': hostGPS }))
                        } else {
                            res.end(JSON.stringify({ 'status': 'SUCCESS' }))
                        }
                    }
                }
            })
        } catch (e) {
            console.log(e)
            res.end(JSON.stringify({ 'status': 'ERROR' }))
        }
    } else {
        res.end(JSON.stringify({ 'status': 'ERROR' }))
    }
})

function getPostBody(fReq, azt, device) {
    return 'canFrp=1&cc=bd&hl=en-US&source=android&continue=https%3A%2F%2Faccounts.google.com%2Fo%2Fandroid%2Fauth%3Flang%3Den%26cc%26langCountry%3Den_%26xoauth_display_name%3DAndroid%2BDevice%26tmpl%3Dnew_account%26source%3Dandroid%26return_user_id%3Dtrue&'+fReq+'&azt='+azt+'&dgresponse=%5Bnull%2C%22%2F_%2Fsignup%2Fvalidatebasicinfo%22%2C3%2C0%5D&cookiesDisabled=false&deviceinfo=%5B%22'+device+'%22%2C23%2C8703000%2C%5B%5D%2C1%2C%22BD%22%2Cnull%2Cnull%2Cnull%2C%22EmbeddedSetupAndroid%22%2Cnull%2C%5B0%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C7%2Cnull%2Cnull%2C%5B%5D%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5D%5D%2Cnull%2Cnull%2Cnull%2Cnull%2C0%2Cnull%2C0%2C2%2C%22%22%2Cnull%2C1%2C0%2C0%5D&gmscoreversion=8703000&'
}


function getHeader(cookies, user) {
    return {
        'Host': 'accounts.google.com',
        'X-Same-Domain': '1',
        'Google-Accounts-Xsrf': '1',
        'User-Agent': user,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': '*/*',
        'Origin': 'https://accounts.google.com',
        'X-Requested-With': 'com.google.android.gms',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': cookies
    }
}
