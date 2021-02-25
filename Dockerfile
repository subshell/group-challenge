# Go 
FROM golang:1.16-alpine AS go-builder
RUN apk add --no-cache make upx

WORKDIR /app 
COPY api .
RUN make go-build-for-docker

#########

# React Frontend
FROM node:15.10-alpine AS react-builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm ci --silent
COPY frontend .
RUN npm run build

#########

# Executable
FROM alpine
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=go-builder /app/group-challenge .
COPY --from=react-builder /app/build/ ./static

ENV GIN_MODE=release
CMD [ "./group-challenge" ]
