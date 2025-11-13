import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [showUserChat, setShowUserChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const value = {
    showUserChat,
    setShowUserChat,
    showAIChat,
    setShowAIChat,
    selectedUserId,
    setSelectedUserId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatProvider;