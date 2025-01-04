import axios from 'axios'
import Koa from 'koa'
import Router from 'koa-router'
import constant from './constant.js'
import cmdConstant from './cmd_constant.js'
import fs from "fs"

async function processCommand(axiosControlPlane, raw, extend) {
    const cmds = raw.split(' ')
    if (cmds.length >= 1) {
        const method = cmds[0]
        if (method === 'help') {
            return await new Promise((resolve, reject) => {
                fs.readFile('src/help', 'utf8', (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            })
        }
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[cmdConstant.ID]
        switch (method) {
            case 'getGlobalStat':
                body[cmdConstant.METHOD] = 'aria2.getGlobalStat'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
                break
            case 'addUri':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.addUri'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, [cmds[1]]]
                }
                break
            case 'remove':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.remove'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
                }
                break
            case 'pause':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.pause'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
                }
                break
            case 'unpause':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.unpause'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
                }
                break
            case 'tellStatus':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.tellStatus'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
                }
                break
            case 'tellActive':
                body[cmdConstant.METHOD] = 'aria2.tellActive'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
                break
            case 'tellWaiting':
                body[cmdConstant.METHOD] = 'aria2.tellWaiting'
                if (cmds.length < 2) {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, 10]
                } else {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, Number(cmds[1])]
                }
                break
            case 'tellStopped':
                body[cmdConstant.METHOD] = 'aria2.tellStopped'
                if (cmds.length < 2) {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, 10]
                } else {
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, Number(cmds[1])]
                }
                break
            case 'purgeDownloadResult':
                body[cmdConstant.METHOD] = 'aria2.purgeDownloadResult'
                body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
                break
            case 'removeDownloadResult':
                if (cmds.length < 2) {
                    return cmdConstant.RESULT_CMD_PARAMS_ERROR
                } else {
                    body[cmdConstant.METHOD] = 'aria2.removeDownloadResult'
                    body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
                }
                break
            default:
                return cmdConstant.RESULT_NO_SUCH_CMD
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        let data = cmdConstant.RESULT_NO_SUCH_CMD
        switch (method) {
            case 'getGlobalStat':
                const downloadSpeed = resp.data.result['downloadSpeed']
                const uploadSpeed = resp.data.result['uploadSpeed']
                const numActive = resp.data.result['numActive']
                const numWaiting = resp.data.result['numWaiting']
                const numStopped = resp.data.result['numStopped']
                const numStoppedTotal = resp.data.result['numStoppedTotal']
                return `Aria2 全局信息\n总体下载速度: ${downloadSpeed} B/s\n总体上传速度: ${uploadSpeed} B/s\n活动下载数量: ${numActive}\n等待下载数量: ${numWaiting}\n停止下载数量: ${numStopped}\n已停止下载数量: ${numStoppedTotal}`
            case 'addUri':
                return `Aria2 下载任务创建成功!\n任务id: ${resp.data['result']}`
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
        return data
    } else {
        return cmdConstant.RESULT_PARAMS_ERROR
    }
}

async function sendRequest(axiosControlPlane, pluginName, target, data) {
    return await axiosControlPlane.post(constant.PLUGIN_URL, {
        name: pluginName,
        target: target,
        data: data
    })
}

function main() {
    // 加载环境变量
    const host = process.env.HOST
    const port = process.env.PORT
    const prefix = process.env.PREFIX || ''
    const username = process.env.USERNAME
    const token = process.env.TOKEN
    const pluginName = process.env.PLUGIN_NAME
    const aria2Rpc = process.env.ARIA2_RPC
    const aria2Token = process.env.ARIA2_TOKEN

    // 控制平面交互
    const axiosControlPlane = axios.create({
        baseURL: constant.CONTROL_PLANE_BASE_REQUEST_URL(host, port, prefix),
        headers: {
            token, username
        }
    })

    const app = new Koa()
    const router = new Router()
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
            const extend = {}
            extend[cmdConstant.JSON_RPC] = aria2Rpc
            extend[cmdConstant.ID] = pluginName
            extend[cmdConstant.TOKEN] = aria2Token
            processCommand(axiosControlPlane, raw, extend).then(data => {
                sendRequest(axiosControlPlane, pluginName, target, data).then(res => {
                    console.log(res)
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            ctx.response.body = JSON.stringify({
                code: constant.ERROR_CODE_SUCCESS,
                message: constant.ERROR_MESSAGE_SUCCESS
            })
        })
    })
    app.use(router.routes()).use(router.allowedMethods())
    app.listen(80)
}

main()