/**
 * MolSmart GW8 RF Driver
 * Source: https://github.com/hhorigian/hubitat_MolSmart_GW8/tree/5a75d37f252399fe3a82c55919d5700cf0151418/RF
 * 
 * Commands:
 * - Up() / Down() / Stop()
 * - open() / close() / setPosition(0-100)
 * - push(1-4)
 * - healthCheckNow()
 * - recreateButtons()
 * - refreshRemoteList()
 * 
 * API Endpoint: http://${ip}/control?cId=${cid}&pwd=${password}&rcId=51&state=${button}&user=${user}
 * - state=1: Up
 * - state=2: Stop
 * - state=3: Down
 */

// Full driver code at: https://raw.githubusercontent.com/hhorigian/hubitat_MolSmart_GW8/5a75d37f252399fe3a82c55919d5700cf0151418/RF/Hubitat_TRATO_MolSmart_GW8_RF.groovy
