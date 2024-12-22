const DEFAULT_HOST = '192.168.25.7'
const DEFAULT_PORT = '8081'
const DEFAULT_PREFIX = ''
const DEFAULT_USERNAME = 'maoyanluo'
const DEFAULT_TOKEN = '1998'
const DEFAULT_PLUGIN_NAME = 'aria2'
const DEFAULT_ARIA2_RPC = 'http://192.168.25.5:8080/aria2-rpc/jsonrpc'
const DEFAULT_ARIA2_TOKEN = '09251205'

const PLUGIN_URL = '/plugin'

const EVENT_DATA = 'data'

const PARAMS_NAME = 'name'
const PARAMS_TARGET = 'target'
const PARAMS_DATA = 'data'

const ERROR_CODE_SUCCESS = 0
const ERROR_CODE_NOT_THIS_PLUGIN = -1
const ERROR_CODE_TOKEN_INVALID = -2

const ERROR_MESSAGE_SUCCESS = 'success'
const ERROR_MESSAGE_NOT_THS_PLUGIN = 'not this plugin'
const ERROR_MESSAGE_TOKEN_INVALID = 'token not valid'

const REQUEST_URL = (host, port, prefix) =>  `http://${host}:${port}${prefix}/plugin`

export default {
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_PREFIX,
    DEFAULT_USERNAME,
    DEFAULT_TOKEN,
    DEFAULT_PLUGIN_NAME,
    DEFAULT_ARIA2_RPC,
    DEFAULT_ARIA2_TOKEN,
    PLUGIN_URL,
    EVENT_DATA,
    PARAMS_NAME,
    PARAMS_TARGET,
    PARAMS_DATA,
    ERROR_CODE_SUCCESS,
    ERROR_CODE_NOT_THIS_PLUGIN,
    ERROR_CODE_TOKEN_INVALID,
    ERROR_MESSAGE_SUCCESS,
    ERROR_MESSAGE_NOT_THS_PLUGIN,
    ERROR_MESSAGE_TOKEN_INVALID,
    REQUEST_URL
}