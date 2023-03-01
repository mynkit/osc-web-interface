# osc-web-interface

## web interface

Dev

```sh
npm i
```

```sh
REACT_APP_PRIVATE_IP={private ip} HOST=0.0.0.0 npm start
```

private ipの取得(Mac)

```sh
ifconfig | grep "inet 192.168." | awk '{print $2}'
```

## websocket server & osc sender

Dev

```sh
pipenv sync
```

```sh
pipenv run python websocket-osc.py
```
