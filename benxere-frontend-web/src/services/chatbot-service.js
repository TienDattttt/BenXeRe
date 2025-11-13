import authService from './auth-service';

class ChatbotService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    this.chatbotUrl = `${this.apiUrl}/api/chatbot`;
  }

  /**
   * Send a query to the chatbot
   * @param {string} text - The user's message
   * @returns {Promise<Object>} The chatbot response
   */
  async sendQuery(text) {
    try {
      const response = await fetch(`${this.chatbotUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          text: text,
          userId: authService.getUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`Chatbot request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chatbot query:', error);
      throw error;
    }
  }

  /**
   * Check if the chatbot service is available
   * @returns {Promise<boolean>} Whether the service is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.chatbotUrl}/health`, {
        method: 'GET'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Chatbot health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService; 