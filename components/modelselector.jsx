// src/components/ModelSelector.jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ModelSelector = ({ model, onModelChange, models }) => {
    return (
      <div>
        <label className="block mb-2 font-medium">Model</label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((modelName) => (
              <SelectItem key={modelName} value={modelName}>
                {modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };