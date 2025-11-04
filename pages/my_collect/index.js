const app = getApp();

Page({
  data: {
    imgHost: app.globalData.imgHost,
    commentList: [], // 所有帖子数据
    isCommentInputVisible: false,
    comment: '',
    currentComment: {}
  },
  onShow() {
    this.getStrategyPageList();
  },
  onLoad() {
    
  },
  previewImg(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
        showmenu: false,
        urls: [`${this.data.imgHost}${url}`], // 需要预览的图片 http 链接列表
    });
  },
  getStrategyPageList() {
    app.request('post', 'applet/travel/operation/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        isCollect: true,
      }
    }, (res) => {
      if (res.code == '0000') {
        const { records, current, pages } = res.data;
        records.forEach((item) => {
          item.date = `${item.createTime.split('.')[0].split('T').join(' ')}`
          if (item.traStrategyModel.image) {
            item.imgList = item.traStrategyModel.image.split(',');
            item.imgWidth = this.getImageWidth(item.traStrategyModel.image.split(',').length);
          }
        });
        this.setData({
          allPage: pages,
          currentPage: current,
          commentList: this.data.currentPage != 1 ? [...this.data.commentList, ...records] : records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  deleteItem(e) {
    const { arg } = e.currentTarget.dataset;
    app.confirm({ content: '取消收藏吗？' }, (res) => {
      if (res.cancel) return;
      const url = 'applet/travel/operation/deleteOperation/' + arg.id
      app.request('delete', url, {}, (res) => {
        if (res.code == '0000') {
          this.getStrategyPageList();
          return;
        }
        app.toast(res.msg);
      });
    });
  },
  onReachBottom() {
    
  },
  getImageWidth(len) {
    if (len == 1) return '1';
    if (len > 1) return '';
  },
});