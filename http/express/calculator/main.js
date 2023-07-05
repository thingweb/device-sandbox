const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { parseArgs } = require("node:util");

const app = express();

const hostname = "localhost";
let portNumber = 3000;

const thingName = "http-express-calculator";
const PROPERTIES = "properties";
const ACTIONS = "actions";
const EVENTS = "events";

const { values: { port } } = parseArgs({
    options: {
        port: {
            type: "string",
            short: "p"
        }
    }
});

if (port && !isNaN(parseInt(port))) {
    portNumber = parseInt(port);
}

let thingDescription = fs.readFileSync(path.join(__dirname, "td.json"), { "encoding": "utf-8" });
thingDescription = thingDescription.replace(/THING_NAME/g, thingName);
thingDescription = thingDescription.replace(/PROPERTIES/g, PROPERTIES);
thingDescription = thingDescription.replace(/ACTIONS/g, ACTIONS);
thingDescription = thingDescription.replace(/EVENTS/g, EVENTS);
thingDescription = thingDescription.replace(/HOSTNAME/g, hostname);
thingDescription = thingDescription.replace(/PORT_NUMBER/g, portNumber);

const reqParser = bodyParser.text({ type: "*/*" });

let result = 0;
let lastChange = "";

app.get(`/${thingName}`, (req, res) => {
    res.send(thingDescription);
});

app.get(`/${thingName}/${PROPERTIES}/result`, (req, res) => {
    res.send(result.toString());
});

app.get(`/${thingName}/${PROPERTIES}/lastChange`, (req,res) => {
    res.send(lastChange);
});

app.post(`/${thingName}/${ACTIONS}/add`, reqParser, (req, res) => {
    const parsedInput = parseInt(req.body);

    if (isNaN(parsedInput)) {
        res.status(400).send("Input should be a valid integer");
    } else {
        result += parsedInput;
        lastChange = (new Date()).toLocaleTimeString();
        res.send(result.toString());
    }
});

app.post(`/${thingName}/${ACTIONS}/subtract`, reqParser, (req, res) => {
    const parsedInput = parseInt(req.body);

    if (isNaN(parsedInput)) {
        res.status(400).send("Input should be a valid integer");
    } else {
        result -= parsedInput;
        lastChange = (new Date()).toLocaleTimeString();
        res.send(result.toString());
    }
});

app.get(`/${thingName}/${EVENTS}/change`, (req, res) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");

    let oldResult = result
    const changeInterval = setInterval(() => {
        if (oldResult !== result) {
            res.write(`result: ${result}\n\n`);
            oldResult = result;
        }
    }, 1000);

    res.on("finish", () => {
        clearInterval(changeInterval);
    })
})

app.listen(portNumber, () => {
    console.log(`Http thing listening on port ${portNumber}`);
});