# teamlead-hide

## Как запустить приложение в режиме разработки?

```bash
LOCAL_BASE_URL=<Your ngrok tunnel URL> DB_CONNECTION_STRING=<URL тестовой базы данных> PORT=<порт, на котором запущен ngrok> npm run start
```

## Ссылка на swagger-hide.json:

<https://yakravtsova.github.io/swagger-hide/swagger-hide.json>

## Как просмотреть описание API?

Если приложение запущено в режиме разработки, описание доступно по адресу <https://your-ngrok-tunnel-url/swagger-hide/>.

Если приложение не запущено, перейдите на сайт <https://generator.swagger.io/>, вставьте ссылку на json-файл в строку, нажмите "Explore".
