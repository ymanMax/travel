
const app = getApp();

Page({
  data: {
    imgHost: app.globalData.imgHost,
    listData: [],
    swiperList: [],
    activeIndex: '', // 当前激活的下拉菜单索引，默认为0
    activeIndex1: '', // 当前激活的下拉菜单索引，默认为0
    areaOptions: [],
    tagOptions: [],
  },

  onLoad() {
    this.getDict();
    this.getHotData();
  },
  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/info_detail/index?id=' + id + '&type=0',
    });
  },
  getDict() {
    app.request('post', 'common/getDictTypeList', {}, (res) => {
      if (res.code == '0000') {
        const tempArr = res.data.find(item => item.dictCode == 'area_code').dictDataModelList || [];
        tempArr.forEach((item) => {
          item.text = item.dictLabel;
          item.value = item.dictValue;
        });
        const tempArr1 = res.data.find(item => item.dictCode == 'scenic_type').dictDataModelList || [];
        tempArr1.forEach((item) => {
          item.text = item.dictLabel;
          item.value = item.dictValue;
        });
        this.setData({
          areaOptions: tempArr,
          tagOptions: tempArr1,
          activeIndex: tempArr[0].value,
          activeIndex1: tempArr1[0].value,
        });
        this.getListData();
        return;
      }
      app.toast(res.msg);
    });
  },
  getListData() {
    const { activeIndex, activeIndex1 } = this.data;
    app.request('post', 'applet/travel/scenic/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        areaCode: activeIndex,
        tagOptions: activeIndex1,
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
  getHotData() {
    app.request('post', 'applet/travel/scenic/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {}
    }, (res) => {
      if (res.code == '0000') {
        const { records } = res.data;
        this.setData({
          swiperList: records.slice(0,3)
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  // 区域改变事件
  onAreaChange(event) {
    this.setData({ activeIndex: event.detail });
    this.getListData();
  },

  // 标签改变事件
  onTagChange(event) {
    this.setData({ activeIndex1: event.detail });
    this.getListData();
  }
});