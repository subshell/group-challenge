# Group Challenge

An easy-to-use website to create submission-based challenges that will be evaluated together in real-time.
Any user is allowed to create challenges with a fixed start and end date while others join and
contribute. Currently supported challenges are:

- 📸 **Photo Challenge**

## Local development

1. start a postgres db at port `5432`.

```sh
  docker-compose up
```

2. start the go api server at port `8080`.

```sh
  cd api && make go-run
```

3. start the frontend at port `3000`.

```sh
  cd frontend && npm start
```

## Run in Docker

The Dockerimage requires a config file `/app/config.yaml`. Env variables are also supported. They have a `GC_` prefix,
for example: `GC_SERVER_PORT`. The postgreSQL database is not part of the Dockerimage and has to be started separately.

```yaml
server:
  port: 8080
  staticFilesDir: "./static"
db:
  user: postgres
  password: postgres # prefered method: use env variable GC_DB_PASSWORD
  database: group_challenge
  host: "localhost:5432"
  poolSize: 50
  logQueries: false
challenges:
  liveParty:
    defaultTimePerSubmissionSeconds: 45
```

## Deploy to k8s with Helm

### Postgres DB Chart

Minimal `postgres-values.yaml` (see also: https://github.com/bitnami/charts/tree/master/bitnami/postgresql):

```sh
postgresqlDatabase: "group_challenge"
postgresqlPassword: postgres
postgresqlUsername: postgres
```

You definitely want to change the password using `global.postgresql.postgresqlPassword`.

### GroupChallenge Chart

```sh
helm install -f gc-values.yaml group-challenge <path-to-repo>/group-challenge/helm/group-challenge
```

## Run production build locally using docker-compose

1. Build the docker image locally:

```sh
docker build -t=local.test/group-challenge:latest .
```

2. `cd` into the `local` directory and run

```sh
docker-compose up
```

3. Open the browser at `http://localhost:8080`.
