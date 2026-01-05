// src/components/ResponseDisplay.jsx
export const ResponseDisplay = ({ response, streamingResponse, error }) => {
    if (error) {
      return (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      );
    }
  
    if (response || streamingResponse) {
      return (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Response:</h3>
          <p className="whitespace-pre-wrap">
            {streamingResponse || response}
          </p>
        </div>
      );
    }
  
    return null;
  };