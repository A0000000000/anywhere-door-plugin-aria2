# anywhere-door-plugin-aria2
* AnywhereDoorPlugin Aria2实现

## 环境变量
* HOST: 控制平面地址
* PORT: 控制平面端口
* PREFIX: 控制平面前缀
* USERNAME: plugin所属用户名称
* TOKEN: plugin令牌
* PLUGIN_NAME: plugin名称
* ARIA2_RPC: aria2 jsonrpc地址
* ARIA2_TOKEN: aria2令牌

## 打包方式
1. 将代码clone下来
2. 安装docker及buildx
3. 打包镜像
   * `docker buildx build --platform linux/amd64 -t 192.168.25.5:31100/maoyanluo/anywhere-door-plugin-aria2:1.0 . --load`

## 部署方式

### Docker Command Line
1. 运行容器
   * `docker run --name anywhere-door-plugin-aria2 -itd -p 8083:80 -e HOST=ip -e PORT=port -e USERNAME=username -e TOKEN=token -e PLUGIN_NAME=aria2 -e ARIA2_RPC=rpc_address -e ARIA2_TOKEN=rpc_token --restart=always 192.168.25.5:31100/maoyanluo/anywhere-door-plugin-aria2:1.0`

### Kubernetes
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: anywhere-door-plugin-aria2-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: anywhere-door-plugin-aria2
  template:
    metadata:
      labels:
        app: anywhere-door-plugin-aria2
    spec:
      containers:
      - name: anywhere-door-plugin-aria2
        image: 192.168.25.5:31100/maoyanluo/anywhere-door-plugin-aria2:1.0
        imagePullPolicy: IfNotPresent
        env:
        - name: HOST
          value: "anywhere-door-control-plane-service.anywhere-door"
        - name: PORT
          value: "80"
        - name: USERNAME
          value: username
        - name: TOKEN
          value: token
        - name: PLUGIN_NAME
          value: "aria2"
        - name: ARIA2_RPC
          value: rpc_address
        - name: ARIA2_TOKEN
          value: rpc_token
        ports:
        - containerPort: 80
      restartPolicy: Always
---
apiVersion: v1
kind: Service
metadata:
  name: anywhere-door-plugin-aria2-service
  labels:
    app: anywhere-door-plugin-aria2
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: anywhere-door-plugin-aria2
```

## 使用方法
1. 保证容器正常运行即可
2. 注册plugin: POST AnywhereDoorManager/plugin/create & Header: token: token & Body: { "plugin_name": "name", "plugin_describe": "desc", "plugin_host": "anywhere-door-plugin-aria2-service.anywhere-door", "plugin_port": 80, "plugin_token": "token" }