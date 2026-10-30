import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_MESSAGING_API_URL || "http://localhost:3001";
const API_URL = (import.meta.env.VITE_MESSAGING_API_URL || "http://localhost:3001") + '/api';

let e2ee = null;

// SVG Icons
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;
const IconChat = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const IconVideo = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>;
const IconAttach = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>;
const IconEmoji = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" /></svg>;
const IconSend = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const IconMic = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>;
const IconLock = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>;
const IconShield = () => <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;


export default function Messages() {
  const [username, setUsername] = useState(JSON.parse(localStorage.getItem('user'))?.username || '');
  const [userId, setUserId] = useState(null);
  
  const [myKeys, setMyKeys] = useState({ private: null, public: null });
  const [recipientName, setRecipientName] = useState('');
  const [recipient, setRecipient] = useState({ id: null, publicKey: null });
  const [sharedSecret, setSharedSecret] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function loadWasm() {
      try {
        e2ee = await import('e2ee-core');
      } catch (err) {
        console.error("WASM failed", err);
      }
    }
    loadWasm();
  }, []);

  const handleRegister = async () => {
    if (!username) {
      setRegisterError("Please enter a username.");
      setTimeout(() => setRegisterError(''), 3000);
      return;
    }
    try {
      let kp = JSON.parse(localStorage.getItem(`e2ee_keys_${username}`));
      if (!kp || !kp.private_key || !kp.public_key) {
        const kpJson = e2ee.generate_keypair();
        kp = JSON.parse(kpJson);
        localStorage.setItem(`e2ee_keys_${username}`, JSON.stringify(kp));
      }
      setMyKeys({ private: kp.private_key, public: kp.public_key });
      const res = await axios.post(`${API_URL}/users`, { username, publicKey: kp.public_key });
      setUserId(res.data.userId);
      setIsConnected(true);

      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join', res.data.userId);
      socketRef.current.on('receive_encrypted_message', handleIncomingMessage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectToRecipient = async () => {
    if (!recipientName.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/users/find/${recipientName}`);
      const rPub = res.data.publicKey;
      setRecipient({ id: res.data.userId, publicKey: rPub });

      const secret = e2ee.derive_shared_secret(myKeys.private, rPub);
      setSharedSecret(secret);
      
      const hist = await axios.get(`${API_URL}/messages/${userId}/${res.data.userId}`);
      const decHist = hist.data.map(m => {
        try {
           return { ...m, text: e2ee.decrypt_message(m.encryptedPayload, secret), isMine: m.senderId === userId };
        } catch { return { ...m, text: "Encrypted Message", isMine: m.senderId === userId }; }
      });
      setMessages(decHist);
    } catch (err) {
      setSearchError('Recipient not found on the network.');
      setTimeout(() => setSearchError(''), 3000);
    }
  };

  const handleIncomingMessage = (data) => {
    const { _id, senderId, encryptedPayload, timestamp } = data;
    try {
      let plaintext = sharedSecret ? e2ee.decrypt_message(encryptedPayload, sharedSecret) : "Encrypted Message";
      setMessages(prev => [...prev, { _id, text: plaintext, senderId, timestamp, isMine: false }]);
    } catch (e) {
      setMessages(prev => [...prev, { _id, text: "Decryption Error", senderId, timestamp, isMine: false }]);
    }
  };

  const handleSendMessage = () => {
    if (!recipient.id || !sharedSecret || !messageInput.trim()) return;
    try {
      const encryptedPayload = e2ee.encrypt_message(messageInput, sharedSecret);
      const tempId = Date.now().toString();
      setMessages(prev => [...prev, { _id: tempId, text: messageInput, senderId: userId, timestamp: new Date().toISOString(), isMine: true }]);

      socketRef.current.emit('send_encrypted_message', { senderId: userId, receiverId: recipient.id, encryptedPayload });
      setMessageInput('');
    } catch (e) {
      console.error("Encryption error:", e);
    }
  };

  return (
    <div className="flex-1 flex w-full bg-[#141418] text-white overflow-hidden font-sans border-l border-white/5 relative">
      
      {!isConnected ? (
         // FULL SCREEN WELCOME FOR REGISTRATION
         <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full h-full">
            <div className="max-w-md w-full bg-[#1c1c24] p-10 rounded-[2rem] border border-white/5 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-magenta/10 blur-[60px] rounded-full"></div>
              <div className="text-accent-pink flex justify-center mb-6">
                <IconLock />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-wide">Secure Network</h3>
              <p className="text-gray-400 mb-8 text-[15px] leading-relaxed">Generate your unique cryptographic keys to start sending uninterceptable messages.</p>
              <div className="relative mb-6">
                <input 
                   type="text"
                   value={username}
                   onChange={e => setUsername(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleRegister()}
                   placeholder="Your Username"
                   className="w-full bg-[#0d0d11] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent-pink transition-colors placeholder-gray-600"
                />
              </div>
              {registerError && (
                <div className="mb-4 text-accent-pink text-sm text-center">
                  {registerError}
                </div>
              )}
              <button onClick={handleRegister} className="w-full bg-gradient-to-tr from-accent-pink to-accent-magenta hover:opacity-90 py-4 rounded-2xl font-bold text-white transition-opacity shadow-lg shadow-accent-pink/20">
                 Connect to Network
              </button>
            </div>
         </div>
      ) : (
         // TWO-PANE LAYOUT
         <>
           {/* LEFT PANE (Sidebar) */}
           <div className="w-[32%] min-w-[320px] max-w-[420px] flex flex-col border-r border-white/5 bg-[#0d0d11] z-10">
              {/* Header */}
              <div className="h-[76px] bg-[#141418] flex items-center px-6 justify-between shrink-0 border-b border-white/5">
                 <div className="flex items-center gap-4 cursor-pointer">
                    <div className="w-11 h-11 bg-gradient-to-tr from-accent-pink to-accent-magenta rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-accent-pink/20">
                      {username[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-white tracking-wide text-lg">{username}</span>
                 </div>
                 <div className="text-gray-400 flex gap-5">
                    <button className="hover:text-white transition-colors"><IconChat /></button>
                    <button className="hover:text-white transition-colors"><IconMenu /></button>
                 </div>
              </div>
              
              {/* Search / Connect */}
              <div className="p-4 bg-[#0d0d11] border-b border-white/5">
                 <div className="bg-[#1a1a24] rounded-2xl flex items-center px-4 py-2.5 gap-3 border border-transparent focus-within:border-accent-pink/50 transition-colors">
                    <span className="text-gray-500"><IconSearch /></span>
                    <input 
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleConnectToRecipient()}
                      placeholder="Search or start new chat..."
                      className="bg-transparent flex-1 outline-none text-[15px] text-white placeholder-gray-500"
                    />
                 </div>
                 {searchError && (
                   <div className="mt-2 text-accent-pink text-sm text-center">
                     {searchError}
                   </div>
                 )}
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                 {sharedSecret && (
                    <div className="flex items-center px-5 py-4 bg-[#1a1a24] cursor-pointer border-l-[3px] border-accent-pink transition-colors">
                       <div className="w-14 h-14 bg-gradient-to-tr from-accent-pink to-accent-magenta rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-sm">
                         {recipientName[0]?.toUpperCase()}
                       </div>
                       <div className="ml-4 flex-1 overflow-hidden">
                          <div className="flex justify-between items-center mb-1">
                             <span className="font-semibold text-white text-[17px] truncate">{recipientName}</span>
                             <span className="text-xs text-accent-pink font-medium">Active</span>
                          </div>
                          <p className="text-[14px] text-gray-400 truncate flex items-center gap-1.5">
                            <span className="text-accent-pink">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </span>
                            End-to-End Encrypted
                          </p>
                       </div>
                    </div>
                 )}
                 {!sharedSecret && (
                    <div className="p-10 flex flex-col items-center justify-center text-center opacity-50 mt-10">
                      <IconSearch />
                      <p className="mt-4 text-gray-400 text-[15px]">Type a peer username above<br/>to start a secure chat.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* RIGHT PANE (Active Chat) */}
           <div className="flex-1 flex flex-col bg-[#141418] relative z-10">
              {!sharedSecret ? (
                 <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="text-gray-600 mb-8 opacity-40">
                      <IconShield />
                    </div>
                    <h1 className="text-3xl font-light text-white mb-4 tracking-wide">Skill Exchange Web</h1>
                    <p className="text-gray-400 text-[15px] text-center max-w-md leading-relaxed">
                      Select a contact or start a new chat.<br/>
                      Your personal messages are strictly end-to-end encrypted.
                    </p>
                    <div className="absolute bottom-12 text-gray-500 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                      Zero-Knowledge encryption
                    </div>
                 </div>
              ) : (
                 <>
                    {/* Chat Header */}
                    <div className="h-[76px] bg-[#141418] flex items-center px-8 justify-between shrink-0 border-b border-white/5 shadow-sm">
                       <div className="flex items-center gap-4 cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-tr from-accent-pink to-accent-magenta rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-accent-pink/20">
                            {recipientName[0]?.toUpperCase()}
                          </div>
                          <div className="flex flex-col justify-center">
                             <span className="font-semibold text-white text-lg leading-tight">{recipientName}</span>
                             <span className="text-[13px] text-accent-pink mt-0.5 font-medium tracking-wide">online</span>
                          </div>
                       </div>
                       <div className="text-gray-400 flex gap-6">
                          <button className="hover:text-accent-pink transition-colors"><IconVideo /></button>
                          <button className="hover:text-white transition-colors"><IconSearch /></button>
                          <button className="hover:text-white transition-colors"><IconMenu /></button>
                       </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-2 relative bg-[#0d0d11]">
                       <div className="text-center my-4 mb-8">
                         <span className="bg-[#1a1a24] text-gray-400 text-[13px] px-5 py-2.5 rounded-full border border-white/5 shadow-sm inline-flex items-center gap-2">
                           <svg className="w-4 h-4 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                           Messages are end-to-end encrypted.
                         </span>
                       </div>
                       {messages.map((m, i) => {
                          const isFirstInGroup = i === 0 || messages[i-1].isMine !== m.isMine;
                          return (
                            <div key={m._id} className={`flex max-w-[70%] ${m.isMine ? 'self-end' : 'self-start'} ${isFirstInGroup ? 'mt-3' : ''}`}>
                               <div className={`px-5 py-3 rounded-2xl shadow-sm relative flex flex-wrap items-end gap-3 ${
                                 m.isMine 
                                   ? 'bg-gradient-to-tr from-accent-pink to-accent-magenta text-white rounded-br-sm shadow-accent-pink/10' 
                                   : 'bg-[#21212b] text-white rounded-bl-sm border border-white/5'
                               }`}>
                                  <span className="text-[16px] leading-relaxed break-words pb-[1px]">
                                    {m.text}
                                  </span>
                                  <span className={`text-[11px] font-medium tracking-wide float-right translate-y-[3px] ${m.isMine ? 'text-white/70' : 'text-gray-500'}`}>
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                            </div>
                          );
                       })}
                       <div ref={messagesEndRef} className="h-6" />
                    </div>

                    {/* Input Footer */}
                    <div className="min-h-[80px] bg-[#141418] flex items-center px-6 py-4 gap-4 shrink-0 border-t border-white/5">
                       <div className="text-gray-400 flex gap-4 pr-1">
                          <button className="hover:text-white transition-colors"><IconEmoji /></button>
                          <button className="hover:text-white transition-colors"><IconAttach /></button>
                       </div>
                       <input 
                         value={messageInput}
                         onChange={e => setMessageInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                         placeholder="Type a highly secure message..."
                         className="flex-1 bg-[#1a1a24] rounded-2xl px-5 py-3.5 text-[15.5px] text-white outline-none focus:border-accent-pink transition-colors placeholder-gray-500"
                       />
                       <button 
                          onClick={handleSendMessage} 
                          disabled={!messageInput.trim()}
                          className="bg-gradient-to-tr from-accent-pink to-accent-magenta disabled:opacity-50 hover:opacity-90 w-[50px] h-[50px] rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-accent-pink/20 ml-1 shrink-0"
                       >
                          <span className="text-white"><IconSend /></span>
                       </button>
                    </div>
                 </>
              )}
           </div>
         </>
      )}
    </div>
  );
}
