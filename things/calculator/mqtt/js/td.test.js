const Ajv = require("ajv");
const chai = require("chai");
const https = require("https");
const mqtt = require("mqtt");

const exec = require('child_process').exec;

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
const hostname = "test.mosquitto.org"
let port = 1883
let thingProcess;

describe("Calculator MQTT JS", () => {
    let validate; 

    before((done) => {
        thingProcess = exec(
            `node main.js -p ${port}`,
            { cwd: __dirname }
        );
        
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {
            const body = [];
            response.on("data", (chunk) => {
                body.push(chunk);
            });

            response.on("end", () => {
                const tdSchema = JSON.parse(Buffer.concat(body).toString());
                validate = ajv.compile(tdSchema);
                done();
            });
        });

    })

    after(() => {
        thingProcess.kill();
    })

    it("should have a valid TD", (done) => {
        const broker = mqtt.connect(`mqtt://${hostname}`, { port: port });

        broker.subscribe("mqtt-calculator");

        broker.on("message", (topic, payload, packet) => {
            const valid = validate(JSON.parse(payload.toString()));
            expect(valid).to.be.true;
            broker.end();
        });

        broker.on("close", () => {
            done();
        })
    });
})