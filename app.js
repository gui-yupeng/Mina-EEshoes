// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        
      }
    })
    //订阅消息权限
    wx.requestSubscribeMessage({
      tmplIds:"ugKAFLpJbmTrwnRX3K_XNYlqOx77SsQJNwdcgdn4p2k",
      success:(res)=>{
        console.log("订阅消息权限开启");
      }
    });
  },
  globalData: {
    userInfo: null
  }
})
