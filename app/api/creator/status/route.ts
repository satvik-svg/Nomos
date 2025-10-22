import { NextRequest, NextResponse } from 'next/server';
import {
  Client,
  AccountId,
  ContractCallQuery,
  ContractId,
  ContractFunctionParameters,
  PrivateKey,
} from '@hashgraph/sdk';

/**
 * API endpoint to check creator status
 * This runs on the server and can use the operator credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, evmAddress } = body;

    if (!accountId || !evmAddress) {
      return NextResponse.json(
        { error: 'Missing accountId or evmAddress' },
        { status: 400 }
      );
    }

    // Get configuration from environment
    const contractId = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const operatorId = process.env.ACCOUNT_ID;
    const operatorKey = process.env.HEX_Encoded_Private_Key;

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract not configured' },
        { status: 500 }
      );
    }

    if (!operatorId || !operatorKey) {
      return NextResponse.json(
        { error: 'Operator credentials not configured' },
        { status: 500 }
      );
    }

    console.log('Checking creator status via API:', {
      accountId,
      evmAddress,
      contractId,
      network,
    });

    // Create client with operator
    const client = network === 'mainnet' 
      ? Client.forMainnet() 
      : Client.forTestnet();

    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromStringECDSA(operatorKey)
    );

    try {
      // Query the contract
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(contractId))
        .setGas(100000)
        .setFunction('getCreatorStatus', new ContractFunctionParameters().addAddress(evmAddress));

      const result = await query.execute(client);
      const isCreator = result.getBool(0);

      console.log('Creator status result:', {
        accountId,
        evmAddress,
        isCreator,
      });

      client.close();

      return NextResponse.json({
        isCreator,
        accountId,
        evmAddress,
      });

    } catch (queryError: any) {
      console.error('Contract query error:', queryError);
      client.close();

      return NextResponse.json(
        { error: `Query failed: ${queryError.message}`, isCreator: false },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', isCreator: false },
      { status: 500 }
    );
  }
}
