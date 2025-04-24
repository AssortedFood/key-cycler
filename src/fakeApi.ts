
interface KeyUsage {
  [key: string]: number
}

const RATE_LIMIT = 5  // number of allowed requests per key

/**
 * Simulated API call using a given key
 * Returns success if key usage under limit, else rate limit error
 * 
 * @param key
 * @param usageMap
 * @returns Promise resolving with key info or rejecting with error
 */
export async function fakeApiRequest(key: string, usageMap: KeyUsage): Promise<{ keyUsed: string; message: string }> {
  if (!(key in usageMap)) {
    usageMap[key] = 0
  }

  // If key exhausted
  if (usageMap[key] >= RATE_LIMIT) {
    return Promise.reject(new Error('Rate limit exceeded for key ' + key))
  }

  usageMap[key]++

  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 10))

  return Promise.resolve({ keyUsed: key, message: 'Success' })
}

