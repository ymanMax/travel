const app = getApp();

Page({
  data: {
    detailType: '',
    title: '',
    imgHost: app.globalData.imgHost,
    dataInfo: {},
    priceAdult: 0,
    rowData: {},
  },
  onLoad(options) {
    this.setData({
      detailType: options.type,
    });
    this.getInfo(options.id, options.type);
  },
  toPhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.rowData.phone,
    })
  },
  toPay() {
    app.globalData.orderInfo = this.data.rowData;
    wx.navigateTo({
      url: '/pages/pay/index',
    });
  },
  // 获取数据
  getInfo(id, type) {
    const tempUrl = {
      '0': 'applet/travel/scenic/',
      '1': 'applet/travel/recommend/',
      '2': 'applet/travel/recommend/',
      '3': 'applet/travel/strategy/',
    };
    app.request('get', `${tempUrl[type || '0']}${id}`, {}, (res) => {
      if (res.code == '0000') {
        const { name, content, priceAdult = 0 } = res.data;
        let result = app.towxml(content,'markdown',{
          base: app.globalData.imgHost, // 相对资源的base路径
          theme: 'light', // 主题，默认`light`
          events:{  // 为元素绑定的事件方法
            tap:(e)=>{
              console.log('tap',e);
            }
          }
        });
        this.setData({
          title: name,
          priceAdult,
          rowData: res.data,
          dataInfo: result,
        });
        return;
      }
      app.toast(res.data);
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onShareTimeline() {
    
  }
});
