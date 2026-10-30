const fs = require('fs');
let file = 'frontend/src/pages/Messages.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  {!sharedSecret && (
                     <div className="p-10 flex flex-col items-center justify-center text-center opacity-50 mt-10">
                       <IconSearch />
                       <p className="mt-4 text-gray-400 text-[15px]">Type a peer username above<br/>to start a secure chat.</p>
                     </div>
                  )}`;

const replacement = `                  <div className="p-3">
                     <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted/60 px-3 py-2">Available Peer Contacts</p>
                     {[
                       { name: "Alex Rivera", role: "Cloud & Kubernetes Tutor" },
                       { name: "Sarah Chen", role: "React & UI Designer" }
                     ].map(peer => (
                       <div 
                         key={peer.name}
                         onClick={() => { setRecipientName(peer.name); handleConnectToRecipientName(peer.name); }}
                         className={\`flex items-center px-4 py-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors mb-1 \${recipientName === peer.name ? 'bg-white/10 border-l-2 border-accent-pink' : ''}\`}
                       >
                         <div className="w-10 h-10 bg-gradient-to-tr from-accent-pink to-accent-magenta rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                           {peer.name[0]}
                         </div>
                         <div className="ml-3 overflow-hidden">
                           <h4 className="text-sm font-semibold text-white truncate">{peer.name}</h4>
                           <p className="text-xs text-text-muted truncate">{peer.role}</p>
                         </div>
                       </div>
                     ))}
                  </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Successfully updated Contacts in Messages.jsx');
