# Go 
FROM golang:1.20-alpine AS go-builder
RUN apk add --no-cache upx

WORKDIR /app
COPY api .
RUN go mod download
RUN go build -o bin/group-challenge --tags release -ldflags "-s -w"
RUN upx bin/group-challenge

#########

# React Frontend
FROM node:18-alpine AS react-builder

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm ci --silent
COPY frontend .
RUN npm run build

#########

# Executable
FROM alpine:3.16
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=go-builder /app/bin/group-challenge .
COPY --from=react-builder /app/dist/ ./static

ENV GIN_MODE=release
CMD [ "./group-challenge" ]
