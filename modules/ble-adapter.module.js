import { DEBUG, BLE_RETRY_INTERVAL } from '../config/constants.config';

class BleAdapter {
  /**
   * Send data to device wrapper
   *
   * @param {Array} paramArrayList
   * @param {Object} characteristic
   */
  sendData(paramArrayList, characteristic) {
    const paramsCount = paramArrayList.length;
    const byteArray = Buffer.alloc(paramsCount);

    for (let i = 0; i < paramsCount; i++) {
      byteArray.writeUInt8(paramArrayList[i], i);
    }

    let written = this.writeBuffer(byteArray, characteristic);
    let retry_requests = 3;

    if (!written && !!retry_requests) {
      const interval = setInterval(() => {
        retry_requests--;
        written = this.writeBuffer(byteArray, characteristic);

        if (written || !retry_requests) {
          clearInterval(interval);
        }
      }, BLE_RETRY_INTERVAL);
    }
  }

  async getData(characteristic) {
    return await characteristic.read((error, data) => data);
  }

  /**
   * Send settings buffer to device and return result
   *
   * @param {Buffer} buffer
   * @param {Object} characteristic
   *
   * @returns {boolean}
   */
  writeBuffer(buffer, characteristic) {
    let written = false;

    characteristic.write(buffer, false, response => {
      written = !response;
      DEBUG && console.info(`Data sent: ${JSON.stringify(buffer.toJSON())}, Response: ${written}`.grey);
    });

    return written;
  }
}

export default new BleAdapter();
