import { meshyClient } from './meshyClient';
import { riggingClient } from './riggingClient';
import { animationClient } from './animationClient';

const TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678';

// 统一设置所有 client 的 API Key
export function setGlobalApiKey(apiKey: string, useTestMode: boolean) {
  const key = useTestMode ? TEST_API_KEY : apiKey;
  meshyClient.setApiKey(key);
  riggingClient.setApiKey(key);
  animationClient.setApiKey(key);
}

export function isTestMode(useTestMode: boolean) {
  return useTestMode;
}

export { meshyClient, riggingClient, animationClient };
