const noble = require('noble');

import { API_ACTIONS } from '../config/web-api.config';
import BleAdapter from '../modules/ble-adapter.module';
import ConnectionService from '../services/connection.service';
import { UUID_IMIST_PERIPTHERAL } from '../config/constants.config';

class WebApiService {
  constructor() {
    this.defaultMode = [
      { optionId: 1, key: 'time', value: 20 },
      { optionId: 2, key: 'brightness', value: 100 },
      { optionId: 3, key: 'fog', value: 100 },
      { optionId: 4, key: 'isLedAuto', value: 0 },
      { optionId: 5, key: 'red', value: 255 },
      { optionId: 6, key: 'green', value: 0 },
      { optionId: 7, key: 'blue', value: 0 },
    ];
    this.config = undefined;
    this.characteristic = undefined;
    this.matchingDevices = [];
  }

  /**
   * Set default data
   */
  init() {
    this.customMode = [...this.defaultMode];
    this.characteristic = ConnectionService.CHARACTERISTIC.WRITE;

    noble.on('discover', this.getMatchingPeripheral);
  }

  /**
   * Parse request payload
   *
   * @param {number} action - action id
   * @param {number} payload - data to set
   */
  handleRequest(action, payload) {
    switch (action) {
      case API_ACTIONS.GET_CONFIG:
        this.getConfig();
        break;
      case API_ACTIONS.START_SCAN:
        noble.startScanning();
        break;
      case API_ACTIONS.STOP_SCAN:
        noble.stopScanning();
        break;
      case API_ACTIONS.SET_BRIGHTNESS:
      case API_ACTIONS.SET_FOG:
      case API_ACTIONS.SET_LED_AUTO:
      case API_ACTIONS.SET_RGB:
      case API_ACTIONS.SET_TIME:
        this.setProperty(action, payload);
        break;
      default:
        this.getConfig();
    }
  }

  /**
   * Get remote device config
   */
  getConfig() {
    this.config = BleAdapter.getData(this.characteristic);
  }

  /**
   * Set iMist device settings
   *
   * @param {number} action - action id
   * @param {number} payload - data to set
   *
   * @see {web-api.config.js}
   */
  setProperty(action, payload) {
    const modeSettingsItem = this.customMode.find(({ optionId }) => optionId === action);

    if (modeSettingsItem) {
      return;
    }

    modeSettingsItem.value = payload;
  }

  /**
   * Get writeable mode from defined custom settings
   *
   * @return {Object}
   * @see modeToList (connection.service.js)
   */
  getMode() {
    const mode = {};

    this.customMode.forEach(({ key, value }) => {
      mode[key] = value;
    });

    return mode;
  }

  /**
   * Get all matching peripheral devices
   *
   * @param peripheral
   */
  getMatchingPeripheral(peripheral) {
    const { serviceUuids } = peripheral.advertisement;

    if (serviceUuids.some(uuid => uuid === UUID_IMIST_PERIPTHERAL)) {
      this.matchingDevices.push()
    }
  }
}

export default new WebApiService();
