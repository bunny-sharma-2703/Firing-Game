const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const socket = io()
const scoreEl = document.querySelector('#scoreEl')
const devicePixelsRatio = window.devicePixelRatio || 1
const x = canvas.width / 2
const y = canvas.height / 2
const frontEndPlayers = {}
let animationId
let playerInputs = []
const SPEED = 30
let sequenceNumber = 0
const keys = {
  w : {
    pressed: false
  },
  s:{
    pressed: false
  },
  a: {
    pressed: false
  },
  d:{
    pressed: false
  }
}

canvas.width = innerWidth * devicePixelsRatio
canvas.height = innerHeight * devicePixelsRatio

socket.on('updatePlayers', (backendPlayers) => {
  for(const id in backendPlayers){
    const individualBackendPlayer = backendPlayers[id]
    if(!frontEndPlayers[id]){
      frontEndPlayers[id] = new Player({
        x: individualBackendPlayer.x, 
        y: individualBackendPlayer.y, 
        radius: 10, 
        color: individualBackendPlayer.color
      })
    }else{
      /**
       * this code is for server reconcilation that is>>>> if you are sending around 10 moving request to the server in 15ms
       * and the server is only able to fulfill 6 in 15ms then the last updated position must match with the frontend position
       * Because in the frontend we are moving immediately on key strokes for better user experience
       */
      if(id === socket.id){
        const lastBackendInputIndex = playerInputs.findIndex(input => {
          return backendPlayers.sequenceNumber === input.sequenceNumber
        })
        if(lastBackendInputIndex > -1){
          playerInputs.splice(0, lastBackendInputIndex + 1)
          playerInputs.forEach(input => {
            frontEndPlayers[id].x += input.dx
            frontEndPlayers[id].y += input.dy
          })
        }
      }else{
        frontEndPlayers[id].x = individualBackendPlayer.x
        frontEndPlayers[id].y = individualBackendPlayer.y
       
        /**
         * gsap is the library used for interpolation 
         * EX:- when there is lag between the client side position change and server saving the response and giving back the response to the frontend
         *  */ 
        gsap.to(frontEndPlayers[id], {
          x: individualBackendPlayer.x,
          y: individualBackendPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
  }

  for(const id in frontEndPlayers){
    if(!backendPlayers[id]){
      delete frontEndPlayers[id]
    }
  }
})


function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for(const id in frontEndPlayers){
    const player = frontEndPlayers[id]
    player.draw()
  }
}



setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber: sequenceNumber, dx: 0, dy: -SPEED})
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', 'KeyW', sequenceNumber)
  }
  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber: sequenceNumber, dx: 0, dy: SPEED})
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', 'KeyS', sequenceNumber)
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber: sequenceNumber, dx: -SPEED, dy: 0})
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', 'KeyA', sequenceNumber)
  }
  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber: sequenceNumber, dx: SPEED, dy: 0})
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', 'KeyD', sequenceNumber)
  }
},15)


window.addEventListener('keydown' , (event)=>{
  if(!frontEndPlayers[socket.id]) return
  switch (event.code) {
    case 'KeyW' :
      keys.w.pressed = true
      break
    case 'KeyS' :
      keys.s.pressed = true
      break
    case 'KeyA' :
      keys.a.pressed = true
      break
    case 'KeyD' :
      keys.d.pressed = true
      break
  }
})


window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW' :
      keys.w.pressed = false
      break
    case 'KeyS' :
      keys.s.pressed = false
      break
    case 'KeyA' :
      keys.a.pressed = false
      break
    case 'KeyD' :
      keys.d.pressed = false
      break
  }
})

animate()