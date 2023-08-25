#!/bin/bash

main=$(node ./main.js) & ../../../../node_modules/mocha/bin/mocha.js --exit "*.test.js";
pid="$(lsof -i :3000 | grep node | awk '{print $2}')"
kill -n 9 $pid;