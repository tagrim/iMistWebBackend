import {
  UUID_CHARACTERISTIC_READ, UUID_CHARACTERISTIC_WRITE, UUID_ENABLE_NOTIFICATION
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
      console.log(`✔︎ connected to ${peripheral.advertisement.localName}`.bgGreen.black);

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
   */
  modeToList(mode) {
    const dummyMode = {
      time: 20,
      fog: 100,
      brightness: 100,
      isLedAuto: 0,
      red: 255,
      green: 0,
      blue: 0
    };
    const { red, green, blue, time, fog, isLedAuto, brightness } = dummyMode;
    const settingsArray = [];

    settingsArray.push(parseInt(18, 10));
    settingsArray.push(parseInt(11, 10)); // mode, predefined in app was 0..10 @todo: check for custom
    settingsArray.push(time % 256); // time e.g. 30
    settingsArray.push(time / 256); // time e.g. 30
    settingsArray.push(parseInt(brightness, 10)); // brightness
    settingsArray.push(parseInt(fog, 10)); // fog intensity, e.g. 100, from 0 to 100
    settingsArray.push(parseInt(isLedAuto, 10)); // isLedAuto 0 or 1
    settingsArray.push(parseInt(red, 10)); // red color highlight
    settingsArray.push(parseInt(green, 10)); // green color highlight
    settingsArray.push(parseInt(blue, 10)); // blue color highlight

    return settingsArray;
  }
}

export default new ConnectionService();
