import React, { useState, useEffect, useRef } from 'react';
import './ChatGPT.css';

const CHAT_STORAGE_KEY = 'smartdesk-chat-history';
const API_KEY_STORAGE_KEY = 'openai-api-key';

function ChatGPT() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const containerRef = useRef(null);

  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
  window.electron.loadJSON('settings').then(data => {
    if (data.apiKey) setApiKey(data.apiKey);
  });

  window.electron.loadJSON('chat').then(data => {
    if (Array.isArray(data)) setMessages(data);
  });
}, []);


  useEffect(() => {
  containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  window.electron.saveJSON('chat', messages);
  }, [messages]);


  const sendMessage = async () => {
    if (!input.trim() || !apiKey) {
      console.warn('⚠️ Empty input or missing API key.');
      return;
    }

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: updatedMessages
        })
      });

      const data = await response.json();
      console.log('✅ OpenAI raw response:', data);

      const reply = data.choices?.[0]?.message;
      if (reply) {
        setMessages(prev => [...prev, reply]);
      } else {
        console.warn('⚠️ No reply from OpenAI:', data);
      }
    } catch (error) {
      console.error('❌ API error:', error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    window.electron.saveJSON('chat', []);
  };

  return (
    <div className="tab-content">
    <div className="chatgpt-container">
      <div className="chatgpt-header">
        <h2>ChatGPT</h2>
        <button className="new-chat-btn" onClick={handleNewChat}>New Chat</button>
      </div>

      <div className="chatgpt-messages" ref={containerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chatgpt-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
    </div>
  );
}

export default ChatGPT;
