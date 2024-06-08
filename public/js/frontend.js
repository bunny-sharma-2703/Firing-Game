const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const socket = io()
const scoreEl = document.querySelector('#scoreEl')

const devicePixelsRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelsRatio
canvas.height = innerHeight * devicePixelsRatio




const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}

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
    }
  }

  for(const id in frontEndPlayers){
    if(!backendPlayers[id]){
      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for(const id in frontEndPlayers){
    const player = frontEndPlayers[id]
    player.draw()
  }
}


animate()


window.addEventListener('keydown' , (event)=>{
  if(!frontEndPlayers[socket.id]) return
  switch (event.code) {
    case 'KeyW' : 
      frontEndPlayers[socket.id].y -= 5
      break
    case 'KeyS' :
      frontEndPlayers[socket.id].y += 5
      break
    case 'KeyA' :
      frontEndPlayers[socket.id].x -= 5
      break
    case 'KeyD' :
      frontEndPlayers[socket.id].x += 5
      break
  }
})