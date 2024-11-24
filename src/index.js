import axios from 'axios'
import Koa from 'koa'
import Router from 'koa-router'

const app = new Koa();
const router = new Router();

let host = process.env.HOST
let port = process.env.PORT
let prefix = process.env.PREFIX
let username = process.env.USERNAME
let token = process.env.TOKEN
let pluginName = process.env.PLUGIN_NAME

let aria2Rpc = process.env.ARIA2_RPC
let aria2Token = process.env.ARIA2_TOKEN

if (host == null) {
    host = '192.168.25.7'
}
if (port == null) {
    port = '8081'
}
if (prefix == null) {
    prefix = ''
}
if (username == null) {
    username = 'maoyanluo'
}
if (token == null) {
    token = '1998'
}
if (pluginName == null) {
    pluginName = 'aria2'
}
if (aria2Rpc == null) {
    aria2Rpc = 'http://192.168.25.5:8080/aria2-rpc/jsonrpc'
}
if (aria2Token == null) {
    aria2Token = '09251205'
}


router.post('/plugin', ctx => {
    let _token = ctx.request.headers.token
    ctx.req.on('data', data => {
        let params = JSON.parse(data)
        let name = params['name']
        let target = params['target']
        let raw = params['data']

        if (target !== pluginName) {
            return ctx.response.body = JSON.stringify({
                code: 500,
                message: 'not this plugin'
            })
        }

        if (_token !== token) {
            return ctx.response.body = JSON.stringify({
                code: 500,
                message: 'token not valid'
            })
        }

        processCommand(name, raw)

        ctx.response.body = JSON.stringify({
            code: 200,
            message: 'success'
        })
    })
})

function processCommand(source, rawCmd) {
    const cmds = rawCmd.split(' ')
    if (cmds.length >= 1) {
        const method = cmds[0]
        cmds.slice(1)
        const body = {
            'jsonrpc': '2.0',
            'id': pluginName,
            'method': method,
            'params': [`token:${aria2Token}`, cmds.slice(1)]
        }
        axios.post(aria2Rpc, body)
            .then(resp => {
                console.log(resp.data)
                sendRequest(source, JSON.stringify(resp.data))
        }).catch(err => {
            console.log(err)
            sendRequest(source, err.toString())
        })

    } else {
        sendRequest(source, 'params error.')
    }
}

function sendRequest(target, data) {
    const url = `http://${host}:${port}${prefix}/plugin`
    axios.post(url, {
        name: pluginName,
        target: target,
        data: data
    }, {
        headers: {
            token,
            username
        }
    }).then(resp => {
        console.log(resp.data)
    }).catch(err => {
        console.log(err)
    })
}

app.use(router.routes()).use(router.allowedMethods())

app.listen(80)