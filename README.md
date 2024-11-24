# anywhere-door-plugin-aria2
* AnywhereDoorPlugin Aria2实现

## 部署
1. 将代码clone下来
2. 安装docker及buildx
3. 打包镜像
   * `docker buildx build --platform linux/amd64 -t 192.168.25.5:31100/maoyanluo/anywhere-door-plugin-aria2:1.0 . --load`
4. 运行容器
   * `docker run --name anywhere-door-plugin-aria2 -itd -p 8083:80 -e HOST=192.168.25.7 -e PORT=8081 -e USERNAME=maoyanluo -e TOKEN=1998 -e PLUGIN_NAME=aria2 -e ARIA2_RPC=http://192.168.25.5:8080/aria2-rpc/jsonrpc -e ARIA2_TOKEN=09251205 192.168.25.5:31100/maoyanluo/anywhere-door-plugin-aria2:1.0`

## 环境变量
* HOST: 控制平面地址
* PORT: 控制平面端口
* PREFIX: 控制平面前缀
* USERNAME: plugin所属用户
* TOKEN: plugin令牌
* PLUGIN_NAME: plugin名称
* ARIA2_RPC: aria2 jsonrpc地址
* ARIA2_TOKEN: aria2令牌
