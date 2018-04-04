class BleAdapter {
  constructor() {
    this.RETRY_INTERVAL = 300;
  }

  /**
   * Send data to device wrapper
   *
   * @param paramArrayList
   * @param characteristic
   */
  sendData(paramArrayList, characteristic) {
    const paramsCount = paramArrayList.length;
    const byteArray = new Uint8Array(paramsCount);

    let localStringBuffer = '';

    for (let i = 0; i < paramsCount; i++) {
      byteArray[i] = parseInt(paramArrayList[i], 10);
      localStringBuffer += `0x${this.toHexString(paramArrayList[i])},`;
    }

    let written = this.writeBuffer(byteArray, characteristic);

    if (!written) {
      let retry_requests = 3;

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
   * @param buffer
   * @param characteristic
   *
   * @returns {boolean}
   */
  writeBuffer(buffer, characteristic) {
    let written = false;

    characteristic.write(buffer, false, response => { written = response; });
    console.info(`Data sent: ${[].apply([], buffer).join(',')}, Response: ${written}`);

    return written;
  }

  /**
   * Number to Hex string
   *
   * @param number
   *
   * @returns {string}
   */
  toHexString(number) {
    return number.toString(16);
  }
}

export default new BleAdapter();
