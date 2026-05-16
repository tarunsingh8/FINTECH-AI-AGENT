export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 2000,
    label = "API call",
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();

    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (error.status === 401 || error.status === 403) {
        console.error(`❌ Auth error not retrying`);
        throw error;
      }

      if (isLastAttempt) {
        console.error(`❌ ${label} failed after ${maxRetries} attempts`);
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`⚠️  ${label} failed (attempt ${attempt}/${maxRetries})`);
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}