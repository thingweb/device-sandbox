const Ajv = require("ajv");
const chai = require("chai");
const https = require("https");
const mqtt = require("mqtt");
const path = require("path");

const spawn = require('child_process').spawn;

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
const hostname = "test.mosquitto.org"
let port = 1883
let thingProcess;

describe("Calculator MQTT JS", () => {
    let validate; 

    before(async () => {
        const initiateMain = new Promise(async (resolve, reject) => {
            thingProcess = spawn(
                'node', 
                ["main.js", "-p", `${port}`],
                { cwd: path.join(__dirname, "..") }
            );
            thingProcess.stdout.on("data", (data) => {
                if (data.toString().trim() === "ThingIsReady") {
                    resolve("Success");
                }
            })
            thingProcess.on("error", (error) => {
                reject(`Error: ${error}`);
            })
            thingProcess.on("close", () => {
                reject("Failed to initiate the main script.")
            })
        });

        const getJSONSchema = new Promise((resolve, reject) => {
            https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {
                const body = [];
                response.on("data", (chunk) => {
                    body.push(chunk);
                });

                response.on("end", () => {
                        const tdSchema = JSON.parse(Buffer.concat(body).toString());
                        validate = ajv.compile(tdSchema);
                        resolve("Success");
                    });
                });
        });

        await Promise.all([initiateMain, getJSONSchema]).then(data => {
            if (data[0] !== "Success" || data[1] !== "Success") {
                console.log(`initiateMain: ${data[0]}`);
                console.log(`getJSONSchema: ${data[1]}`);
            }
        })
    })

    after(() => {
        thingProcess.kill();
    })
    
    it("should have a valid TD", (done) => {
        const broker = mqtt.connect(`mqtt://${hostname}`, { port: port });
        broker.subscribe("mqtt-calculator");

        let valid = false;

        broker.on("message", (topic, payload, packet) => {
            valid = validate(JSON.parse(payload.toString()));
            broker.end();
        });

        broker.on("close", () => {
            expect(valid).to.be.true;
            done();
        })
    });
})