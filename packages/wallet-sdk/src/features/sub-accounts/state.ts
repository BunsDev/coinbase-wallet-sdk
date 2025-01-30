import { createStore } from 'zustand/vanilla';

import { getSigner } from './cryptokeys/signer.js';
import type { SubAccount as SubAccountType } from './types.js';

type SubAccountState = {
  getSigner: SubAccountType['getSigner'];
};

export const SubAccount = createStore<SubAccountState>(() => ({
  getSigner,
}));
