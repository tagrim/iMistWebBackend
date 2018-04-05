class BleAdapter {
  constructor() {
    this.RETRY_INTERVAL = 300;
  }

  /**
   * Send data to device wrapper
   *
   * @param {Array} paramArrayList
   * @param {Object} characteristic
   */
  sendData(paramArrayList, characteristic) {
    const paramsCount = paramArrayList.length;
    const byteArray = new Uint8Array(paramsCount);

    let localStringBuffer = '';

    for (let i = 0; i < paramsCount; i++) {
      byteArray[i] = parseInt(paramArrayList[i], 10);
      localStringBuffer += `0x${this.toHexString(paramArrayList[i])},`; // @todo: for what purposes this stuff is needed?
    }

    let written = this.writeBuffer(byteArray, characteristic);
    let retry_requests = 3;

    if (!written && !!retry_requests) {

      const interval = setInterval(() => {
        if (written || !retry_requests) {
          clearInterval(interval);
        }

        retry_requests--;
        written = this.writeBuffer(byteArray, characteristic);
      }, this.RETRY_INTERVAL);
    }
  }

  /**
   * Send settings buffer to device and return result
   *
   * @param {Uint8Array} buffer
   * @param {Object} characteristic
   *
   * @returns {boolean}
   */
  writeBuffer(buffer, characteristic) {
    let written = false;

    characteristic.write(buffer, false, response => { written = response; });
    console.info(`Data sent: ${[].apply([], buffer).join(',')}, Response: ${written}`.grey);

    return written;
  }

  /**
   * Number to Hex string
   *
   * @param {number} number - Number to be converted to hex
   *
   * @returns {string}
   */
  toHexString(number) {
    return number.toString(16);
  }
}

export default new BleAdapter();
