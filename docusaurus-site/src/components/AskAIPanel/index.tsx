import React, { useState, useEffect } from 'react';
import clsx from 'clsx'; // For conditional class names

interface AskAIPanelProps {
  // Add any props if needed
}

const AskAIPanel: React.FC<AskAIPanelProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Listen for the custom event to open the panel
  useEffect(() => {
    const handleAskAIOpen = (event: CustomEvent<{ selectedText: string }>) => {
      setSelectedText(event.detail.selectedText);
      setIsOpen(true);
      setUserQuestion(''); // Clear previous question
      setAiResponse(''); // Clear previous response
    };

    window.addEventListener('ask-ai-open' as any, handleAskAIOpen);

    return () => {
      window.removeEventListener('ask-ai-open' as any, handleAskAIOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = () => {
    // Temporary AI response as per requirements
    setAiResponse("This is a placeholder AI response. RAG will be connected later.");
    // In a real scenario, you would send userQuestion and selectedText to your backend
  };

  return (
    <div
      className={clsx(
        'fixed inset-y-0 right-0 w-80 md:w-96 bg-white shadow-lg transform transition-all duration-300 ease-in-out z-[2147483647]', // Max z-index to overlay content
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none',
        'flex flex-col', // Use flexbox for layout
        'ask-ai-panel' // Class for custom styling
      )}
      style={{ visibility: isOpen ? 'visible' : 'hidden' }} // Hide completely when closed for better accessibility
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Ask AI About Selection</h2>
        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      {/* Selected Text (Read-only) */}
      <div className="p-4 border-b border-gray-200 overflow-y-auto max-h-40">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Text:</h3>
        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
          {selectedText || "No text selected."}
        </div>
      </div>

      {/* Question Input */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Question:</h3>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          placeholder="Ask a question about the selected text..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
        ></textarea>
      </div>

      {/* Send Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleSend}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Send
        </button>
      </div>

      {/* AI Response Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-2">AI Response:</h3>
        <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
          {aiResponse || "AI response will appear here."}
        </div>
      </div>
    </div>
  );
};

export default AskAIPanel;
