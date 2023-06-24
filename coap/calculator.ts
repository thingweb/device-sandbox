import { parseArgs } from 'node:util';
const coap = require('coap');

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
          readOnly: true,
          writeOnly: false,
          observable: true,
          forms: [
              {
                  href: `coap://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/result`,
                  contentType: "application/json",
                  op: [
                      "readproperty",
                      "observeproperty",
                      "unobserveproperty"
                  ]
              },
              {
                  href: `coaps://${hostname}:${portNumber}/${thingName}/${PROPERTIES}/result`,
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
                  href: `coap://${hostname}:${portNumber}/${thingName}/${ACTIONS}/add`,
                  contentType: "application/json",
                  op: [
                      "invokeaction"
                  ]
              },
              {
                  href: `coaps://${hostname}:${portNumber}/${thingName}/${ACTIONS}/add`,
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
                  href: `coap://${hostname}:${portNumber}/${thingName}/${ACTIONS}/subtract`,
                  contentType: "application/json",
                  op: [
                      "invokeaction"
                  ]
              },
              {
                  href: `coaps://${hostname}:${portNumber}/${thingName}/${ACTIONS}/subtract`,
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
                href: `coap://${hostname}:${portNumber}/${thingName}/${EVENTS}/update`,
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

let result = 0;

server.on('request', (req: any, res: any) => {
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
        if (req.headers.Observe === 1) {
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
        }
    }
  }
})

server.listen(portNumber, () => {
    console.log(`Started listening to on port ${portNumber}...`);
})