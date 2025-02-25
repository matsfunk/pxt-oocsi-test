/*******************************************************************************
 * Functions for OOCSI
 *
 * Company: Mathias Funk, Industrial Design, TU/e
 * Website: http://oocsi.net
 * Email:   m.funk@tue.nl
 *******************************************************************************/

// Telegram API url.
const OOCSI_API_URL = "super.oocsi.net"

namespace oocsi {

    let OOCSIServer = '';
    let OOCSIClient = 'MicroBit_client_####';

    // Flag to indicate whether the blynk data was updated successfully.
    let oocsiUpdated = false

    /**
     * Return true if OOCSI data was updated successfully.
     */
    //% subcategory="OOCSI"
    //% weight=30
    //% blockGap=8
    //% blockId=esp8266_is_oocsi_data_updated
    //% block="OOCSI updated"
    export function isOOCSIUpdated(): boolean {
        return oocsiUpdated
    }


    // /**
    //  * Read from Blynk and return the pin value as string.
    //  * @param authToken Blynk's authentification token.
    //  * @param pin Pin we want to read.
    //  */
    // //% subcategory="Blynk"
    // //% weight=29
    // //% blockGap=8
    // //% blockId=esp8266_read_blynk
    // //% block="read Blynk: Token %authToken Pin %pin"
    // export function readBlynk(authToken: string, pin: string): string {
    //     let value = ""

    //     // Reset the upload successful flag.
    //     blynkUpdated = false

    //     // Make sure the WiFi is connected.
    //     if (isWifiConnected() == false) return value

    //     // Loop through all the blynk servers.
    //     for (let i = 0; i < blynkServers.length; i++) {
    //         // Connect to Blynk.
    //         if (sendCommand("AT+CIPSTART=\"TCP\",\"" + blynkServers[i] + "\",80", "OK", 5000) == true) {

    //             // Construct the data to send.
    //             // http://blynk.cloud/external/api/get?token={token}&{pin}
    //             let data = "GET /external/api/get?token=" + authToken + "&" + pin + " HTTP/1.1\r\n"

    //             // Send the data.
    //             sendCommand("AT+CIPSEND=" + (data.length + 2), "OK")
    //             sendCommand(data)

    //             // Verify if "SEND OK" is received.
    //             if (getResponse("SEND OK", 5000) != "") {

    //                 // Make sure Blynk response is 200.
    //                 if (getResponse("HTTP/1.1", 5000).includes("200 OK")) {

    //                     // Get the pin value.
    //                     // It should be the last line in the response.
    //                     while (true) {
    //                         let response = getResponse("", 200)
    //                         if (response == "") {
    //                             break
    //                         } else {
    //                             value = response
    //                         }
    //                     }

    //                     // Set the upload successful flag.
    //                     blynkUpdated = true
    //                 }
    //             }
    //         }

    //         // Close the connection.
    //         sendCommand("AT+CIPCLOSE", "OK", 1000)

    //         // If blynk is updated successfully.
    //         if (blynkUpdated == true) {
    //             // Rearrange the Blynk servers array to put the correct server at first location.
    //             let server = blynkServers[i]
    //             blynkServers.splice(i, 1)
    //             blynkServers.unshift(server)

    //             break
    //         }

    //     }

    //     return value
    // }


    /**
     * Connect to OOCSI
     * @param server OOCSI server.
     * @param name Client name.
     */
    //% subcategory="OOCSI"
    //% weight=28
    //% blockGap=8
    //% blockId=oocsi_connect
    //% block="connect to OOCSI: Server %channel Name %name"
    export function connect(server: string, name: string) {
        OOCSIServer = server;
        OOCSIClient = name;

        sendCommand("AT+CIPSTART=\"TCP\",\"" + OOCSIServer + "\",4444", "OK", 10000)

        pause(1000)

        let data = OOCSI_Client + "\r\n"
        sendCommand("AT+CIPSEND=" + (data.length + 2))
        sendCommand(data)

        pause(200)

        // TODO check whether we have received a "welcome"
        let response = getResponse("welcome")
    }


    /**
     * Send to OOCSI
     * @param channel OOCSI channel.
     * @param key Key to send.
     * @param value Value to send.
     */
    //% subcategory="OOCSI"
    //% weight=28
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

        // // Validate the response from Telegram.
        // let response = getResponse("\"ok\":true", 1000)
        // if (response == "") {
        //     // Close the connection and return.
        //     sendCommand("AT+CIPCLOSE", "OK", 1000)
        //     return
        // }

        // // Close the connection.
        // sendCommand("AT+CIPCLOSE", "OK", 1000)

        // Set the upload successful flag and return.
        // telegramMessageSent = true

        return
    }

}
