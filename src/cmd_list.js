import constant from './constant.js'
import cmdConstant from './cmd_constant.js'
import axios from 'axios'
import fs from 'fs'

export default {
    'help': async function (config, cmds, extend) {
        return await new Promise((resolve, reject) => {
            fs.readFile('src/help', 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    },
    'getGlobalStat': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        body[cmdConstant.METHOD] = 'aria2.getGlobalStat'
        body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        const downloadSpeed = resp.data.result['downloadSpeed']
        const uploadSpeed = resp.data.result['uploadSpeed']
        const numActive = resp.data.result['numActive']
        const numWaiting = resp.data.result['numWaiting']
        const numStopped = resp.data.result['numStopped']
        const numStoppedTotal = resp.data.result['numStoppedTotal']
        return `Aria2 全局信息\n总体下载速度: ${downloadSpeed} B/s\n总体上传速度: ${uploadSpeed} B/s\n活动下载数量: ${numActive}\n等待下载数量: ${numWaiting}\n停止下载数量: ${numStopped}\n已停止下载数量: ${numStoppedTotal}`
    },
    'addUri': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.addUri'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, [cmds[1]]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return `Aria2 下载任务创建成功!\n任务id: ${resp.data['result']}`
    },
    'remove': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.remove'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return `Aria2 移除下载任务成功!\n任务id: ${resp.data['result']}`
    },
    'pause': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.pause'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return `Aria2 暂停下载任务成功!\n任务id: ${resp.data['result']}`
    },
    'unpause': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.unpause'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return `Aria2 取消暂停任务成功!\n任务id: ${resp.data['result']}`
    },
    'tellStatus': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.tellStatus'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        const gid = resp.data.result['gid']
        const status = resp.data.result['status']
        const totalLength = resp.data.result['totalLength']
        const completedLength = resp.data.result['completedLength']
        return `任务信息\n任务id: ${gid}\n任务状态: ${status}\n下载的总长度: ${totalLength} B\n已下载的长度: ${completedLength} B`
    },
    'tellActive': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        body[cmdConstant.METHOD] = 'aria2.tellActive'
        body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        let data = 'Active 任务列表\n'
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
        return data
    },
    'tellWaiting': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        body[cmdConstant.METHOD] = 'aria2.tellWaiting'
        if (cmds.length < 2) {
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, 10]
        } else {
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, Number(cmds[1])]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        let data = 'Waiting 任务列表\n'
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
        return data
    },
    'tellStopped': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        body[cmdConstant.METHOD] = 'aria2.tellStopped'
        if (cmds.length < 2) {
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, 10]
        } else {
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, 0, Number(cmds[1])]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        let data = 'Stopped 任务列表\n'
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
        return data
    },
    'purgeDownloadResult': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        body[cmdConstant.METHOD] = 'aria2.purgeDownloadResult'
        body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`]
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return resp.data.result
    },
    'removeDownloadResult': async function (config, cmds, extend) {
        const body = {}
        body[cmdConstant.JSON_RPC] = cmdConstant.JSON_RPC_VERSION
        body[cmdConstant.ID] = extend[constant.PLUGIN_NAME]
        if (cmds.length < 2) {
            return cmdConstant.RESULT_CMD_PARAMS_ERROR
        } else {
            body[cmdConstant.METHOD] = 'aria2.removeDownloadResult'
            body[cmdConstant.PARAMS] = [`${cmdConstant.TOKEN}:${extend[cmdConstant.TOKEN]}`, cmds[1]]
        }
        const resp = await axios.post(extend[cmdConstant.JSON_RPC], body)
        return resp.data.result
    }
}