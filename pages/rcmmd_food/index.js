const app = getApp();

Page({
  data: {
    imgHost: app.globalData.imgHost,
    tagOptions: [],
    activeIndex: '',
    foodList: []
  },
  onLoad() {
    this.getDict();
  },
  pageSkip(e) {
    const { arg } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/info_detail/index?id=${arg.id}&type=1`,
    });
  },
  getDict() {
    app.request('post', 'common/getDictTypeList', {}, (res) => {
      if (res.code == '0000') {
        const tempArr = res.data.find(item => item.dictCode == 'recommend_tab').dictDataModelList || [];
        this.setData({
          tagOptions: tempArr,
          activeIndex: tempArr[0].dictValue,
        });
        this.getListData();
        return;
      }
      app.toast(res.msg);
    });
  },
  getListData() {
    const {
      activeIndex,
    } = this.data;
    app.request('post', 'applet/travel/recommend/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        recommendType: 1,
        recommendTab: activeIndex,
      }
    }, (res) => {
      if (res.code == '0000') {
        const {
          records,
          current,
          pages
        } = res.data;
        this.setData({
          allPage: pages,
          currentPage: current,
          foodList: this.data.currentPage != 1 ? [...this.data.foodList, ...records] : records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  // 选择标签事件
  selectTag(event) {
    const activeIndex = event.currentTarget.dataset.tag;
    this.setData({ activeIndex });
    this.getListData();
  }
});