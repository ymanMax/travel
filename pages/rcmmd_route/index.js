const app = getApp();

Page({
  data: {
    imgHost: app.globalData.imgHost,
    activeIndex: '', // 当前激活的下拉菜单索引，默认为0
    activeIndex1: '', // 当前激活的下拉菜单索引，默认为0
    areaOptions: [],
    tagOptions: [],
    // 路线列表数据
    routeList: []
  },

  onLoad() {
    this.getDict();
  },
  pageSkip(e) {
    const { arg } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/info_detail/index?id=${arg.id}&type=3`,
    });
  },
  getDict() {
    app.request('post', 'common/getDictTypeList', {}, (res) => {
      if (res.code == '0000') {
        const tempArr = res.data.find(item => item.dictCode == 'strategy_tab').dictDataModelList || [];
        tempArr.forEach((item) => {
          item.text = item.dictLabel;
          item.value = item.dictValue;
        });
        this.setData({
          tagOptions: tempArr,
          activeIndex1: tempArr[0].value,
        });
        this.getDict1();
        return;
      }
      app.toast(res.msg);
    });
  },
  getDict1() {
    app.request('post', 'applet/travel/scenic/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {}
    }, (res) => {
      if (res.code == '0000') {
        const {
          records
        } = res.data;
        records.forEach((item) => {
          item.text = item.name;
          item.value = item.id;
        });
        records.unshift(
          { text: '全部', value: '' }
        );
        this.setData({
          areaOptions: records,
          activeIndex: records[0].value,
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
      activeIndex1
    } = this.data;
    app.request('post', 'applet/travel/strategy/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        strategyType: 1,
        scenicId: activeIndex,
        strategyTab: activeIndex1,
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
          routeList: this.data.currentPage != 1 ? [...this.data.routeList, ...records] : records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },

  // 区域改变事件
  onAreaChange(event) {
    this.setData({
      activeIndex: event.detail
    });
    this.getListData();
  },

  // 标签改变事件
  onTagChange(event) {
    this.setData({
      activeIndex1: event.detail
    });
    this.getListData();
  }
});