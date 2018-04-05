import {
  UUID_CHARACTERISTIC_READ, UUID_CHARACTERISTIC_WRITE, UUID_ENABLE_NOTIFICATION
} from '../config/constants.config';

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
        throw new Error(error);
      })
    });
  }
}

export default new ConnectionService();
