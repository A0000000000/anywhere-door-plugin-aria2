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
        if (method === 'help') {
            const help = `Aria2 指令帮助\n1. getGlobalStat: 获取Aria2全局状态\n2. addUri url: 根据指定下载地址, 添加一条下载任务\n3. remove guid: 移除指定id的下载任务\n4. pause guid: 暂停指定id的下载任务\n5. unpause guid: 取消暂停指定id的下载任务\n6. tellStatus guid: 获取某个id对应的任务详情\n7. tellActive: 获取活跃任务列表信息\n8. tellWaiting [count]: 获取指定数量的暂停任务详情, 默认为10\n9. tellStopped [count]: 获取指定数量的停止任务详情, 默认为10\n10. purgeDownloadResult: 清理已停止任务\n11. removeDownloadResult guid: 清理指定已停止任务`
            sendRequest(source, help)
            return
        }
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = pluginName
        switch (method) {
            case 'getGlobalStat':
                body[cmdConstant.METHOD] = 'aria2.getGlobalStat'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`]
                break
            case 'addUri':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.addUri'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, [cmds[1]]]
                }
                break
            case 'remove':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.remove'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds[1]]
                }
                break
            case 'pause':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.pause'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds[1]]
                }
                break
            case 'unpause':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.unpause'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds[1]]
                }
                break
            case 'tellStatus':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.tellStatus'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds[1]]
                }
                break
            case 'tellActive':
                body[cmdConstant.METHOD] = 'aria2.tellActive'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`]
                break
            case 'tellWaiting':
                body[cmdConstant.METHOD] = 'aria2.tellWaiting'
                if (cmds.length < 2) {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, 0, 10]
                } else {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, 0, Number(cmds[1])]
                }
                break
            case 'tellStopped':
                body[cmdConstant.METHOD] = 'aria2.tellStopped'
                if (cmds.length < 2) {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, 0, 10]
                } else {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, 0, Number(cmds[1])]
                }
                break
            case 'purgeDownloadResult':
                body[cmdConstant.METHOD] = 'aria2.purgeDownloadResult'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`]
                break
            case 'removeDownloadResult':
                if (cmds.length < 2) {
                    sendRequest(source, cmdConstant.RESULT_CMD_PARAMS_ERROR)
                    return
                } else {
                    body[cmdConstant.METHOD] = 'aria2.removeDownloadResult'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${aria2Token}`, cmds[1]]
                }
                break
            default:
                sendRequest(source, cmdConstant.RESULT_NO_SUCH_CMD)
                return
        }
        axios.post(aria2Rpc, body)
            .then(resp => {
                console.log(resp.data)
                let data = cmdConstant.RESULT_NO_SUCH_CMD
                switch (method) {
                    case 'getGlobalStat':
                        const downloadSpeed = resp.data.result['downloadSpeed']
                        const uploadSpeed = resp.data.result['uploadSpeed']
                        const numActive = resp.data.result['numActive']
                        const numWaiting = resp.data.result['numWaiting']
                        const numStopped = resp.data.result['numStopped']
                        const numStoppedTotal = resp.data.result['numStoppedTotal']
                        data = `Aria2 全局信息\n总体下载速度: ${downloadSpeed} B/s\n总体上传速度: ${uploadSpeed} B/s\n活动下载数量: ${numActive}\n等待下载数量: ${numWaiting}\n停止下载数量: ${numStopped}\n已停止下载数量: ${numStoppedTotal}`
                        break
                    case 'addUri':
                        data = `Aria2 下载任务创建成功!\n任务id: ${resp.data['result']}`
                        break
                    case 'remove':
                        data = `Aria2 移除下载任务成功!\n任务id: ${resp.data['result']}`
                        break
                    case 'pause':
                        data = `Aria2 暂停下载任务成功!\n任务id: ${resp.data['result']}`
                        break
                    case 'unpause':
                        data = `Aria2 取消暂停任务成功!\n任务id: ${resp.data['result']}`
                        break
                    case 'tellStatus':
                        const gid = resp.data.result['gid']
                        const status = resp.data.result['status']
                        const totalLength = resp.data.result['totalLength']
                        const completedLength = resp.data.result['completedLength']
                        data = `任务信息\n任务id: ${gid}\n任务状态: ${status}\n下载的总长度: ${totalLength} B\n已下载的长度: ${completedLength} B`
                        break
                    case 'tellActive':
                        data = 'Active 任务列表\n'
                        for (let i = 0; i < resp.data.result.length; i++) {
                            const item = resp.data.result[i]
                            const gid = item['gid']
                            const status = item['status']
                            const totalLength = item['totalLength']
                            const completedLength = item['completedLength']
                            data = data + `\n第${i+1}项任务\n任务id: ${gid}\n任务状态: ${status}\n下载的总长度: ${totalLength} B\n已下载的长度: ${completedLength} B`
                            if (i !== resp.data.result.length - 1) {
                                data = data + '\n'
                            }
                        }
                        break
                    case 'tellWaiting':
                        data = 'Waiting 任务列表\n'
                        for (let i = 0; i < resp.data.result.length; i++) {
                            const item = resp.data.result[i]
                            const gid = item['gid']
                            const status = item['status']
                            const totalLength = item['totalLength']
                            const completedLength = item['completedLength']
                            data = data + `\n第${i+1}项任务\n任务id: ${gid}\n任务状态: ${status}\n下载的总长度: ${totalLength} B\n已下载的长度: ${completedLength} B`
                            if (i !== resp.data.result.length - 1) {
                                data = data + '\n'
                            }
                        }
                        break
                    case 'tellStopped':
                        data = 'Stopped 任务列表\n'
                        for (let i = 0; i < resp.data.result.length; i++) {
                            const item = resp.data.result[i]
                            const gid = item['gid']
                            const status = item['status']
                            const totalLength = item['totalLength']
                            const completedLength = item['completedLength']
                            data = data + `\n第${i+1}项任务\n任务id: ${gid}\n任务状态: ${status}\n下载的总长度: ${totalLength} B\n已下载的长度: ${completedLength} B`
                            if (i !== resp.data.result.length - 1) {
                                data = data + '\n'
                            }
                        }
                        break
                    case 'purgeDownloadResult':
                        data = resp.data.result
                        break
                    case 'removeDownloadResult':
                        data = resp.data.result
                        break
                    default:
                        data = cmdConstant.RESULT_NO_SUCH_CMD
                        break
                }
                sendRequest(source, data)
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