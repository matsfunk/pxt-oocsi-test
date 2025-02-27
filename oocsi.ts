/*******************************************************************************
 * Functions for OOCSI
 *
 * Company: Mathias Funk, Industrial Design, TU/e
 * Website: https://oocsi.net
 * Email:   m.funk@tue.nl
 *******************************************************************************/

namespace oocsi {

    let lastMessage : { [key: string] : { value: any } } = {};

    /**
     * Connect to OOCSI
     * @param server OOCSI server. eg: "super.oocsi.net"
     * @param name Client name. eg: "MicroBit_client_####"
     */
    //% weight=20
    //% blockGap=8
    //% blockId=oocsi_connect
    //% block="connect to OOCSI: Server %channel Name %name"
    export function connect(server: string, name: string) {

        sendCommand("AT+CIPSTART=\"TCP\",\"" + server + "\",4444", "OK", 10000)

        pause(500)

        let data = name + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

    }

    /**
     * Send to OOCSI
     * @param channel OOCSI channel.
     * @param key Key to send.
     * @param value Value to send.
     */
    //% weight=19
    //% blockGap=8
    //% blockId=oocsi_send
    //% block="send to OOCSI: Channel %channel Key %key Value %value"
    export function send(channel: string, key: string, value: string) {

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // prepare and send data
        let data = `sendjson ${channel} {"${key}": "${value}"}` + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

    }

    /**
     * Subscribe to OOCSI channel
     * @param channel OOCSI channel.
     */
    //% weight=18
    //% blockGap=8
    //% blockId=oocsi_subscribe
    //% block="subscribe to OOCSI: Channel %channel
    export function subscribe(channel: string) {

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

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

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return false

        let line: string = getResponse("", 500)

        pause(500);

        send("debug", "data", line);

        // nothing received?
        if(line == undefined || line.trim().length == 0) {
            return false;
        }

        // try parse line
        try {
            lastMessage = JSON.parse(line)
            return true
        } catch(err) {
            return false            
        }
        
    }

    /**
     * Get a value from the last OOCSI message
     * @param key Key of the value.
     * @param defaultValue Default value in case there is no value for the key.
     */
    //% weight=16
    //% blockGap=8
    //% blockId=oocsi_get
    //% block="get value from last OOCSI message"
    export function get(key: string, defaultValue: string) : string {

        return convertToText(lastMessage != undefined && lastMessage[key] ? lastMessage[key] : defaultValue);
        
    }

}
