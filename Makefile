.PHONY: test lint build run

test:
	cd apps/api && go test ./...

lint:
	cd apps/api && golangci-lint run

build:
	cd apps/api && go build -o ../../bin/api .

run:
	cd apps/api && go run .
