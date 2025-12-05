import {h, render} from 'preact'
import GolaxyLiveWidget from '../src/GolaxyLiveWidget.js'

// 创建测试容器
const container = document.createElement('div')
container.id = 'golaxy-test-widget'
document.body.appendChild(container)

// 渲染组件
render(
  h(GolaxyLiveWidget, {
    onLoad: golaxyInstance => {
      console.log('GolaxyLiveWidget loaded successfully:', golaxyInstance)
    },
    onSyncSgf: (gameId, sgfContent) => {
      console.log(
        'SGF synchronized:',
        gameId,
        sgfContent.substring(0, 50) + '...'
      )
    },
    onGameSelect: game => {
      console.log('Game selected:', game)
    },
    onStartSync: gameId => {
      console.log('Started syncing game:', gameId)
    },
    onStopSync: () => {
      console.log('Stopped syncing')
    }
  }),
  container
)

console.log('GolaxyLiveWidget test completed')
