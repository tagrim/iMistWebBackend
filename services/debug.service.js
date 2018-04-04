import { DEBUG } from '../config/constants.config';

class Debug {
  showFoundDevices({ id, address, addressType, connectable, rssi, advertisement }) {
    DEBUG && console.log(`
      peripheral discovered (${id} with address <${address}, ${addressType}>,
      connectable: ${connectable},
      RSSI: ${rssi},
      localName: ${advertisement.localName},
      services: ${JSON.stringify(advertisement.serviceUuids)}
    `.grey);
  }
}

export default new Debug();
