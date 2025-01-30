import { Hex } from 'ox';
import { WebAuthnAccount } from 'viem/account-abstraction';
import { LocalAccount } from 'viem/accounts';

/**
 * SDK Sub Account interface option
 */
export type SubAccount = {
  getSigner: () => Promise<LocalAccount | WebAuthnAccount>;
};

/**
 * RPC response for adding a sub account
 */
export type AddAddressResponse = {
  address: Hex.Hex;
  owners: Hex.Hex[];
  chainId: number;
  root: Hex.Hex;
  initCode: {
    factory: Hex.Hex;
    factoryCalldata: Hex.Hex;
  };
};
