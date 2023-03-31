# osc-web-interface

## web interface

Dev

```sh
npm i
```

```sh
cp .env.example .env # Then edit the `.env` file.
```

```sh
HOST=0.0.0.0 npm start
```

private ipの取得(Mac)

```sh
ifconfig | grep "inet 192.168." | awk '{print $2}'
# 直接.envファイルに書き込みたい場合
echo -n REACT_APP_PRIVATE_IP= > .env && ifconfig | grep "inet 192.168." | awk '{print $2}' >> .env
```

## websocket server & osc sender

Dev

```sh
pipenv sync
```

```sh
pipenv run python websocket-osc.py
```

## state manager(websocket client)

```sh
pipenv run python state_manage.py
```
