const app = getApp();

Page({
  data: {
    imgHost: app.globalData.imgHost,
    swiperList: [
      { id: 1, img: 'https://image.xiaoxiaofeng.site/blog/image/4bb50154829ff014b23ab2ca5a20be7.jpg?xiaoxiaofeng=' },
      { id: 2, img: 'https://image.xiaoxiaofeng.site/blog/image/bdac7d8af0e6f97c40455765107e7e7.jpg?xiaoxiaofeng' },
      { id: 3, img: 'https://image.xiaoxiaofeng.site/blog/image/3b5e3f2dc8000b3fddc3a5faa42c097.jpg?xiaoxiaofeng' }
    ],
    quickEntries: [
      { id: 1, title: '景区门票', icon: '../../images/icons/menpiao.png', type: 1, url: '/pages/ticket/index' },
      { id: 2, title: '精品路线', icon: '../../images/icons/luxian.png', type: 2, url: '/pages/rcmmd_route/index' },
      { id: 3, title: '游记攻略', icon: '../../images/icons/gonglve.png', type: 3, url: '/pages/forum/index' },
      { id: 4, title: '美食推荐', icon: '../../images/icons/meishi.png', type: 4, url: '/pages/rcmmd_food/index' }
    ],
    tabs: ['玩什么', '吃什么', '住哪里'],
    activeTab: 0,
    listData: [],
    hotData: [],
  },
  onLoad() {
    this.getListData();
    this.getHotData();
  },
  getHotData() {
    app.request('post', 'applet/travel/scenic/getPageList', {
      page: {
        pages: 0,
        size: 20
      },
      query: {

      }
    }, (res) => {
      if (res.code == '0000') {
        const { records } = res.data;
        this.setData({
          hotData: records.slice(0,3),
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  getListData() {
    app.request('post', 'applet/travel/scenic/getPageList', {
      page: {
        pages: 0,
        size: 20
      },
      query: {

      }
    }, (res) => {
      if (res.code == '0000') {
        const { records, current, pages } = res.data;
        this.setData({
          allPage: pages,
          currentPage: current,
          listData: this.data.currentPage != 1 ? [...this.data.listData, ...records] : records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  getListData1(index) {
    app.request('post', 'applet/travel/recommend/getPageList', {
      page: {
        pages: 0,
        size: 20
      },
      query: {
        recommendType: index
      }
    }, (res) => {
      if (res.code == '0000') {
        const { records, current, pages } = res.data;
        this.setData({
          allPage: pages,
          currentPage: current,
          listData: this.data.currentPage != 1 ? [...this.data.listData, ...records] : records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  pageSkip(e) {
    const { url, type } = e.currentTarget.dataset.arg;
    if (type == 1 || type == 3) {
      wx.switchTab({
        url,
      });
      return;
    }
    wx.navigateTo({
      url,
    });
  },
  toTicket() {
    wx.switchTab({
      url: '/pages/ticket/index',
    })
  },
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index })
    index == '0' && this.getListData();
    index != '0' && this.getListData1(index);
  },
  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/info_detail/index?id=' + id + '&type=' + this.data.activeTab,
    });
  }
})
