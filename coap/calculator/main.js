const { parseArgs } = require("node:util");
const coap = require("coap");
const fs = require("fs");
const path = require("path");
const { JsonPlaceholderReplacer } = require("json-placeholder-replacer");

const server = coap.createServer();
const hostname = "localhost";
let portNumber = 5683;

const thingName = "coap-calculator";
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

let thingModel = JSON.parse(fs.readFileSync(path.join(__dirname, "tm.json"), { "encoding": "utf-8" }));

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


let result = 0;

server.on('request', (req, res) => {
  const segments = req.url.split('/');

  if (segments[1] !== thingName) {
    res.code = 404;
    res.end("Thing does not exist!");
  }

  if (!segments[2]) {
    if (req.method === "GET") {
        res.end(JSON.stringify(thingDescription));
    }
  }

  if (segments[2] === "properties") {
    if (segments[3] === "result") {
        if (req.method === "GET") {
            res.end(result.toString());
        }
    }
  }

  if (segments[2] === "actions" && req.method === "POST") {
    if (segments[3] === "add") {
        const parsedInput = parseInt(req.payload.toString());

        if (isNaN(parsedInput)) {
            res.code = 400;
            res.end("Input should be a valid integer")
        } else {
            result += parsedInput;
            res.end(result.toString());
        }
    }
    
    if (segments[3] === "subtract") {
        const parsedInput = parseInt(req.payload.toString());

        if (isNaN(parsedInput)) {
            res.code = 400;
            res.end("Input should be a valid integer")
        } else {
            result -= parsedInput;
            res.end(result.toString());
        }
    }
  }

  if (segments[2] === "events" && req.method === "GET") {
    if (segments[3] === "change") {
        if (req.headers.Observe === 0) {
            console.log("Observing the change...");
            res.code = 205;

            let oldResult = result
            const changeInterval = setInterval(() => {
                res.write('stay connected!');
                if (oldResult !== result) {
                    res.write(`result: ${result}\n`);
                    oldResult = result;
                }
            }, 1000);

            res.on('finish', () => {
                clearInterval(changeInterval);
            });
        } else {
            res.end();
        }
    }
  }
})

server.listen(portNumber, () => {
    console.log(`Started listening to on port ${portNumber}...`);
})