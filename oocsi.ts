/*******************************************************************************
 * Functions for OOCSI
 *
 * Company: Mathias Funk, Industrial Design, TU/e
 * Website: https://oocsi.net
 * Email:   m.funk@tue.nl
 *******************************************************************************/

namespace oocsi {

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
    export function sendData(channel: string, key: string, value: string) {

        // Reset the upload successful flag.
        oocsiUpdated = false

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // prepare and send data
        let data = `sendjson ${channel} {"${key}": "${value}"}` + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

    }

}
