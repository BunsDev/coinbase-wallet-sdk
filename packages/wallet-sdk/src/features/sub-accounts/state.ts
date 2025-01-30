import { createStore } from 'zustand/vanilla';

import type { SubAccount as SubAccountType } from './types.js';

type SubAccountState = {
  getSigner: null | SubAccountType['getSigner'];
};

export const SubAccount = createStore<SubAccountState>(() => ({
  getSigner: null,
}));
