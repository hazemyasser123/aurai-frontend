// src/shared/utils/simulateApi.ts

/**
 * Simulates an API call by returning a promise that resolves after a random delay.
 * @param data The dummy data to return.
 * @param minDelay Minimum delay in milliseconds (default: 400ms).
 * @param maxDelay Maximum delay in milliseconds (default: 1200ms).
 */
export const simulateApi = async <T>(
  data: T,
  minDelay = 400,
  maxDelay = 1500,
): Promise<T> => {
  const delay =
    Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return data;
};
