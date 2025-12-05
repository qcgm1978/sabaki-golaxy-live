const SGF = require('@sabaki/sgf')
const GoCommunicate = require('./GoCommunicate.js').default

// 简单的i18n替代实现
const i18n = {
  t: (namespace, key) => {
    // 基本的翻译映射
    const translations = {
      Best: 'Best',
      'Very good': 'Very good',
      Acceptable: 'Acceptable',
      Suboptimal: 'Suboptimal',
      Mistake: 'Mistake',
      'Bad move': 'Bad move',
      'Last move': 'Last move',
      Draw: 'Draw',
      'Invalid game': 'Invalid game',
      'White wins by resignation': 'White wins by resignation',
      'White wins by timeout': 'White wins by timeout',
      'White wins': 'White wins',
      'Black wins by resignation': 'Black wins by resignation',
      'Black wins by timeout': 'Black wins by timeout',
      'Black wins': 'Black wins',
      'No result': 'No result'
    }
    return translations[key] || key
  }
}

class Golaxy extends GoCommunicate {
  constructor(
    prop = 'name',
    today = new Date().toISOString().split('T')[0],
    isLive = true
  ) {
    super()
    this.golaxy_host = 'https://19x19.com'
    this.engine = `${this.golaxy_host}/api/engine`
    this.engineGames = `${this.engine}/games`
    this.golaxyHost = 'https://19x19.com'
    this.golaxyLiveUrl = `${this.engine}/golives`
    this.lizgobanHost = 'http://localhost:7237'
    this.prop = prop
    this.authorizationValue = null
    this.dataCate = null
    this.isLive = isLive
    this.otherData = {}
    this.goodNum = 11
    this.badNum = 4
    this.dLevel = {
      0: i18n.t('golaxy', 'Best'),
      1: i18n.t('golaxy', 'Very good'),
      3: i18n.t('golaxy', 'Acceptable'),
      4: i18n.t('golaxy', 'Suboptimal'),
      5: i18n.t('golaxy', 'Mistake'),
      6: i18n.t('golaxy', 'Bad move'),
      '-100': i18n.t('golaxy', 'Last move')
    }
    this.gameResult = {
      0: {
        [i18n.t('golaxy', 'Draw')]: 1,
        [i18n.t('golaxy', 'Invalid game')]: 0
      },
      1: {
        [i18n.t('golaxy', 'White wins by resignation')]: 3,
        [i18n.t('golaxy', 'White wins by timeout')]: 7,
        [i18n.t('golaxy', 'White wins')]: 5
      },
      '-1': {
        [i18n.t('golaxy', 'Black wins by resignation')]: 2,
        [i18n.t('golaxy', 'Black wins by timeout')]: 6,
        [i18n.t('golaxy', 'Black wins')]: 4
      }
    }
    this.resultTxt = {
      'B+R': {
        txt: i18n.t('golaxy', 'Black wins by resignation'),
        win: 'b',
        num: false
      },
      'W+R': {
        txt: i18n.t('golaxy', 'White wins by resignation'),
        win: 'w',
        num: false
      },
      'B+T': {
        txt: i18n.t('golaxy', 'White loses by timeout'),
        win: 'b',
        num: false
      },
      'W+T': {
        txt: i18n.t('golaxy', 'Black loses by timeout'),
        win: 'w',
        num: false
      },
      'B+O': {
        txt: i18n.t('golaxy', 'White loses by disconnection'),
        win: 'b',
        num: false
      },
      'W+O': {
        txt: i18n.t('golaxy', 'Black loses by disconnection'),
        win: 'w',
        num: false
      },
      'R+R': {
        txt: i18n.t('golaxy', 'Draw'),
        win: '',
        num: false
      },
      'N+N': {
        txt: i18n.t('golaxy', 'Invalid game'),
        win: '',
        num: false
      },
      'N+R': {
        txt: '',
        win: null,
        num: false,
        liveTxt: i18n.t('golaxy', 'No result')
      },
      'B+': {
        txt: i18n.t('golaxy', 'Black wins'),
        win: 'b',
        num: false
      },
      'W+': {
        txt: i18n.t('golaxy', 'White wins'),
        win: 'w',
        num: false
      }
    }

    this.dGameId = {}
    this.frameNum = Infinity
    this.gamenameExcluding = ''
    this.isSync = false
    this.today = today
    if (this.today) {
      this.golaxyName = `${this.today}-golaxy`
    }

    // SGF同步回调
    this.syncSgfCallback = null
  }

  // 设置SGF同步回调
  setSyncSgfCallback(callback) {
    this.syncSgfCallback = callback
  }

  async getLiveReports(name = '', page = 0) {
    const liveUrl = `${this.engine}/golives/all`
    const liveHistoryUrl = `${this.engine}/golives/history?page=${page}&size=20&live_type=TOP_LIVE`
    const livePageUrl = liveHistoryUrl

    const lLive = await this.requestJson(liveUrl)
    const lHistory = await this.requestJson(livePageUrl)

    const live = lLive.data.map(t => t.liveMatch)
    const history = lHistory.data.matches

    const liveGames = [...live, ...history].filter(t =>
      t[this.prop].includes(name)
    )

    return liveGames
  }

  getGolaxyPv(dat) {
    const option = dat.options[0]
    const variation = option.variation.split(',')
    const m = option.coord
    const moves = [m, ...variation]
    return moves
  }

  getGolaxySuggest(dat) {
    const option = dat.options[0]
    const variation = option.variation.split(',')
    const m = option.coord
    const moves = [m, ...variation]
    const move = {move: m, pv: moves}
    return move
  }

  async getGolaxyLive(gameId, moveNum) {
    const url = `${
      this.golaxyLiveUrl
    }/base/${gameId}?live_id=${gameId}&begin_move_num=${moveNum}&end_move_num=${moveNum +
      2}`
    const response = await fetch(url)
    const d = await response.json()
    return d && d.data
  }

  getReportUrl(game, isLive = true) {
    const gameId = game.id
    const moveNum = game.moveNum
    if (isLive) {
      const liveId = game.liveId
      return `${this.golaxyLiveUrl}/base/${liveId}?live_id=${liveId}&begin_move_num=0&end_move_num=${moveNum}`
    } else {
      return `${this.golaxyLiveUrl}/${gameId}`
    }
  }

  async syncGolaxyOrYikeLizban(
    gameIds,
    isReport = false,
    requestAgain = false,
    isGolaxy = true
  ) {
    let lastMove = null
    for (const gameId of gameIds) {
      let s
      if (isGolaxy) {
        const url = `${this.golaxyLiveUrl}/${gameId}`
        s = await this.getSgfByGolaxy(url)
      } else {
        // 不是Golaxy的情况，这里可以扩展
        continue
      }

      const [
        game,
        title,
        PB,
        PW,
        RE,
        DT,
        totalMoves,
        lastMove
      ] = this.getPropsBySgfStr(s)

      const sgfS = this.convertCoordinate(lastMove)
      const playerBlack = PB
      const playerWhite = PW

      await this.syncSgf(gameId, s)
      this.dGameId[gameId] = true

      if (RE != 'Unknown Result') {
        return
      }

      const t = new Promise(resolve => {
        this.requestGolaxyOrYikeMove(
          gameId,
          totalMoves,
          sgfS,
          playerBlack,
          playerWhite,
          isGolaxy
        ).then(resolve)
      })
      await t
    }
    return gameIds
  }

  convertFromCoordinate(coordinateStr) {
    // 将围棋棋谱中的字符串坐标转换为 (x, y) 坐标
    let y = coordinateStr.charCodeAt(0) - 'a'.charCodeAt(0)
    let x = parseInt(coordinateStr.slice(1)) - 1
    if (y > 7) {
      y -= 1
    }
    return [x, y]
  }

  convertCoordinate(coordinate) {
    // 将 (x, y) 坐标转换为围棋棋谱中的字符串坐标
    let [x, y] = coordinate
    if (y > 7) {
      y += 1
    }
    return (
      String.fromCharCode('a'.charCodeAt(0) + y).toUpperCase() +
      (x + 1).toString()
    )
  }

  getPropsBySgfStr(sgfStr) {
    const parsed = SGF.parse(sgfStr)
    const rootNode = parsed[0]
    const gameInfo = rootNode.data

    const game = {} // 根据需要初始化游戏对象
    const title = gameInfo.GN ? gameInfo.GN[0] : 'Unknown Title'
    const PB = gameInfo.PB ? gameInfo.PB[0] : 'Unknown Black Player'
    const PW = gameInfo.PW ? gameInfo.PW[0] : 'Unknown White Player'
    const RE = gameInfo.RE ? gameInfo.RE[0] : 'Unknown Result'
    const DT = gameInfo.DT ? gameInfo.DT[0] : 'Unknown Date'
    const {totalMoves, lastMove} = this.countMovesAndGetLastMove(rootNode)

    return [game, title, PB, PW, RE, DT, totalMoves, lastMove]
  }

  countMovesAndGetLastMove(node) {
    let count = 0
    let lastMove = null

    function traverse(node) {
      if (node.data) {
        const b_w = node.data.B || node.data.W
        if (b_w) {
          const sgfCoord = b_w[0]
          // 将SGF格式坐标(如me)转换为A1格式
          if (sgfCoord.length >= 2) {
            let y = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0)
            let x = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0)
            if (y > 7) {
              y -= 1
            }
            if (x > 7) {
              x -= 1
            }
            lastMove = String.fromCharCode('A'.charCodeAt(0) + y) + (x + 1)
          } else {
            lastMove = sgfCoord
          }
        }
      }
      if (node.children) {
        for (const child of node.children) {
          count += 1
          traverse(child)
        }
      }
    }

    traverse(node)
    return {totalMoves: count, lastMove}
  }

  async getSgfByGolaxy(url, isD = false) {
    const response = await fetch(url)
    const d = await response.json()
    if (isD) {
      return d
    }
    const sgf = d && d.data.sgf
    this.sgf = sgf
    return sgf
  }

  async syncSgf(gameId, sgfContent) {
    // 同步SGF到应用中
    console.log(`同步游戏 ${gameId} 的SGF内容`)

    // 如果设置了回调，则调用回调函数
    if (this.syncSgfCallback) {
      try {
        await this.syncSgfCallback(gameId, sgfContent)
      } catch (error) {
        console.error('同步SGF回调执行失败:', error)
      }
    }
  }

  async requestGolaxyOrYikeMove(
    gameId,
    lastMoveNum,
    lastMove,
    playerBlack,
    playerWhite,
    isGolaxy = true
  ) {
    const data = await this.getGolaxyLive(gameId, lastMoveNum)
    if (data && data.length > 0) {
      const newMove = data[data.length - 1]
      if (newMove.moveNum > lastMoveNum) {
        console.log(`发现新的一手: ${newMove.moveNum}`)
        this.lastMoveNum = newMove.moveNum
        this.lastMove = JSON.parse(newMove.data).coord

        // 实时更新棋盘
        // 获取最新的完整SGF
        const url = this.isLive
          ? `${this.golaxyLiveUrl}/${gameId}`
          : `${this.engineGames}/0086-18602481789/${gameId}?id=${gameId}`
        const latestSgf = await this.getSgfByGolaxy(url)

        if (latestSgf) {
          // 加载最新的SGF并跳转到最后一手
          await this.syncSgf(gameId, latestSgf)

          // 保存新着信息
          lastMove = this.lastMove
          console.log(`新着: ${lastMove}`)
        }
      }
    }
  }
}

// 创建默认实例
const golaxy = new Golaxy()

async function getLiveReports(name = '', page = 0) {
  const reports = await golaxy.getLiveReports(name, page)
  return reports
}

async function syncGolaxyOrYikeLizban(liveIds, is_live = true) {
  golaxy.isLive = is_live
  const reports = await golaxy.syncGolaxyOrYikeLizban(liveIds)
  return reports
}

module.exports = {
  default: Golaxy,
  Golaxy,
  golaxy,
  getLiveReports,
  syncGolaxyOrYikeLizban
}
