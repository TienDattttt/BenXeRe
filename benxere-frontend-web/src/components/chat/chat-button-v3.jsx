import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes } from 'react-icons/fa';
import websocketService from '../../services/websocket-service';
import { hasRole } from '../../services/user-service';
import config from '../../config';

const GlobalChatButton = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated and has a valid role
        const isCustomer = await hasRole('CUSTOMER');
        const isAdmin = await hasRole('ADMIN');
        const isCustomerCare = await hasRole('CUSTOMER_CARE');
        const isBusOwner = await hasRole('BUS_OWNER');
        const isDriver = await hasRole('DRIVER');
        const isAssistant = await hasRole('ASSISTANT');
        
        setIsAuthenticated(
          isCustomer || isAdmin || isCustomerCare || isBusOwner || isDriver || isAssistant
        );
        
        // If authenticated, check for unread messages
        if (isCustomer || isAdmin || isCustomerCare || isBusOwner || isDriver || isAssistant) {
          // Connect to WebSocket and subscribe to user notifications
          try {
            await websocketService.connect();
            
            // Subscribe to user notifications for unread counts
            websocketService.subscribeToUserNotifications((notification) => {
              if (notification.type === 'UNREAD_COUNT_UPDATE') {
                setUnreadCount(notification.payload.totalUnreadCount || 0);
              } else if (notification.type === 'NEW_MESSAGE') {
                // Increment unread count for new messages
                setUnreadCount(prev => prev + 1);
              }
            });
            
            // Fetch initial unread count
            const response = await fetch(config.ENDPOINTS.CHAT.UNREAD_COUNT, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setUnreadCount(data.totalUnreadCount || 0);
            }
          } catch (error) {
            console.error('Error connecting to chat service:', error);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    return () => {
      // Clean up WebSocket connection on unmount
      websocketService.disconnect();
    };
  }, []);
  
  // If not authenticated, don't render the button
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div 
        className="relative"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/chat')}
          aria-label="Open Chat"
        >
          <FaComments className="text-2xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </motion.button>
        
        <AnimatePresence>
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm py-2 px-4 rounded shadow-lg whitespace-nowrap"
            >
              Open chat
              {unreadCount > 0 && ` (${unreadCount} unread)`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GlobalChatButton;