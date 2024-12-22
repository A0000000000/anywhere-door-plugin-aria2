import axios from 'axios'
import Koa from 'koa'
import Router from 'koa-router'
import constant from './constant.js'
import cmdConstant from './cmd_constant.js'

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
    host = constant.DEFAULT_HOST
}
if (port == null) {
    port = constant.DEFAULT_PORT
}
if (prefix == null) {
    prefix = constant.DEFAULT_PREFIX
}
if (username == null) {
    username = constant.DEFAULT_USERNAME
}
if (token == null) {
    token = constant.DEFAULT_TOKEN
}
if (pluginName == null) {
    pluginName = constant.DEFAULT_PLUGIN_NAME
}
if (aria2Rpc == null) {
    aria2Rpc = constant.DEFAULT_ARIA2_RPC
}
if (aria2Token == null) {
    aria2Token = constant.DEFAULT_ARIA2_TOKEN
}


router.post(constant.PLUGIN_URL, ctx => {
    let _token = ctx.request.headers.token
    ctx.req.on(constant.EVENT_DATA, data => {
        let params = JSON.parse(data)
        let name = params[constant.PARAMS_NAME]
        let target = params[constant.PARAMS_TARGET]
        let raw = params[constant.PARAMS_DATA]

        if (target !== pluginName) {
            return ctx.response.body = JSON.stringify({
                code: constant.ERROR_CODE_NOT_THIS_PLUGIN,
                message: constant.ERROR_MESSAGE_NOT_THS_PLUGIN
            })
        }

        if (_token !== token) {
            return ctx.response.body = JSON.stringify({
                code: constant.ERROR_CODE_TOKEN_INVALID,
                message: constant.ERROR_MESSAGE_TOKEN_INVALID
            })
        }

        processCommand(name, raw)

        ctx.response.body = JSON.stringify({
            code: constant.ERROR_CODE_SUCCESS,
            message: constant.ERROR_MESSAGE_SUCCESS
        })
    })
})

function processCommand(source, rawCmd) {
    const cmds = rawCmd.split(' ')
    if (cmds.length >= 1) {
        const method = cmds[0]
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = pluginName
        switch (method) {
            case 'addUri':
                body[cmdConstant.METHOD] = 'aria2.addUri'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds.slice(1)]
                break
            case 'getGlobalStat':
                body[cmdConstant.METHOD] = 'aria2.getGlobalStat'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`]
                break
            // Todo: 完善其他命令

            default:
                sendRequest(source, cmdConstant.RESULT_NO_SUCH_CMD)
                return
        }
        axios.post(aria2Rpc, body)
            .then(resp => {
                console.log(resp.data)
                // Todo: 优化输出格式
                sendRequest(source, JSON.stringify(resp.data))
        }).catch(err => {
            console.log(err)
            sendRequest(source, err.toString())
        })
    } else {
        sendRequest(source, cmdConstant.RESULT_PARAMS_ERROR)
    }
}

function sendRequest(target, data) {
    const url = constant.REQUEST_URL(host, port, prefix)
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