import { Hex, PublicKey, WebCryptoP256 } from 'ox';

import { cryptokeyIdb } from './storage.js';

export type P256KeyPair = {
  privateKey: CryptoKey;
  publicKey: PublicKey.PublicKey;
};

type AccountKeyPair = {
  keypair: P256KeyPair;
  publicKey: string;
};

export async function generateKeypair(): Promise<AccountKeyPair> {
  const keypair = await WebCryptoP256.createKeyPair({ extractable: false });
  const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);

  cryptokeyIdb.setItem(publicKey, { keypair });

  return {
    keypair,
    publicKey,
  };
}
