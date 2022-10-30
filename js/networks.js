const get = s => document.getElementById(s)

function drawCircle (ctx, x, y, d) {
  ctx.lineWidth = 1
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, d, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.restore()
}

function drawLine (ctx, xa, ya, xb, yb) {
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(xa, ya)
  ctx.lineTo(xb, yb)
  ctx.stroke()
}

function plotNodes (ctx, initx, inity, r, d, n, randomization, failures, hits) {
  const createX = (p, r, i, n) => p + (r * Math.cos(2 * Math.PI * i / n))
  const createY = (p, r, i, n) => p + (r * Math.sin(2 * Math.PI * i / n))
  const midFloor = n => Math.floor(Math.random() * ((100 - n) / 50))

  const deadNodes = []
  // const hitNodes = Array.from(Array(n), v => 0)

  for (let i = 0; i < n; i++) {
    if (failures > 0 && midFloor(failures) <= 0) {
      deadNodes.push(i)
      continue
    }

    const x = createX(initx, r, i, n)
    const y = createY(inity, r, i, n)

    drawCircle(ctx, x, y, d)

    if (randomization > 0 && midFloor(randomization) <= 0) continue

    for (let j = 0; j < n; j++) {
      if (randomization > 0 && midFloor(randomization) <= 0) continue
      if (deadNodes.indexOf(j) > -1) continue

      const xb = createX(initx, r, j, n)
      const yb = createY(inity, r, j, n)

      drawLine(ctx, x, y, xb, yb)
    }
  }
}

function drawNodeCluster (size = 3) {
  const canvas = get('networks-canvas')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const randomizationControl = get('connection-randomization')
  const replicationControl = get('replication-control')
  const failureControl = get('node-failure')

  const x = 120
  const y = 120
  const rand = parseInt(randomizationControl.value, 10)
  const fail = parseInt(failureControl.value, 10)
  const hits = parseInt(replicationControl.value, 10)

  drawCircle(ctx, x, y, 100)
  plotNodes(ctx, x, y, 100, 6, size, rand, fail, hits)
}

document.addEventListener('DOMContentLoaded', () => {
  const clusterControl = get('cluster-control')
  const clusterValue = get('cluster-value')

  const clustersControl = get('clusters-control')
  const clustersValue = get('clusters-value')

  const failureControl = get('node-failure')
  const randomizationControl = get('connection-randomization')
  const latencyControl = get('connection-latency')

  const replicationControl = get('replication-control')
  const replicationValue = get('replication-value')

  drawNodeCluster(parseInt(clusterControl.value, 10))

  const onNetworkInput = e => {
    drawNodeCluster(parseInt(clusterControl.value, 10))
  }

  const onPerformanceInput = e => {
  }

  clusterControl.addEventListener('input', e => {
    clusterValue.textContent = clusterControl.value
    onNetworkInput(e)
  })

  clustersControl.addEventListener('input', e => {
    clustersValue.textContent = clustersControl.value
    onNetworkInput(e)
  })

  replicationControl.addEventListener('input', e => {
    replicationValue.textContent = replicationControl.value
    onNetworkInput(e)
  })

  failureControl.addEventListener('input', onNetworkInput)
  randomizationControl.addEventListener('input', onNetworkInput)

  latencyControl.addEventListener('input', onPerformanceInput)
})
