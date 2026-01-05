// src/components/ProviderSelector.jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ProviderSelector = ({ provider, onProviderChange, providers }) => {
  return (
    <div>
      <label className="block mb-2 font-medium">AI Provider</label>
      <Select value={provider} onValueChange={onProviderChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(providers).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};