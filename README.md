# nodejs-chatroom-example

## Installation
1. Download redis, compile, run server, open up firewall to 6379
    a. With iptables, use iptalbes -A OUTPUT -p tcp -m tcp --dport 6379 -j ACCEPT
2. Clone the repo
3. Run: npm install
4. Run: node server.js
5. Go to http://localhost:8888 on a couple tabs to chat with yourself.
