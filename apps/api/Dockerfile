FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o /api .

FROM alpine:3.21
RUN apk add --no-cache libc6-compat
COPY --from=builder /api /api
EXPOSE 8080
CMD ["/api"]
