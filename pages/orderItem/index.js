const app = getApp()

Page({
  data: {
    orderList: [],
  },
  onLoad: function (options) {
    this.getOrderList(options.type);
  },
  onShow: function () {
    
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/orderDetail/index?id=' + e.currentTarget.dataset.arg.id,
    });
  },
  getOrderList(type) {
    app.request('post', 'applet/order/getPageList', {
      query: {
        reservationStatus: Number(type)
      },
      page: {
        size: 999,
        current: 1,
      },
    }, (res) => {
      if (res.code == '0000') {
        const tempArr = res.data.records || [];
        tempArr.forEach((item) => {
          item.orderTm = app.formatTime(item.reservationDate);
        });
        this.setData({
          orderList: tempArr,
        });
        return;
      }
      app.toast(res.data);
    });
  },
})