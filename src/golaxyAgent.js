const {getLiveReports} = require('./golaxy.js')

// 简单的Agent类实现
class Agent {
  constructor(id, name, type, description) {
    this.id = id
    this.name = name
    this.type = type
    this.description = description
    this.capabilities = []
    this.state = 'idle'
    this.history = []
  }

  addCapability(capability) {
    this.capabilities.push(capability)
  }

  setState(state) {
    this.state = state
  }

  addHistory(type, content) {
    this.history.push({type, content, timestamp: new Date()})
  }
}

// 常量定义
const AGENT_STATES = {
  IDLE: 'idle',
  ACTING: 'acting',
  ERROR: 'error'
}

const ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  API_ERROR: 'api_error',
  UNKNOWN_ERROR: 'unknown_error'
}

const TOOL_TYPES = {
  SYSTEM_INTEGRATION: 'system_integration'
}

// Golaxy直播报告智能体类
class GolaxyLiveReportsAgent extends Agent {
  constructor() {
    super(
      'golaxy-live-reports-agent',
      'Golaxy直播报告智能体',
      TOOL_TYPES.SYSTEM_INTEGRATION,
      '专业获取和分析Golaxy平台实时和历史围棋比赛直播数据的智能体'
    )
    this.addCapability('获取直播数据')
    this.addCapability('获取历史数据')
    this.addCapability('分析比赛信息')
  }

  // 实现execute方法
  async execute(params = {}) {
    this.setState(AGENT_STATES.ACTING)
    this.addHistory(
      'action',
      `正在获取Golaxy${
        params.type === 'history' ? '历史' : '直播'
      }报告数据，限制为${params.limit || 10}场比赛`
    )

    try {
      const {type = 'live', limit = 10} = params
      const reports = await getLiveReports(
        type === 'live' ? 'live' : 'history',
        limit
      )

      const result = {
        success: true,
        data: reports,
        content: `成功获取${type === 'live' ? '直播' : '历史'}比赛数据，共${
          reports.length
        }场比赛`,
        agentId: this.id,
        agentName: this.name
      }

      this.setState(AGENT_STATES.IDLE)
      this.addHistory('result', result.content)
      return result
    } catch (error) {
      console.error('获取Golaxy直播报告失败:', error)
      const errorResult = {
        success: false,
        error: error.message || '获取Golaxy直播报告失败',
        agentId: this.id,
        agentName: this.name
      }

      this.setState(AGENT_STATES.ERROR)
      this.addHistory('error', errorResult.error)
      return errorResult
    }
  }

  // 获取工具描述信息
  getToolDescription() {
    return {
      id: 'get-golaxy-live-reports',
      name: '获取Golaxy直播报告',
      description: '获取Golaxy平台的实时和历史围棋比赛直播数据',
      type: this.type,
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description:
              '要获取的报告类型，可以是"live"（直播）或"history"（历史）',
            enum: ['live', 'history'],
            default: 'live'
          },
          limit: {
            type: 'number',
            description: '返回的比赛数量限制',
            default: 10
          }
        }
      },
      handler: this.execute.bind(this)
    }
  }
}

module.exports = {
  GolaxyLiveReportsAgent,
  AGENT_STATES,
  ERROR_TYPES,
  TOOL_TYPES
}
