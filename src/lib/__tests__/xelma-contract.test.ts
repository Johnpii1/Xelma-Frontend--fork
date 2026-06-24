import { beforeEach, describe, expect, it, vi } from 'vitest';
import { place_bet, place_precision_prediction } from '../xelma-contract';
import { signTransaction } from '@stellar/freighter-api';

// Mock the Freighter API
vi.mock('@stellar/freighter-api', () => ({
  signTransaction: vi.fn(),
}));

// Hoist mock functions so they are accessible inside vi.mock factories
const {
  mockGetAccount,
  mockSimulateTransaction,
  mockPrepareTransaction,
  mockSendTransaction,
  mockGetTransaction,
} = vi.hoisted(() => ({
  mockGetAccount: vi.fn(),
  mockSimulateTransaction: vi.fn(),
  mockPrepareTransaction: vi.fn(),
  mockSendTransaction: vi.fn(),
  mockGetTransaction: vi.fn(),
}));

// Fully mock the Stellar SDK — no real crypto/validation runs in unit tests
vi.mock('@stellar/stellar-sdk', async () => {
  /** Stub a minimal Transaction-like object so prepareTransaction / toXDR don't crash */
  const stubTx = { toXDR: () => 'AAAA', toEnvelope: () => ({}) };

  class MockTransactionBuilder {
    addOperation() { return this; }
    setTimeout() { return this; }
    build() { return stubTx; }
    static fromXDR() { return stubTx; }
  }

  class MockContract {
    call() { return {}; }
  }

  class MockAddress {
    constructor(public addr: string) {}
    toScVal() { return {}; }
    toString() { return this.addr; }
  }

  class MockServer {
    getAccount = mockGetAccount;
    simulateTransaction = mockSimulateTransaction;
    prepareTransaction = mockPrepareTransaction;
    sendTransaction = mockSendTransaction;
    getTransaction = mockGetTransaction;
  }

  return {
    // Primitives used by xelma-contract.ts
    BASE_FEE: '100',
    Networks: { TESTNET: 'Test SDF Network ; September 2015' },
    TransactionBuilder: MockTransactionBuilder as any,
    Contract: MockContract as any,
    Address: MockAddress as any,
    nativeToScVal: vi.fn().mockReturnValue({}),
    rpc: {
      Server: MockServer as any,
    },
  };
});

describe('Smart Contract Bindings', () => {
  const userPublicKey = 'GD3BFFX7DTNJAGDVVM5RYGGQQNURZTH4VSBLWF55YXY3L6T2WWZK57EI';

  beforeEach(() => {
    vi.resetAllMocks();

    mockGetAccount.mockResolvedValue({ sequenceNumber: () => '100', accountId: () => userPublicKey });
    mockSimulateTransaction.mockResolvedValue({ results: [{}] });
    mockPrepareTransaction.mockImplementation((tx: any) => tx);
    mockSendTransaction.mockResolvedValue({ status: 'PENDING', hash: 'tx_hash_example' });
    mockGetTransaction.mockResolvedValue({ status: 'SUCCESS', ledger: 1001 });
    vi.mocked(signTransaction).mockResolvedValue('signed_xdr_payload');
  });

  it('place_bet: calls getAccount, simulate, sign, send, poll and returns txHash', async () => {
    const result = await place_bet(userPublicKey, 'UP', '10');

    expect(mockGetAccount).toHaveBeenCalledWith(userPublicKey);
    expect(mockSimulateTransaction).toHaveBeenCalled();
    expect(mockPrepareTransaction).toHaveBeenCalled();
    expect(signTransaction).toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalled();
    expect(mockGetTransaction).toHaveBeenCalledWith('tx_hash_example');
    expect(result).toEqual({ txHash: 'tx_hash_example', ledger: 1001 });
  });

  it('place_precision_prediction: calls getAccount, simulate, sign, send, poll and returns txHash', async () => {
    const result = await place_precision_prediction(userPublicKey, 'DOWN', '25', '0.2295');

    expect(mockGetAccount).toHaveBeenCalledWith(userPublicKey);
    expect(mockSimulateTransaction).toHaveBeenCalled();
    expect(signTransaction).toHaveBeenCalled();
    expect(mockSendTransaction).toHaveBeenCalled();
    expect(result.txHash).toBe('tx_hash_example');
  });

  it('throws descriptive error when account loading fails', async () => {
    mockGetAccount.mockRejectedValue(new Error('Horizon error 404'));

    await expect(place_bet(userPublicKey, 'UP', '10')).rejects.toThrow(
      /Stellar account not found or unfunded on Testnet/
    );
  });

  it('throws error when transaction simulation returns an error field', async () => {
    mockSimulateTransaction.mockResolvedValue({ error: 'Contract invocation panicked' });

    await expect(place_bet(userPublicKey, 'UP', '10')).rejects.toThrow(/Simulation failed/);
  });

  it('throws error when user rejects Freighter signature', async () => {
    vi.mocked(signTransaction).mockResolvedValue({ error: 'User rejected' } as any);

    await expect(place_bet(userPublicKey, 'UP', '10')).rejects.toThrow(/Freighter signing rejected/);
  });

  it('invokes onStatus callback with preparing/signing/submitting', async () => {
    const onStatus = vi.fn();
    await place_bet(userPublicKey, 'UP', '10', onStatus);

    expect(onStatus).toHaveBeenCalledWith('preparing');
    expect(onStatus).toHaveBeenCalledWith('signing');
    expect(onStatus).toHaveBeenCalledWith('submitting');
  });
});
