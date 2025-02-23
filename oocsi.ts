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
    // Flag to indicate whether the blynk data was updated successfully.
    let blynkUpdated = false


    /**
     * Return true if Blynk data was updated successfully.
     */
    //% subcategory="Blynk"
    //% weight=30
    //% blockGap=8
    //% blockId=esp8266_is_blynk_data_updated
    //% block="Blynk updated"
    export function isBlynkUpdated(): boolean {
        return blynkUpdated
    }



    /**
     * Read from Blynk and return the pin value as string.
     * @param authToken Blynk's authentification token.
     * @param pin Pin we want to read.
     */
    //% subcategory="Blynk"
    //% weight=29
    //% blockGap=8
    //% blockId=esp8266_read_blynk
    //% block="read Blynk: Token %authToken Pin %pin"
    export function readBlynk(authToken: string, pin: string): string {
        let value = ""

        // Reset the upload successful flag.
        blynkUpdated = false

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return value

        // Loop through all the blynk servers.
        for (let i = 0; i < blynkServers.length; i++) {
            // Connect to Blynk.
            if (sendCommand("AT+CIPSTART=\"TCP\",\"" + blynkServers[i] + "\",80", "OK", 5000) == true) {

                // Construct the data to send.
                // http://blynk.cloud/external/api/get?token={token}&{pin}
                let data = "GET /external/api/get?token=" + authToken + "&" + pin + " HTTP/1.1\r\n"

                // Send the data.
                sendCommand("AT+CIPSEND=" + (data.length + 2), "OK")
                sendCommand(data)

                // Verify if "SEND OK" is received.
                if (getResponse("SEND OK", 5000) != "") {

                    // Make sure Blynk response is 200.
                    if (getResponse("HTTP/1.1", 5000).includes("200 OK")) {

                        // Get the pin value.
                        // It should be the last line in the response.
                        while (true) {
                            let response = getResponse("", 200)
                            if (response == "") {
                                break
                            } else {
                                value = response
                            }
                        }

                        // Set the upload successful flag.
                        blynkUpdated = true
                    }
                }
            }

            // Close the connection.
            sendCommand("AT+CIPCLOSE", "OK", 1000)

            // If blynk is updated successfully.
            if (blynkUpdated == true) {
                // Rearrange the Blynk servers array to put the correct server at first location.
                let server = blynkServers[i]
                blynkServers.splice(i, 1)
                blynkServers.unshift(server)

                break
            }

        }

        return value
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
    //% blockId=oocsi_write
    //% block="send to OOCSI: Channel %channel Key %key Value %value"
    export function sendData(channel: string, key: string, value: string) {

        // // Reset the upload successful flag.
        // blynkUpdated = false

        // Make sure the WiFi is connected.
        if (isWifiConnected() == false) return

        // Connect to Telegram. Return if failed.
        if (sendCommand("AT+CIPSTART=\"SSL\",\"" + OOCSI_API_URL + "\",443", "OK", 10000) == false) return

        // Construct the data to send.
        const host = 'https://' + OOCSI_API_URL;
        const path = `/send/${channel}`;
        let data = {sender: "microbit-testy##"};
        data[key] = value;
        const body = JSON.stringify(data);
        const contentLength = Buffer.byteLength(body);

        const rawRequest = 
        `POST ${path} HTTP/1.1
        Host: ${host}
        Content-Type: application/json
        Content-Length: ${contentLength}

        ${body}`;


        // Send the data.
        sendCommand("AT+CIPSEND=" + (rawRequest.length + 2))
        sendCommand(rawRequest)

        // // Return if "SEND OK" is not received.
        // if (getResponse("SEND OK", 1000) == "") {
        //     // Close the connection and return.
        //     sendCommand("AT+CIPCLOSE", "OK", 1000)
        //     return
        // }

        // // Validate the response from Telegram.
        // let response = getResponse("\"ok\":true", 1000)
        // if (response == "") {
        //     // Close the connection and return.
        //     sendCommand("AT+CIPCLOSE", "OK", 1000)
        //     return
        // }

        // Close the connection.
        sendCommand("AT+CIPCLOSE", "OK", 1000)

        // Set the upload successful flag and return.
        // telegramMessageSent = true

        return
    }
}
