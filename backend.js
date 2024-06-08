const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})
const port = 3000
const players = {}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  players[socket.id] = {
    x: 500 * Math.random(),
    y: 100 * Math.random(),
    color: `hsl(${360 * Math.random()},100%, 50%)`
  }
  // this function gets called whenever a new user is connected
  // if we want to send anything to only the connected user than we would do
  // socket.emit if we want to broadcast then io.emit
  // updatePlayers is name given by us.
  
  io.emit('updatePlayers', players)
  
  
  socket.on('disconnect', (reason) => {
    delete players[socket.id]
    io.emit('upatePlayers', players )
  })
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})