const app = getApp()

Page({
  data: {
    msgList: [],
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    this.getMsgList();
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/orderDetail/index?id=' + e.currentTarget.dataset.arg.id,
    });
  },
  getMsgList() {
    app.request('post', 'applet/user/getPageMessage', {
      query: {},
      page: {
        size: 999,
        current: 1,
      },
    }, (res) => {
      if (res.code == '0000') {
        this.setData({
          msgList: res.data.records || [],
        });
        return;
      }
      app.toast(res.mag);
    });
  },
})