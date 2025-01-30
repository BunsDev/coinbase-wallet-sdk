import { Container, VStack } from '@chakra-ui/react';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { getSigner } from '@coinbase/wallet-sdk/dist/features/crypto-key-module';
import React, { useEffect, useState } from 'react';

import { AddAddressButton } from './components/AddAddressButton';
import { ConnectButton } from './components/ConnectButton';
import { PersonalSignButton } from './components/PersonalSignButton';
import { SendCallsButton } from './components/SendCallsButton';

export default function SubAccounts() {
  const [sdk, setSDK] = useState<ReturnType<typeof createCoinbaseWalletSDK>>();

  useEffect(() => {
    const sdk = createCoinbaseWalletSDK({
      appName: 'CryptoPlayground',
      preference: {
        keysUrl: 'http://localhost:3005/connect',
        options: 'smartWalletOnly',
      },
      subaccount: {
        getSigner,
      },
    });

    if (!sdk) {
      return;
    }

    setSDK(sdk);
    const provider = sdk.getProvider();

    provider.on('accountsChanged', (accounts) => {
      console.info('customlogs: accountsChanged', accounts);
    });
  }, []);

  return (
    <Container mb={16}>
      <VStack w="full" spacing={4}>
        <ConnectButton sdk={sdk} />
        <AddAddressButton sdk={sdk} />
        <PersonalSignButton sdk={sdk} />
        <SendCallsButton sdk={sdk} />
      </VStack>
    </Container>
  );
}
