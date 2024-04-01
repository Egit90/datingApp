build-angular:
	@ cd ./client && ng build

build-api:
	@ cd ./API && docker build -t egit90/datingapp .

build-all: build-angular build-api

.PHONY: build-angular build-api build-all