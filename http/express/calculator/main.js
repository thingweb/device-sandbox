const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { parseArgs } = require("node:util");
const { JsonPlaceholderReplacer } = require("json-placeholder-replacer");

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

let thingModel = JSON.parse(fs.readFileSync(path.join(__dirname, "calculator.tm.json"), { "encoding": "utf-8" }));

const placeholderReplacer = new JsonPlaceholderReplacer();
placeholderReplacer.addVariableMap({
    THING_NAME: thingName,
    PROPERTIES: PROPERTIES,
    ACTIONS: ACTIONS,
    EVENTS: EVENTS,
    HOSTNAME: hostname,
    PORT_NUMBER: portNumber
});
const thingDescription = placeholderReplacer.replace(thingModel);
thingDescription["@type"] = "Thing"


const reqParser = bodyParser.text({ type: "*/*" });

let result = 0;
let lastChange = "";

app.get(`/${thingName}`, (req, res) => {
    res.send(JSON.stringify(thingDescription));
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