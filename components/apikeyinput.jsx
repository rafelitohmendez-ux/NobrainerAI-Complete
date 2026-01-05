// src/components/ApiKeyInput.jsx
import { Input } from '@/components/ui/input';

export const ApiKeyInput = ({ apiKey, onApiKeyChange, providerName }) => {
  return (
    <div>
      <label htmlFor="apiKey" className="block mb-2 font-medium">
        API Key
      </label>
      <Input
        id="apiKey"
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder={`Enter your ${providerName} API key`}
        required
      />
    </div>
  );
};