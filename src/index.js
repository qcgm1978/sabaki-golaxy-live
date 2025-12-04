// 导出golaxy核心功能
export { default as Golaxy, golaxy, getLiveReports, syncGolaxyOrYikeLizban } from './golaxy.js';

// 导出GoCommunicate基类
export { default as GoCommunicate } from './GoCommunicate.js';

// 导出golaxyAgent相关功能
export { GolaxyLiveReportsAgent, AGENT_STATES, ERROR_TYPES, TOOL_TYPES } from './golaxyAgent.js';

// 导出GolaxyLiveWidget组件
export { default as GolaxyLiveWidget } from './GolaxyLiveWidget.js';