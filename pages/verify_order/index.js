// pages/verify_order/index.js
import wxbarcode from 'wxbarcode';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderNo: '202511040221',
    ticketInfo: {
      scenicName: '故宫博物院',
      ticketType: '成人票',
      ticketPrice: '60.00',
      validDate: '2025-11-04至2025-11-10',
      visitorName: '张三',
      visitorPhone: '138****8888',
      status: '未核销'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 生成二维码
    wxbarcode.qrcode('qrcode', this.data.orderNo, 400, 400);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})