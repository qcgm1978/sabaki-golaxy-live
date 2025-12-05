// 导出golaxy核心功能
const golaxyModule = require('./golaxy.js')
const GoCommunicateModule = require('./GoCommunicate.js')
const golaxyAgentModule = require('./golaxyAgent.js')
const GolaxyLiveWidgetModule = require('./GolaxyLiveWidget.js')

module.exports = {
  Golaxy: golaxyModule.default,
  golaxy: golaxyModule.golaxy,
  getLiveReports: golaxyModule.getLiveReports,
  syncGolaxyOrYikeLizban: golaxyModule.syncGolaxyOrYikeLizban,
  GoCommunicate: GoCommunicateModule.default,
  GolaxyLiveReportsAgent: golaxyAgentModule.GolaxyLiveReportsAgent,
  AGENT_STATES: golaxyAgentModule.AGENT_STATES,
  ERROR_TYPES: golaxyAgentModule.ERROR_TYPES,
  TOOL_TYPES: golaxyAgentModule.TOOL_TYPES,
  GolaxyLiveWidget: GolaxyLiveWidgetModule.default
}
