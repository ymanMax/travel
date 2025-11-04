var util = require('./utils/util.js');

App({
  onLaunch: function () {
    var that = this;
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate ? '有版本更新' : '无版本更新');
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      })
    });
    updateManager.onUpdateFailed(function () {
      that.toast('版本更新失败');
    });
    wx.getSystemInfo({
      success: function (data) {
        that.globalData.pixelRatio  = data.pixelRatio;
        that.globalData.screenWidth  = data.screenWidth;
      }
    });
  },
  // 登录
  initLogin(code, callBack, failCb) {
    var that = this;
    wx.request({
      url: this.globalData.host + 'applet/user/login',
      data: { code },
      method: 'POST',
      success: function (res) {
        that.closeLoading();
        if (res.statusCode === 200) {
          const { token } = res.data.data;
          that.globalData.token = token;
          callBack();
          return;
        }
        that.toast('哎呀！服务器开小差啦');
        failCb && failCb(res);
      },
      fail: function (error) {
        that.closeLoading();
        that.toast('哎呀！服务器开小差啦');
        failCb && failCb(error);
      }
    });
  },
  // 请求数据Data
  requestData(method, url, data, sucCb, failCb, responseType) {
    var that = this;
    wx.request({
      url,
      data,
      method,
      responseType: responseType || 'text',
      header: { Authorization: that.globalData.token },
      success: function (res) {
        that.closeLoading();
        if (res.statusCode === 200) {
          sucCb(res.data);
          return;
        }
        that.toast('哎呀！服务器开小差啦');
        failCb && failCb(res);
      },
      fail: function (error) {
        that.closeLoading();
        that.toast('哎呀！服务器开小差啦');
        failCb && failCb(error);
      }
    });
  },
  // 封装请求方法
  request(method, argUrl, data, sucCb, failCb, noLoading, responseType) {
    var that = this;
    wx.getNetworkType({
      success (res) {
        if (res.networkType === 'none') {
          that.toast('网络异常，请稍后重试');
          return;
        }
        var url = that.globalData.host + argUrl;
        wx.login({
          success (res) {
            if (res.code) {
              !noLoading && that.loading();
              that.globalData.code = res.code;
              if (!that.globalData.token) {
                that.initLogin(res.code, () => {
                  that.requestData(method, url, data, sucCb, responseType);
                }, () => {
                  failCb && failCb(error);
                });
                return;
              }
              that.requestData(method, url, data, sucCb, failCb, responseType);
            }
          },
          fail: function (error) {
            that.closeLoading();
            that.toast('哎呀！服务器开小差啦');
            failCb && failCb(error);
          }
        });
      },
      fail: function() {
        that.toast('网络异常，请稍后重试');
      }
    });
  },
  globalData: {
    token: '',
    pixelRatio: 2, // 像素比
    screenWidth: 0, // 屏幕宽度
    openId: null, // 初次进入页面拿openID
    host: 'http://111.229.213.248:7002/', // 请求地址
    imgHost: 'http://111.229.213.248:7002', // 图片请求地址
    backNeedFresh: false,
    openId: '',
  },
  towxml :require('/towxml/index'),
  ...util,
});
