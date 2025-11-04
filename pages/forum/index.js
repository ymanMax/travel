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
  handleOpen(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      [`commentList[${index}].isOpen`]: !this.data.commentList[index].isOpen
    });
    console.log(1111, this.data.commentList[index]);
  },
  createComment() {
    wx.navigateTo({
      url: '/pages/add_comment/index',
    });
  },
  bindKeyInput(e) {
    const val = e.detail.value.replace(/[\r\n]+/g, '');
    this.setData({
      comment: val,
    });
  },
  // 显示评论输入框
  showCommentInput(event) {
    const { arg } = event.currentTarget.dataset;
    console.log(arg);
    this.setData({
      isCommentInputVisible: true,
      currentComment: arg
    });
  },
  cancelComment() {
    this.setData({
      isCommentInputVisible: false,
      currentComment: {},
      comment: ''
    });
  },
  // 显示评论输入框
  showCommentInput1(event) {
      const { arg } = event.currentTarget.dataset;
    this.setData({
      isCommentInputVisible: true,
      currentComment: arg
    });
  },
  handleLike(e) {
    const { arg, type } = e.currentTarget.dataset;
    let url = '';
    const reqData = {
      dataId: arg.id,
      toUserId: arg.createId
    };
    const findIndex = this.data.commentList.findIndex(item => item.id == arg.id)
    let setKey = '';
    if (type == '0') {
      reqData.isCollect = !arg.isCollect;
      setKey = [`commentList[${findIndex}].isCollect`];
      url = 'applet/travel/operation/collect';
    } else {
      reqData.isLike = !arg.isLike;
      setKey = [`commentList[${findIndex}].isLike`];
      url = 'applet/travel/operation/like';
    }
    app.request('post', url, reqData, (res) => {
      if (res.code == '0000') { 
        this.setData({
          [`${setKey}`]: type == '0' ? !arg.isCollect : !arg.isLike
        });
        if (type == '1') {
          this.setData({
            [`commentList[${findIndex}].likeNum`]: arg.isLike ? arg.likeNum - 1 : arg.likeNum + 1
          });
        }
        return;
      }
      app.toast(res.msg);
    }, null, true);

  },
  // 提交评论
  submitComment(e) {
    const { item: arg, itm = {} } = this.data.currentComment;
    this.setData({
      isCommentInputVisible: false,
    });
    app.request('post', 'applet/travel/comment/createUserComment', {
      dataId: arg.id,
      parentId: itm.id || 0,
      toUserId: itm.userId || null,
      content: this.data.comment
    }, (res) => {
      if (res.code == '0000') {
        this.setData({
          comment: ''
        });
        this.getStrategyPageList();
        return;
      }
      app.toast(res.msg);
    });
  },
  previewImg(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
        showmenu: false,
        urls: [`${this.data.imgHost}${url}`], // 需要预览的图片 http 链接列表
    });
  },
  getStrategyPageList() {
    app.request('post', 'applet/travel/strategy/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        strategyType: 2
      }
    }, (res) => {
      if (res.code == '0000') {
        const { records, current, pages } = res.data;
        records.forEach((item) => {
          item.date = app.parseDateTime(item.createTime)
          if (item.image) {
            item.imgList = item.image.split(',');
            item.imgWidth = this.getImageWidth(item.image.split(',').length);
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
  onReachBottom() {
    
  },
  getImageWidth(len) {
    if (len == 1) return '1';
    if (len > 1) return '';
  },
});