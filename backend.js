const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000})
const port = 3000
const backendPlayers = {}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  backendPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 100 * Math.random(),
    color: `hsl(${360 * Math.random()},100%, 50%)`,
    sequenceNumber: 0
  }
  // this function gets called whenever a new user is connected
  // if we want to send anything to only the connected user than we would do
  // socket.emit if we want to broadcast then io.emit
  // updatePlayers is name given by us.
  
  
  
  socket.on('disconnect', (reason) => {
    delete backendPlayers[socket.id]
    io.emit('upatePlayers', backendPlayers )
  })

  socket.on('keydown', (keycode, sequenceNumber) =>{
    backendPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW' : 
        backendPlayers[socket.id].y -= 30
        break
      case 'KeyS' :
        backendPlayers[socket.id].y += 30
        break
      case 'KeyA' :
        backendPlayers[socket.id].x -= 30
        break
      case 'KeyD' :
        backendPlayers[socket.id].x += 30
        break
    }
  })
})

setInterval(()=> {
  io.emit('updatePlayers', backendPlayers)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})