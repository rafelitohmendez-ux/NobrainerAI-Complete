// src/components/MessageInput.jsx
import { Textarea } from '@/components/ui/textarea';

export const MessageInput = ({ message, onMessageChange }) => {
  return (
    <div>
      <label htmlFor="message" className="block mb-2 font-medium">
        Message
      </label>
      <Textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Enter your message"
        required
      />
    </div>
  );
};
