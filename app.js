require('colors');
const noble = require('noble');

import { UUID_IMIST_PERIPTHERAL } from './config/constants.config';
import ConnectionService from './services/connection.service';

class App {
  constructor() {
    noble.on('stateChange', this.onStateChange);
    noble.on('discover', this.onDiscover);
  }

  /**
   * BLE state changed
   *
   * @param state
   */
  onStateChange(state) {
    if (state === 'poweredOn') {
      console.log('◼︎ scan: start'.inverse);
      noble.startScanning();
    } else {
      console.log('◻︎ scan: stop'.inverse);
      noble.stopScanning();
    }
  }

  /**
   * Devices discovered
   *
   * @param peripheral
   */
  onDiscover(peripheral) {
    const { serviceUuids } = peripheral.advertisement;
    // @todo: return all matching devices for UI
    serviceUuids.some(uuid => uuid === UUID_IMIST_PERIPTHERAL) && ConnectionService.use(peripheral);
  }
}

new App();
