const Ajv = require("ajv");
const chai = require("chai");
const fs = require("fs");
const path = require("path");
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
    const tdFilepath = path.join(__dirname, "td-json-schema-validation.json");

    before((done) => {
        thingProcess = exec(
            `node main.js -p ${port}`,
            { cwd: __dirname }
        );
        
        const file = fs.createWriteStream(tdFilepath);
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                const tdSchema = require("./td-json-schema-validation.json");
                validate = ajv.compile(tdSchema);
                done();
            });
        });

    })

    after((done) => {
        thingProcess.kill();
        fs.stat(tdFilepath, function(err, stats) {
            if (err) {
                return console.error(err);
            }

            fs.unlink(tdFilepath, function(err) {
                if (err) {
                    return console.error(err);
                }

                done();
            })
        })
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