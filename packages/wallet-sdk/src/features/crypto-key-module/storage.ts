import { P256KeyPair } from './keypair.js';
import { createIdbStorage } from ':core/storage/createIdbStorage.js';
import { ScopedLocalStorage } from ':core/storage/ScopedLocalStorage.js';

/////////////////////////////////////////////////////////////////////////////////////////////
// Storage
/////////////////////////////////////////////////////////////////////////////////////////////
export const cryptokeyIdb = createIdbStorage('CBWSDK', 'CryptoKeys');

export const cryptokeyLocalStorage = new ScopedLocalStorage('CBWSDK', 'CryptoKeys');

/////////////////////////////////////////////////////////////////////////////////////////////
// Constants
/////////////////////////////////////////////////////////////////////////////////////////////
export const ACTIVE_ID_KEY = 'activeId';

/////////////////////////////////////////////////////////////////////////////////////////////
// Utility
/////////////////////////////////////////////////////////////////////////////////////////////
export function getActiveId() {
  return cryptokeyLocalStorage.getItem(ACTIVE_ID_KEY);
}

export function setActiveId(id: string) {
  cryptokeyLocalStorage.setItem(ACTIVE_ID_KEY, id);
}

export async function getActiveKeypair() {
  const id = getActiveId();
  if (!id) {
    console.error('active account id not found');
    return;
  }
  const keypair = await cryptokeyIdb.getItem<{ keypair: P256KeyPair }>(id);
  if (!keypair) {
    console.error('keypair not found');
    return;
  }

  return keypair.keypair;
}
