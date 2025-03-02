/*******************************************************************************
 * Based on MakeCode extension for ESP8266 Wifi module.
 *
 * Company: Cytron Technologies Sdn Bhd
 * Website: https://github.com/CytronTechnologies/pxt-esp8266
 *
 *******************************************************************************/

namespace oocsi {

    // Flag to indicate whether the ESP8266 was initialized successfully.
    let esp8266Initialized = false

    // Buffer for data received from UART.
    let rxData = ""

    /**
     * Send AT command and wait for response.
     * Return true if expected response is received.
     * @param command The AT command without the CRLF.
     * @param expected_response Wait for this response.
     * @param timeout Timeout in milliseconds.
     */
    //% blockHidden=true
    //% blockId=esp8266_send_command
    export function sendCommand(command: string, expected_response: string = null, timeout: number = 100): boolean {
        // Wait a while from previous command.
        basic.pause(10)

        // Flush the Rx buffer.
        serial.readString()
        rxData = ""

        // Send the command and end with "\r\n".
        serial.writeString(command + "\r\n")
        
        // Don't check if expected response is not specified.
        if (expected_response == null) {
            return true
        }
        
        // Wait and verify the response.
        let result = false
        let timestamp = input.runningTime()
        while (true) {
            // Timeout.
            if (input.runningTime() - timestamp > timeout) {
                result = false
                break
            }

            // Read until the end of the line.
            rxData += serial.readString()
            if (rxData.includes("\r\n")) {
                // Check if expected response received.
                if (rxData.slice(0, rxData.indexOf("\r\n")).includes(expected_response)) {
                    result = true
                    break
                }

                // If we expected "OK" but "ERROR" is received, do not wait for timeout.
                if (expected_response == "OK") {
                    if (rxData.slice(0, rxData.indexOf("\r\n")).includes("ERROR")) {
                        result = false
                        break
                    }
                }

                // Trim the Rx data before loop again.
                rxData = rxData.slice(rxData.indexOf("\r\n") + 2)
            }
        }

        return result
    }



    /**
     * Get the specific response from ESP8266.
     * Return the line start with the specific response.
     * @param command The specific response we want to get.
     * @param timeout Timeout in milliseconds.
     */
    //% blockHidden=true
    //% blockId=esp8266_get_response
    export function getResponse(response: string, timeout: number = 100): string {
        const DELIM = "\n";
        let responseLine = ""
        let timestamp = input.runningTime()
        while (true) {
            // Timeout.
            if (input.runningTime() - timestamp > timeout) {
                // Check if expected response received in case no CRLF received.
                if (rxData.includes(response)) {
                    responseLine = rxData
                }
                break
            }

            // Read until the end of the line.
            rxData += serial.readString()
            if (rxData.includes(DELIM)) {
                // Check if expected response received.
                if (rxData.slice(0, rxData.indexOf(DELIM)).includes(response)) {
                    responseLine = rxData.slice(0, rxData.indexOf(DELIM))

                    // Trim the Rx data for next call.
                    rxData = rxData.slice(rxData.indexOf(DELIM) + 1)
                    break
                }

                // Trim the Rx data before loop again.
                rxData = rxData.slice(rxData.indexOf(DELIM) + 1)
            }
        }

        // erase everything else
        rxData = ""

        return responseLine
    }


    /**
     * Initialize the ESP8266.
     * @param tx Tx pin of micro:bit. eg: SerialPin.P0
     * @param rx Rx pin of micro:bit. eg: SerialPin.P1
     * @param baudrate UART baudrate. eg: BaudRate.BaudRate115200
     */
    //% weight=30
    //% blockGap=8
    //% blockId=esp8266_init
    //% block="initialize ESP8266: Tx %tx Rx %rx Baudrate %baudrate"
    export function init(tx: SerialPin, rx: SerialPin, baudrate: BaudRate) {
        // Redirect the serial port.
        serial.redirect(tx, rx, baudrate)
        serial.setTxBufferSize(128)
        serial.setRxBufferSize(128)

        // Reset the flag.
        esp8266Initialized = false

        // Restore the ESP8266 factory settings.
        if (sendCommand("AT+RESTORE", "ready", 5000) == false) return

        // Turn off echo.
        if (sendCommand("ATE0", "OK") == false) return

        // Initialized successfully.
        // Set the flag.
        esp8266Initialized = true
    }



    /**
     * Return true if the ESP8266 is already initialized.
     */
    //% weight=29
    //% blockGap=30
    //% blockId=esp8266_is_esp8266_initialized
    //% block="ESP8266 initialized"
    export function isESP8266Initialized(): boolean {
        return esp8266Initialized
    }



    /**
     * Connect to WiFi router.
     * @param ssid Your WiFi SSID.
     * @param password Your WiFi password.
     */
    //% weight=28
    //% blockGap=8
    //% blockId=esp8266_connect_wifi
    //% block="connect to WiFi: SSID %ssid Password %password"
    export function connectWiFi(ssid: string, password: string) {
        // Set to station mode.
        sendCommand("AT+CWMODE=1", "OK")

        // Connect to WiFi router.
        sendCommand("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", "OK", 20000)
    }
    
    /**
     * Return true if the ESP8266 is connected to WiFi router.
     */
    //% weight=27
    //% blockGap=30
    //% blockId=esp8266_is_wifi_connected
    //% block="WiFi connected"
    export function isWifiConnected(): boolean {
        // Get the connection status.
        sendCommand("AT+CIPSTATUS")
        let status = getResponse("STATUS:", 1000)

        // Wait until OK is received.
        getResponse("OK")

        // Return the WiFi status.
        if ((status == "") || status.includes("STATUS:5")) {
            return false
        }
        else {
            return true
        }
    }

}
