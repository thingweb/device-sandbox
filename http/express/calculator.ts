import express from 'express';
import bodyParser from 'body-parser';
import { parseArgs } from 'node:util';

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

const thingDescription = {
    "@context": [
        "https://www.w3.org/2019/wot/td/v1",
        "https://www.w3.org/2022/wot/td/v1.1",
        {
            "@language": "en"
        }
    ],
    "@type": "Thing",
    title: `${thingName}`,
    description: "Natively Implemented Http Thing",
    securityDefinitions: {
        nosec_sc: {
            scheme: "nosec"
        }
    },
    security: [
        "nosec_sc"
    ],
        properties: {
        result: {
            type: "number",
            readOnly: true,
            writeOnly: false,
            observable: true,
            forms: [
                {
                    href: `http://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/result`,
                    contentType: "application/json",
                    op: [
                        "readproperty",
                        "observeproperty",
                        "unobserveproperty"
                    ]
                },
                {
                    href: `https://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/result`,
                    contentType: "application/json",
                    op: [
                        "readproperty",
                        "observeproperty",
                        "unobserveproperty"
                    ]
                }
            ]
        }
    },
    actions: {
        add: {
            input: {
                type: "number"
            },
            output: {
                type: "number"
            },
            forms: [
                {
                    href: `http://${hostname}:${portNumber}/${thingName}/${ACTIONS}/add`,
                    contentType: "application/json",
                    op: [
                        "invokeaction"
                    ]
                },
                {
                    href: `https://${hostname}:${portNumber}/${thingName}/${ACTIONS}/add`,
                    contentType: "application/json",
                    op: [
                        "invokeaction"
                    ]
                }
            ],
            idempotent: false,
            safe: false
        },
        subtract: {
            input: {
                type: "number"
            },
            output: {
                type: "number"
            },
            forms: [
                {
                    href: `http://${hostname}:${portNumber}/${thingName}/${ACTIONS}/subtract`,
                    contentType: "application/json",
                    op: [
                        "invokeaction"
                    ]
                },
                {
                    href: `https://${hostname}:${portNumber}/${thingName}/${ACTIONS}/subtract`,
                    contentType: "application/json",
                    op: [
                        "invokeaction"
                    ]
                }
            ],
            idempotent: false,
            safe: false
        }
    },
    events: {
        change: {
            data: {
                type: "string",
            },
            forms: [
                {
                    href: `http://${hostname}:${portNumber}/${thingName}/${EVENTS}/update`,
                    contentType: "application/json",
                    op: [
                        "subscribeevent",
                        "unsubscribeevent"
                    ]
                },
                {
                    href: `https://${hostname}:${portNumber}/${thingName}/${EVENTS}/update`,
                    contentType: "application/json",
                    op: [
                        "subscribeevent",
                        "unsubscribeevent"
                    ]
                }
            ]
        },
    }
};

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