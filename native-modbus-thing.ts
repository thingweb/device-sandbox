import { parseArgs } from 'node:util';
const { ServerTCP } = require("modbus-serial");

const hostname = "0.0.0.0";
let portNumber = 8502;


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

const vector = {
    getInputRegister: function(addr: any, unitID: any) {
        // Synchronous handling
        console.log("getInputRegister");
        return addr;
    },
    getHoldingRegister: function(addr: number, unitID: any, callback: (arg0: null, arg1: any) => void) {
        // Asynchronous handling (with callback)
        setTimeout(function() {
            // callback = function(err, value)
            console.log("getHoldingRegister");
            callback(null, addr + 8000);
        }, 10);
    },
    getCoil: function(addr: number, unitID: any) {
        // Asynchronous handling (with Promises, async/await supported)
        return new Promise(function(resolve) {
            setTimeout(function() {
                console.log("getCoil");
                resolve((addr % 2) === 0);
            }, 10);
        });
    },
    setRegister: function(addr: any, value: any, unitID: any) {
        // Asynchronous handling supported also here
        console.log("set register", addr, value, unitID);
        return;
    },
    setCoil: function(addr: any, value: any, unitID: any) {
        // Asynchronous handling supported also here
        console.log("set coil", addr, value, unitID);
        return;
    },
    readDeviceIdentification: function(addr: any) {
        return {
            0x00: "MyVendorName",
            0x01: "MyProductCode",
            0x02: "MyMajorMinorRevision",
            0x05: "MyModelName",
            0x97: "MyExtendedObject1",
            0xAB: "MyExtendedObject2"
        };
    }
};

// set the server to answer for modbus requests
console.log(`ModbusTCP listening on modbus+tcp://${hostname}:${portNumber}`);
const serverTCP = new ServerTCP(vector, { host: hostname, port: portNumber, debug: true, unitID: 2 });

serverTCP.on("socketError", function(err: any){
    // Handle socket error if needed, can be ignored
    console.error(err);
});