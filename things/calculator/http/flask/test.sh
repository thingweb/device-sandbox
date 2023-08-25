#!/bin/bash

main=$(poetry run python ./main.py) & ../../../../node_modules/mocha/bin/mocha.js --exit "*.test.js";
pid="$(lsof -i :5000 | grep -i python | awk '{print $2}')"
kill -9 $pid;