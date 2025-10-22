/**
 * Browser-safe contract query utilities
 * Uses our backend API endpoint which has operator credentials
 */

export interface ContractQueryResult {
  isCreator: boolean;
  error?: string;
}

/**
 * Query creator status using our backend API
 * The API runs on the server and can use operator credentials
 */
export async function queryCreatorStatus(
  accountId: string,
  evmAddress: string
): Promise<ContractQueryResult> {
  try {
    console.log('Querying creator status via API:', {
      accountId,
      evmAddress,
    });

    const response = await fetch('/api/creator/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        evmAddress,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API error:', errorData);
      
      return {
        isCreator: false,
        error: errorData.error || `API error: ${response.status}`,
      };
    }

    const result = await response.json();
    console.log('Creator status API response:', result);

    return { 
      isCreator: result.isCreator || false,
      error: result.error 
    };
    
  } catch (error: any) {
    console.error('Error in queryCreatorStatus:', error);
    return { 
      isCreator: false, 
      error: error.message || 'Failed to query creator status'
    };
  }
}
