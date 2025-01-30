import { Signature, WebCryptoP256 } from 'ox';
import { toHex } from 'viem';

import { authenticatorData, getSigner } from './signer.js';
import { cryptokeyIdb } from './storage.js';
import { subAccountStorage } from ':features/sub-accounts/storage.js';

vi.mock('ox');

describe('signer', () => {
  it('should throw if no active signer is present', async () => {
    subAccountStorage.getItem = vi.fn().mockReturnValue(null);
    await expect(getSigner()).rejects.toThrow('active sub account id not found');
  });

  it('should throw if no keypair is present', async () => {
    subAccountStorage.getItem = vi.fn().mockReturnValue('0x123');
    await expect(getSigner()).rejects.toThrow('keypair not found');
  });

  it('should sign a message', async () => {
    subAccountStorage.getItem = vi.fn().mockReturnValue('0x123');
    cryptokeyIdb.setItem('0x123', {
      keypair: { privateKey: new Uint8Array(), publicKey: new Uint8Array() },
    });

    WebCryptoP256.sign = vi.fn().mockResolvedValue({
      r: new Uint8Array(),
      s: new Uint8Array(),
    });
    Signature.toHex = vi.fn().mockReturnValue('0xSignature');

    const signer = await getSigner();
    const signature = await signer.signMessage({ message: toHex('Hello, world!') });
    expect(signature).toEqual(
      expect.objectContaining({
        signature: '0xSignature',
        raw: {
          r: new Uint8Array(),
          s: new Uint8Array(),
        },
        webauthn: {
          authenticatorData,
          challengeIndex: 23,
          clientDataJSON:
            '{"type":"webauthn.get","challenge":"undefined","origin":"https://keys.coinbase.com"}',
          typeIndex: 1,
          userVerificationRequired: false,
        },
      })
    );
  });
});
