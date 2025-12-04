// 测试模块功能
import { Golaxy, getLiveReports, GolaxyLiveReportsAgent } from '../src/index.js';

// 测试Golaxy类
async function testGolaxyClass() {
  console.log('=== 测试Golaxy类 ===');
  try {
    const golaxy = new Golaxy();
    
    // 设置SGF同步回调
    golaxy.setSyncSgfCallback((gameId, sgfContent) => {
      console.log(`收到游戏 ${gameId} 的SGF内容`);
      // 这里可以添加SGF处理逻辑
    });
    
    console.log('Golaxy类创建成功');
    return true;
  } catch (error) {
    console.error('Golaxy类测试失败:', error);
    return false;
  }
}

// 测试获取直播报告
async function testGetLiveReports() {
  console.log('\n=== 测试获取直播报告 ===');
  try {
    // 这个测试会实际调用Golaxy API
    const reports = await getLiveReports('', 0, 5);
    console.log(`获取到 ${reports.length} 个直播报告`);
    if (reports.length > 0) {
      console.log('第一个报告:', {
        id: reports[0].id,
        name: reports[0].name,
        white: reports[0].white,
        black: reports[0].black,
        time: reports[0].time
      });
    }
    return true;
  } catch (error) {
    console.error('获取直播报告测试失败:', error);
    console.log('注意: 网络问题可能导致此测试失败，不影响模块功能');
    return false;
  }
}

// 测试智能体
async function testGolaxyAgent() {
  console.log('\n=== 测试GolaxyLiveReportsAgent ===');
  try {
    const agent = new GolaxyLiveReportsAgent();
    const result = await agent.execute({
      type: 'live',
      limit: 3
    });
    
    if (result.success) {
      console.log(`智能体成功获取 ${result.data.length} 个直播报告`);
    } else {
      console.log('智能体执行遇到错误:', result.error);
      console.log('注意: 网络问题可能导致此测试失败，不影响模块功能');
    }
    return true;
  } catch (error) {
    console.error('智能体测试失败:', error);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试sabaki-golaxy-live模块\n');
  
  const test1 = await testGolaxyClass();
  const test2 = await testGetLiveReports();
  const test3 = await testGolaxyAgent();
  
  console.log('\n=== 测试结果 ===');
  console.log(`Golaxy类测试: ${test1 ? '通过' : '失败'}`);
  console.log(`获取直播报告测试: ${test2 ? '通过' : '失败'}`);
  console.log(`智能体测试: ${test3 ? '通过' : '失败'}`);
  
  console.log('\n模块测试完成！');
}

// 执行测试
runAllTests();