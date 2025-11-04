const app = getApp()

Page({
  data: {
    bookId: '',
    orderInfo: {},
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    const { id } = currentPage.options;
    this.setData({
      bookId: id,
    });
    this.getOrderInfo();
  },
  onPullDownRefresh() {
    this.getOrderInfo();
    wx.stopPullDownRefresh();
  },
  addMore() {
    wx.navigateTo({
      url: `/pages/choose/index?id=${this.data.bookId}`,
    })
  },
  // 获取预定信息
  getOrderInfo() {
    app.request('get', `applet/travel/order/${this.data.bookId}`, {}, (res) => {
      if (res.code == '0000') {
        const tempObj = res.data || {};
        tempObj.orderTm = app.formatTime(tempObj.reservationDate);
        this.setData({
          orderInfo: tempObj,
        });
        const orderStatusDict = wx.getStorageSync('orderStatusDict');
        const orderStatus = orderStatusDict.find(item => item.dictValue == tempObj.reservationStatus).dictLabel
        this.setData({
          orderStatus
        });
        return;
      }
      app.toast(res.data);
    });
  },
  goCreateOrder() {
    if (this.data.orderInfo.payStatus) {
      wx.navigateBack();
      return;
    }
    app.globalData.orderInfo = this.data.orderInfo;
    wx.navigateTo({
      url: '/pages/pay/index',
    });
  },
  async cartStepChange(e) {
    const token = wx.getStorageSync('token')
    const index = e.currentTarget.dataset.idx
    const item = this.data.getOrderInfo.items[index]
    if (e.detail < item.minBuyNumber) {
      // 删除商品
      wx.showLoading({
        title: '',
      })
      // const res = await WXAPI.shippingCarInfoRemoveItem(token, item.key)
      wx.hideLoading()
      if (res.code != 0 && res.code != 700) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      this.getOrderInfo()
    } else {
      // 修改数量
      wx.showLoading({
        title: '',
      })
      // const res = await WXAPI.shippingCarInfoModifyNumber(token, item.key, e.detail)
      wx.hideLoading()
      if (res.code != 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        return
      }
      this.getOrderInfo()
    }
  },
  async clearCart() {
    wx.showLoading({
      title: '',
    })
    // const res = await WXAPI.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
    wx.hideLoading()
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.getOrderInfo()
  },
})