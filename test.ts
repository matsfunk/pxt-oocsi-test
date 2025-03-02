const TX_PIN = SerialPin.P0
const RX_PIN = SerialPin.P1
const BAUDRATE = BaudRate.BaudRate115200

const WIFI_SSID = "my_ssid"
const WIFI_PWD = "my_password"

const OOCSI_SERVER = "super.oocsi.net"
const OOCSI_NAME = "microbit_test_###"


// Initialize the ESP8266 module.
// Show sad face if failed.
oocsi.init(TX_PIN, RX_PIN, BAUDRATE)
if (!oocsi.isESP8266Initialized()) {
    basic.showIcon(IconNames.Sad)
    basic.pause(1000)
}

// Connect to WiFi router.
// Show sad face if failed.
oocsi.connectWiFi(WIFI_SSID, WIFI_PWD)
if (!oocsi.isWifiConnected()) {
    basic.showIcon(IconNames.Sad)
    basic.pause(1000)
}

// Connect to WiFi router.
// Show sad face if failed.
oocsi.connect(OOCSI_SERVER, OOCSI_NAME)


// TOOD test send and receive