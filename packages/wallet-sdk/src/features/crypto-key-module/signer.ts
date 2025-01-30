import { AbiParameters, Base64, Hash, Hex, PublicKey, Signature, WebCryptoP256 } from 'ox';
import { hashMessage, hashTypedData } from 'viem';
import { WebAuthnAccount } from 'viem/account-abstraction';

import { generateKeypair, P256KeyPair } from './keypair.js';
import { cryptokeyIdb } from './storage.js';
import { ACTIVE_ID_KEY, subAccountStorage } from ':features/sub-accounts/storage.js';

/////////////////////////////////////////////////////////////////////////////////////////////
// Constants
/////////////////////////////////////////////////////////////////////////////////////////////
export const type = 'webAuthn';

export const authenticatorData =
  '0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000' as const;

/////////////////////////////////////////////////////////////////////////////////////////////
// Utility
/////////////////////////////////////////////////////////////////////////////////////////////
async function getActiveKeypair() {
  const id = subAccountStorage.getItem(ACTIVE_ID_KEY);
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

/////////////////////////////////////////////////////////////////////////////////////////////
// Implementation
/////////////////////////////////////////////////////////////////////////////////////////////
export async function getSigner(): Promise<WebAuthnAccount> {
  let keypair = await getActiveKeypair();
  if (!keypair) {
    console.error('keypair not found');
    const newKeypair = await generateKeypair();
    // ... RPCs should request the ownership change
    keypair = newKeypair.keypair;
  }

  /**
   * public key / address
   */
  const publicKey = Hex.slice(PublicKey.toHex(keypair.publicKey), 1);

  /**
   * signer
   */
  const sign = async (payload: Hex.Hex) => {
    const challengeBase64 = Base64.fromHex(payload, { url: true, pad: false });
    const clientDataJSON = `{"type":"webauthn.get","challenge":"${challengeBase64}","origin":"https://keys.coinbase.com"}`;
    const challengeIndex = clientDataJSON.indexOf('"challenge":');
    const typeIndex = clientDataJSON.indexOf('"type":');
    const clientDataJSONHash = Hash.sha256(Hex.fromString(clientDataJSON));
    const message = AbiParameters.encodePacked(
      ['bytes', 'bytes32'],
      [authenticatorData, clientDataJSONHash]
    );
    const signature = await WebCryptoP256.sign({
      payload: message,
      privateKey: keypair.privateKey,
    });
    return {
      signature: Signature.toHex(signature),
      raw: signature as unknown as PublicKeyCredential, // type changed in viem
      webauthn: {
        authenticatorData,
        challengeIndex,
        clientDataJSON,
        typeIndex,
        userVerificationRequired: false,
      },
    };
  };
  return {
    id: publicKey,
    publicKey,
    async sign({ hash }) {
      return sign(hash);
    },
    async signMessage({ message }) {
      return sign(hashMessage(message));
    },
    async signTypedData(parameters) {
      return sign(hashTypedData(parameters));
    },
    type,
  };
}
