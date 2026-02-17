/**
 * Web Bluetooth client for HospitalOS BLE NFC Reader (Pi Zero 2 W).
 * Connects to the BLE GATT server and provides read/write/format operations.
 */

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const NFC_DATA_UUID = "12345678-1234-5678-1234-56789abcdef1";
const COMMAND_UUID = "12345678-1234-5678-1234-56789abcdef2";
const STATUS_UUID = "12345678-1234-5678-1234-56789abcdef3";

let device: BluetoothDevice | null = null;
let server: BluetoothRemoteGATTServer | null = null;
let nfcDataChar: BluetoothRemoteGATTCharacteristic | null = null;
let commandChar: BluetoothRemoteGATTCharacteristic | null = null;
let statusChar: BluetoothRemoteGATTCharacteristic | null = null;

function decodeValue(value: DataView): string {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(value.buffer).replace(/\0/g, "").trim();
}

/** Connect to BLE NFC device. Triggers browser pairing dialog on first call. */
export async function bleConnect(): Promise<BluetoothDevice> {
  if (device?.gatt?.connected) return device;

  device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [SERVICE_UUID],
  });

  device.addEventListener("gattserverdisconnected", () => {
    server = null;
    nfcDataChar = null;
    commandChar = null;
    statusChar = null;
  });

  server = await device.gatt!.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);

  nfcDataChar = await service.getCharacteristic(NFC_DATA_UUID);
  commandChar = await service.getCharacteristic(COMMAND_UUID);
  statusChar = await service.getCharacteristic(STATUS_UUID);

  // Start notifications on data and status characteristics
  await nfcDataChar.startNotifications();
  await statusChar.startNotifications();

  return device;
}

/** Disconnect from BLE NFC device. */
export function bleDisconnect(): void {
  if (device?.gatt?.connected) {
    device.gatt.disconnect();
  }
  device = null;
  server = null;
  nfcDataChar = null;
  commandChar = null;
  statusChar = null;
}

/** Check if currently connected to a BLE NFC device. */
export function bleIsConnected(): boolean {
  return device?.gatt?.connected === true;
}

/** Get the connected device name, or null. */
export function bleDeviceName(): string | null {
  return device?.name ?? null;
}

/**
 * Wait for a status change on the status characteristic.
 * Resolves with the new status string when it changes from "waiting".
 */
function waitForStatus(timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!statusChar) {
      reject(new Error("Not connected to BLE NFC device"));
      return;
    }

    const timer = setTimeout(() => {
      statusChar!.removeEventListener(
        "characteristicvaluechanged",
        handler as EventListener,
      );
      reject(new Error("BLE operation timed out"));
    }, timeout);

    function handler(event: Event) {
      const target = event.target as BluetoothRemoteGATTCharacteristic;
      const status = decodeValue(target.value!);
      if (status !== "waiting") {
        clearTimeout(timer);
        statusChar!.removeEventListener(
          "characteristicvaluechanged",
          handler as EventListener,
        );
        resolve(status);
      }
    }

    statusChar.addEventListener(
      "characteristicvaluechanged",
      handler as EventListener,
    );
  });
}

/** Read the latest NFC data value. */
async function readNfcData(): Promise<string> {
  if (!nfcDataChar) throw new Error("Not connected to BLE NFC device");
  const value = await nfcDataChar.readValue();
  return decodeValue(value);
}

/** Send a command to the BLE NFC device. */
async function sendCommand(cmd: string): Promise<void> {
  if (!commandChar) throw new Error("Not connected to BLE NFC device");
  const encoder = new TextEncoder();
  await commandChar.writeValue(encoder.encode(cmd));
}

/** Read NFC card via BLE. Sends READ command, waits for result. */
export async function bleNfcRead(
  timeout = 35000,
): Promise<{ nfc_id: string | null }> {
  if (!bleIsConnected()) throw new Error("Not connected to BLE NFC device");

  const statusPromise = waitForStatus(timeout);
  await sendCommand("READ");
  const status = await statusPromise;

  if (status === "success") {
    const data = await readNfcData();
    return { nfc_id: data || null };
  }

  if (status.startsWith("error:")) {
    const errorMsg = status.slice(6);
    if (errorMsg === "timeout") {
      throw new Error("Timeout — no card detected");
    }
    throw new Error(`NFC read failed: ${errorMsg}`);
  }

  throw new Error(`Unexpected status: ${status}`);
}

/** Write NFC card via BLE. Sends WRITE:<id> command, waits for result. */
export async function bleNfcWrite(
  nfcId: string,
  timeout = 35000,
): Promise<{ success: boolean }> {
  if (!bleIsConnected()) throw new Error("Not connected to BLE NFC device");

  const statusPromise = waitForStatus(timeout);
  await sendCommand(`WRITE:${nfcId}`);
  const status = await statusPromise;

  if (status === "success") return { success: true };

  if (status.startsWith("error:")) {
    throw new Error(`NFC write failed: ${status.slice(6)}`);
  }

  throw new Error(`Unexpected status: ${status}`);
}

/** Format NFC card via BLE. Sends FORMAT command, waits for result. */
export async function bleNfcFormat(
  timeout = 35000,
): Promise<{ success: boolean }> {
  if (!bleIsConnected()) throw new Error("Not connected to BLE NFC device");

  const statusPromise = waitForStatus(timeout);
  await sendCommand("FORMAT");
  const status = await statusPromise;

  if (status === "success") return { success: true };

  if (status.startsWith("error:")) {
    throw new Error(`NFC format failed: ${status.slice(6)}`);
  }

  throw new Error(`Unexpected status: ${status}`);
}
