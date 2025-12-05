# sabaki-golaxy-live

A Golaxy live game integration module for Sabaki Go board and other Go
applications.

## Installation

```bash
npm install sabaki-golaxy-live
```

## Usage

### Basic Usage

```javascript
import {golaxy, getLiveReports} from 'sabaki-golaxy-live'

// 获取直播比赛列表
async function fetchLiveGames() {
  try {
    const games = await getLiveReports()
    console.log('Live games:', games)
  } catch (error) {
    console.error('Failed to fetch live games:', error)
  }
}

// 同步特定比赛到应用
async function syncGame(gameId) {
  try {
    // 设置SGF同步回调
    golaxy.setSyncSgfCallback((gameId, sgfContent) => {
      // 在这里实现将SGF内容加载到你的Go应用中的逻辑
      console.log(`Syncing game ${gameId} with SGF content:`, sgfContent)
      // 例如：yourGoApp.loadSgf(sgfContent);
    })

    // 开始同步
    await golaxy.syncGolaxyOrYikeLizban([gameId])
  } catch (error) {
    console.error('Failed to sync game:', error)
  }
}

// 停止同步
golaxy.stopSync()
```

### Using GolaxyLiveReportsAgent

```javascript
import {GolaxyLiveReportsAgent} from 'sabaki-golaxy-live'

// 创建智能体实例
const agent = new GolaxyLiveReportsAgent()

// 执行智能体任务
async function runAgent() {
  const result = await agent.execute({
    type: 'live',
    limit: 10
  })

  if (result.success) {
    console.log('Agent result:', result.data)
  } else {
    console.error('Agent error:', result.error)
  }
}
```

## API

### Golaxy Class

#### Constructor

```javascript
new Golaxy(
  (prop = 'name'),
  (today = new Date().toISOString().split('T')[0]),
  (isLive = true)
)
```

#### Methods

- `setSyncSgfCallback(callback)`: 设置 SGF 同步回调函数
- `async getLiveReports(name = '', page = 0)`: 获取直播和历史比赛报告
- `async getGolaxyLive(gameId, moveNum)`: 获取特定比赛的直播数据
- `getReportUrl(game, isLive = true)`: 获取比赛报告 URL
- `async syncGolaxyOrYikeLizban(gameIds, isReport = false, requestAgain = false, isGolaxy = true)`:
  同步 Golaxy 或 Yike 比赛
- `convertFromCoordinate(coordinateStr)`: 将字符串坐标转换为(x, y)坐标
- `convertCoordinate(coordinate)`: 将(x, y)坐标转换为字符串坐标
- `getPropsBySgfStr(sgfStr)`: 从 SGF 字符串中提取属性
- `countMovesAndGetLastMove(node)`: 计算步数并获取最后一步
- `async getSgfByGolaxy(url, isD = false)`: 通过 Golaxy API 获取 SGF 内容
- `async syncSgf(gameId, sgfContent)`: 同步 SGF 内容
- `async requestGolaxyOrYikeMove(gameId, lastMoveNum, lastMove, playerBlack, playerWhite, isGolaxy = true)`:
  请求最新的 Golaxy 或 Yike 步数
- `startSync(gameId, lastMoveNum, lastMove, playerBlack, playerWhite)`: 开始同步
- `stopSync()`: 停止同步

### Functions

- `getLiveReports(name = '', page = 0)`: 获取直播和历史比赛报告
- `syncGolaxyOrYikeLizban(liveIds, is_live = true)`: 同步 Golaxy 或 Yike 比赛

### Constants

- `AGENT_STATES`: 智能体状态
- `ERROR_TYPES`: 错误类型
- `TOOL_TYPES`: 工具类型

## License

MIT
