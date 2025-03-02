/*******************************************************************************
 * MakeCode extension for OOCSI via ESP8266 Wifi module.
 *
 * Org:     Mathias Funk, Industrial Design, Eindhoven University of Technology
 * Website: https://oocsi.net
 * Email:   m.funk@tue.nl
 *******************************************************************************/

/**
 * Blocks for OOCSI connectivity via ESP8266 WiFi module.
 */
//% weight=10 color=#9236A4 icon="\uf1eb" block="OOCSI"
namespace oocsi {

    // last data as object
    let lastMessage : { [key: string] : { value: any } } = {};

    // flag that new data has arrived
    let newData = false;

    /**
     * Connect to OOCSI
     * @param server OOCSI server. eg: "super.oocsi.net"
     * @param name Client name. eg: "MicroBit_client_####"
     */
    //% weight=20
    //% blockGap=30
    //% blockId=oocsi_connect
    //% block="connect to OOCSI server %server with name %name"
    export function connect(server: string, name: string) {

        sendCommand("AT+CIPSTART=\"TCP\",\"" + server + "\",4444", "OK", 10000)

        pause(500)

        let data = name + "(JSON)\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

        serial.onDataReceived("\n", receiveData);
    }


    /**
     * Send data to OOCSI channel
     * @param channel OOCSI channel.
     * @param key Key to send.
     * @param value Value to send.
     */
    //% weight=19
    //% blockGap=30
    //% blockId=oocsi_send
    //% block="send to Channel %channel Key %key Value %value"
    export function send(channel: string, key: string, value: any) {

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // small delay before send
        pause(10)

        // convert value to JSON format
        let valueStr;
        if (typeof value == 'boolean') {
            valueStr = convertToText(value)
        } else if (typeof value == 'number') {
            valueStr = convertToText(value)
        } else if (typeof value == 'string') {
            valueStr = `"${convertToText(value)}"`
        } else {
            valueStr = JSON.stringify(value)
        }

        // prepare and send data
        let data = `sendjson ${channel} {"${key}": ${valueStr}}` + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

    }

    /**
     * Subscribe to OOCSI channel
     * @param channel OOCSI channel. eg: "testchannel"
     */
    //% weight=18
    //% blockGap=8
    //% blockId=oocsi_subscribe
    //% block="subscribe to OOCSI channel %channel"
    export function subscribe(channel: string) {

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // small delay before send
        pause(10)

        // prepare and send data
        let data = `subscribe ${channel}` + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)
    }


    /**
     * Check for new incoming OOCSI messages
     */
    //% weight=17
    //% blockGap=8
    //% blockId=oocsi_check
    //% block="check OOCSI"
    export function check() : boolean {
        if(newData) {
            newData = false
            return true //lastMessage != undefined
        } else {
            return false
        }
    }


    /**
     * Get a value from the last OOCSI message
     * @param key Key of the value. eg: "color"
     * @param defaultValue Default value in case there is no value for the key. eg: "-1"
     */
    //% weight=16
    //% blockGap=8
    //% blockId=oocsi_get
    //% block="get value of %key or return %defaultValue"
    export function get(key: string, defaultValue: string) : string {
        try {
            return convertToText(lastMessage != undefined && lastMessage[key] ? lastMessage[key] : defaultValue)
        } catch(err) {
            return defaultValue
        }
    }


    /**
     * Internal receive logic
     */
    function receiveData() {

        // small delay before send
        pause(10)

        let line: string = getResponse("+IPD", 500)

        // ensure that there won't be a read from incompletely parsed data
        //newData = false

        // nothing received?
        if(line == undefined || line.trim().length == 0) {
            return;
        }

        // respond to ping
        if(line.includes('ping') && !line.includes('{')) {

            // // Make sure the WiFi is connected.
            // if (isWifiConnected() == false) return

            // // send response
            // let data = `.\r\n`
            // sendCommand("AT+CIPSEND=" + (data.length + 2))
            // sendCommand(data)

            return
        }

        // try parse line
        try {
            const jsonString = line.substr(line.indexOf('{'));
            let temp = JSON.parse(jsonString)
            if(temp != undefined && typeof temp === "object") {
                lastMessage = temp;
                newData = true
            }
        } catch(err) {
            lastMessage = {}            
        }        
    }

}
