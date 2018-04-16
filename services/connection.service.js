import {
  UUID_CHARACTERISTIC_READ, UUID_CHARACTERISTIC_WRITE, UUID_ENABLE_NOTIFICATION,
  BYTE_DIFFUSER_SETTINGS, BYTE_CUSTOM_MODE, DEBUG
} from '../config/constants.config';
import BleAdapter from '../modules/ble-adapter.module';

class ConnectionService {
  constructor() {
    this.CHARACTERISTIC = {
      READ: undefined,
      WRITE: undefined
    };
  }

  /**
   * Connect peripheral
   *
   * @param {object} peripheral - Connected device
   */
  use(peripheral) {
    peripheral.connect(() => {
      DEBUG && console.log(`☺︎ connected to ${peripheral.advertisement.localName}`.green);

      peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        this.mapCharacteristics(characteristics);
      });
    });
  }

  /**
   * Map read/write characteristics, set data exchange mode
   *
   * @param {object} characteristics - Connected device characteristics
   * @throws {Error} if no matching characteristics found
   */
  mapCharacteristics(characteristics) {
    characteristics.forEach(characteristic => {
      const { uuid } = characteristic;

      switch (uuid) {
        case UUID_CHARACTERISTIC_READ:
          this.CHARACTERISTIC.READ = characteristic;
          this.enableNotification();
          break;
        case UUID_CHARACTERISTIC_WRITE:
          this.CHARACTERISTIC.WRITE = characteristic;
          break;
        default:
          throw new Error('No matching characteristics found');
      }
    });
  }

  /**
   * Get characteristic descriptors and enable notification mode
   *
   * notification = {0x01, 0x00} [UDP-like]
   * indication = {0x02, 0x00} [TCP-like]
   *
   * @throws {Error} if no descriptors found or failed to find UUID_ENABLE_NOTIFICATION
   *
   * @see {@link https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml}
   */
  enableNotification() {
    this.CHARACTERISTIC.READ.discoverDescriptors((error, descriptors) => {
      if (!descriptors.length) {
        throw new Error('No descriptors found');
      }

      const descriptor = descriptors.find(({ uuid }) => uuid === UUID_ENABLE_NOTIFICATION);
      const buffer = Buffer.alloc(2);
      buffer.writeUInt8(0x1, 0);

      descriptor && descriptor.writeValue(buffer, error => {
        if (error) {
          throw new Error(error);
        } else {
          BleAdapter.sendData(this.modeToList({}), this.CHARACTERISTIC.WRITE);
        }
      })
    });
  }

  /**
   * Create settings list from predefined mode given
   *
   * @param {Object} mode
   *
   * @returns {Array} - paramArrayList for BLE.sendData
   *
   * @example payload:
   * {
   *  time: 20,
   *  fog: 100,
   *  brightness: 100,
   *  isLedAuto: 0,
   *  red: 255,
   *  green: 0,
   *  blue: 0
   * }
   */
  modeToList({ red = 255, green = 0, blue = 0, time = 20, fog = 100, isLedAuto = 0, brightness = 100 } = {}) {
    const settingsArray = [];

    settingsArray.push(BYTE_DIFFUSER_SETTINGS);
    settingsArray.push(BYTE_CUSTOM_MODE);
    settingsArray.push(time % 256); // time e.g. 30
    settingsArray.push(time / 256); // time e.g. 30
    settingsArray.push(brightness); // brightness
    settingsArray.push(fog); // fog intensity, e.g. 100, from 0 to 100
    settingsArray.push(isLedAuto); // isLedAuto 0 or 1
    settingsArray.push(red); // red color highlight
    settingsArray.push(green); // green color highlight
    settingsArray.push(blue); // blue color highlight

    return settingsArray;
  }
}

export default new ConnectionService();
