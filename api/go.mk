GO         ?= go
LINTER     ?= golangci-lint
LDFLAGS    += -ldflags '-extldflags "-static" -s -w' # -s -w reduces binary size by removing some debug information
BUILDFLAGS += -installsuffix cgo --tags release

BUILD_PATH ?= $(shell pwd)
CMD = $(BUILD_PATH)/group-challenge
CMD_SRC = cmd/group-challenge/*.go

all: build lint

.PHONY: build test lint clean build

clean:
	rm -f $(CMD)

run:
	$(GO) run $(LDFLAGS) $(CMD_SRC) $(ARGS)

test:
	$(GO) test -v ./test/**/*.go -coverprofile cover.out

lint:
	$(GO) mod verify
	$(LINTER) run -v --no-config --deadline=5m

prepare:
	$(GO) mod download

build:
	$(GO) build -o $(CMD) -a $(BUILDFLAGS) $(LDFLAGS) $(CMD_SRC)
	upx $(CMD) # reduce binary size

build-for-docker:
	CGO_ENABLED=0 GOOS=linux $(GO) build -o $(CMD) -a $(BUILDFLAGS) $(LDFLAGS) $(CMD_SRC)
	upx $(CMD) # reduce binary size
