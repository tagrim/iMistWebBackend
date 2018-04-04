import { UUID_CHARACTERISTIC_READ, UUID_CHARACTERISTIC_WRITE } from '../config/constants.config';

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
   * @param peripheral
   */
  use(peripheral) {
    peripheral.connect(() => {
      console.log(`✔︎ connected to ${peripheral.advertisement.localName}`.bgGreen);

      peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        this.mapCharacteristics(characteristics);
      });
    });
  }

  /**
   * Map read/write characteristics
   *
   * @param characteristics
   */
  mapCharacteristics(characteristics) {
    characteristics.forEach(characteristic => {
      const { uuid } = characteristic;

      switch (uuid) {
        case UUID_CHARACTERISTIC_READ:
          this.CHARACTERISTIC.READ = characteristic;
          this.getDescriptors(characteristic);
          break;
        case UUID_CHARACTERISTIC_WRITE:
          this.CHARACTERISTIC.WRITE = characteristic;
          break;
        default:
          console.log('No matching characteristics found'.bgYellow);
      }
    });
  }

  /**
   * Get characteristic descriptors
   *
   * @param characteristic
   */
  getDescriptors(characteristic) {
    characteristic.discoverDescriptors((error, descriptors) => {
      !!descriptors.length && descriptors.forEach(descriptor => {
        descriptor.readValue((error, data) => {
          console.log('Descriptor data'.grey);
          console.log(data);
        })
      });
    });
  }
}

export default new ConnectionService();
