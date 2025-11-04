module.exports = {
  parseDateTime:(cellValue) => {
    if (cellValue == null || cellValue == "") return "";
    let date = new Date(cellValue)
    let year = date.getFullYear()
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    return year + '-' + month + '-' + day + " " + hour + ":" + minutes + ":" + second
  },
  // 格式化日期, dater日期，sign分隔符，fill是否补0
  formatDate: (date, sign, fill) => {
    const signStr = sign || '';
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (!fill) {
      month = month > 9 ? `${month}` : `0${month}`;
      day = day > 9 ? `${day}` : `0${day}`;
    }
    return `${year}${signStr}${month}${signStr}${day}`;
  },
  // 格式化日期--年月日时分秒
  formatTime: (arg) => {
    var date = arg ? new Date(arg) : new Date();  //实例一个时间对象；
    var year = date.getFullYear();  //获取系统的年；
    var month = date.getMonth()+1;  //获取系统月份，由于月份是从0开始计算，所以要加1
    month = month < 10 ? `0${month}` : month;
    var day = date.getDate(); // 获取系统日
    day = day < 10 ? `0${day}` : day;
    var hour = date.getHours(); //获取系统时间
    hour = hour < 10 ? `0${hour}` : hour;
    var minute = date.getMinutes(); //分
    minute = minute < 10 ? `0${minute}` : minute;
    var second = date.getSeconds(); //秒
    second = second < 10 ? `0${second}` : second;
    return year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second;
  },
  // 格式化数字
  formatNumber: (n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  // 确定&取消的弹框
  confirm: (obj, successCallback, failCallback) => {
    const tempObj = obj || {};
    const { cancelText = '取消', confirmText = '确定', cancelColor = '#999',
      confirmColor = '#e64340', content = '这是一个模态框', showCancel = true,
      title = '提示' } = tempObj;
    wx.showModal({
      title,
      content,
      cancelColor,
      cancelText,
      confirmText,
      confirmColor,
      showCancel,
      complete: (res) => {},
      fail: failCallback,
      success: successCallback,
    })
  },
  // 用户确认的弹窗
  prompt: function(obj, sucCallback) {
    const tempObj = obj || {};
    const { confirmText = '确定', confirmColor = '#e64340',
      content = '这是一个模态框', title = '提示' } = tempObj;
    wx.showModal({
      title,
      content,
      confirmText,
      confirmColor,
      success: sucCallback,
      showCancel: false
    });
  },
  toast: function(content) {
    wx.showToast({
      title: content || '出错啦！',
      icon: 'none',
      duration: 2000,
      mask: true,
    });
  },
  loading: (title) => {
    wx.showLoading({
      title: title || "加载中...",
      mask: true,
      icon: "loading",
      duration: 60000
    });
  },
  closeLoading: () => {
    wx.hideLoading();
  },
  dealErrorMsg: function(arg) {
    let msg = '哎呀！服务器开小差啦';
    switch (arg.statusCode) {
      case 404:
       break;
      case 200: {
        msg = arg.data.data || '哎呀！服务器开小差啦';
        break;
      }
    };
    this.toast(msg);
  },
};
