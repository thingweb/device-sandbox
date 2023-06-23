import mqtt from "mqtt";
import { parseArgs } from 'node:util';

const hostname = "test.mosquitto.org";
let portNumber = 1883;

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


const PROPERTIES = "properties";
const ACTIONS = "actions";
const EVENTS = "events";

const thingName = "mqtt-thing"

const broker = mqtt.connect(`mqtt://${hostname}`, { port: portNumber });

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
    description: "Natively Implemented Coap Thing",
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
            readOnly: false,
            writeOnly: false,
            observable: true,
            forms: [
                {
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/result`,
                    contentType: "application/json",
                    op: [
                        "observeproperty",
                        "unobserveproperty"
                    ]
                }
            ]
        },
        isCool: {
            type: "boolean",
            readOnly: false,
            writeOnly: true,
            observable: true,
            forms: [
                {
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/isCool`,
                    contentType: "application/json",
                    op: [
                        "observeproperty",
                        "unobserveproperty"
                    ]
                },
                {
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/isCool/writeproperty`,
                    contentType: "application/json",
                    op: [
                        "writeproperty"
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
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${ACTIONS}/add`,
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
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${ACTIONS}/subtract`,
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
        update: {
            data: {
                type: "string",
            },
            forms: [
                {
                    href: `mqtt://${hostname}:${portNumber}/${thingName}/${EVENTS}/update`,
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

broker.on("connect", () => {
    console.log(`Connected the host on port ${portNumber}`);
});

let isCool = true;
let result = 0;

broker.on("message", (topic, payload, packet) => {
    console.log(`Messaged to the topic ${topic}`);
    const segments = topic.split('/');

    if (segments[0] !== thingName) {
        return;
    }

    if (segments[1] === PROPERTIES) {
        if (segments.length === 3 && segments[2] === "result") {
            console.log(`Result is : ${result}`);
        }

        if (segments.length === 3 && segments[2] === "isCool") {
            console.log(`Thing isCool: ${isCool}`);
        }

        if (segments.length === 4 && segments[2] === "isCool" && segments[3] === "writeproperty") {
            isCool = payload.toString() === "true";
        }
    }

    if (segments[1] === ACTIONS) {
        if (segments.length === 3 && segments[2] === "add") {
            const parsedValue = parseInt(payload.toString());

            if (isNaN(parsedValue)) {
                return;
            } else {
                result += parsedValue;
            }
        }

        if (segments.length === 3 && segments[2] === "subtract") {
            const parsedValue = parseInt(payload.toString());

            if (isNaN(parsedValue)) {
                return;
            } else {
                result -= parsedValue;
            }
        }
    }
})

setInterval(() => {
    broker.publish(`${thingName}/${EVENTS}/update`, "Updated the thing!");
}, 500);

broker.subscribe(`${thingName}/${PROPERTIES}/result`);
broker.subscribe(`${thingName}/${PROPERTIES}/isCool`); 
broker.subscribe(`${thingName}/${PROPERTIES}/isCool/writeproperty`); 
broker.subscribe(`${thingName}/${ACTIONS}/add`);
broker.subscribe(`${thingName}/${ACTIONS}/subtract`);
broker.publish(`${thingName}`, JSON.stringify(thingDescription), { retain: true });