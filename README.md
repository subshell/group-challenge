# Group Challenge

## Start a postgreSQL

    docker-compose up

## Dockerimage

### API Configuration

Required path to the configuration file: `/app/config.yaml`. All env variables are prefixed with `GC_`, for example: `GC_SERVER_PORT`.

```yaml
server:
  port: 8080
  staticFilesDir: "./static"
db:
  user: postgres
  password: postgres # prefered method: use env variable GC_DB_PASSWORD
  database: postgres
  addr: "localhost:5432"
```
