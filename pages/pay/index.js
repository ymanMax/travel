const app = getApp();

Page({
  data: {
    orderInfo: {},
    isComplete: false,
  },
  onLoad(options) {
    this.createOrder(options.type);
  },
  backHome() {
    wx.reLaunch({
      url: '/pages/home/index',
    });
  },
  createOrder(type) {
    const { priceAdult = '', id = '', price = '', scenicId = '' } = app.globalData.orderInfo;
    let scenicId1, price1;
    if (type) {
      scenicId1 = scenicId;
      price1 = price;
    } else {
      scenicId1 = id;
      price1 = priceAdult;
    }
    app.request('post', 'applet/travel/order/createOrderInfo', {
      scenicId: scenicId1,
      orderNum: 1,
      price: price1,
    }, (res) => {
      if (res.code != '0000') {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return;
      }
      this.setData({
        orderInfo: res.data,
      });
    });
  },
  submit() {
    app.confirm({ content: '确认支付吗？' }, (res) => {
      if (res.cancel) return;
      const { id } = this.data.orderInfo;
      app.request('post', 'applet/travel/order/paySuccess', { id }, (res) => {
        if (res.code != '0000') {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000,
            complete: () => {
              setTimeout(() => {
                this.setData({
                  isComplete: true,
                });
                wx.setNavigationBarTitle({
                  title: '提交成功',
                });
              }, 500);
            }
          });
        }
      });
    });
  }
})