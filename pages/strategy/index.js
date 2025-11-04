const app = getApp();

Page({
  data: {
    areaOptions: [],
    activeIndex: '',
    listData: []
  },

  onLoad() {
    this.getDict();
  },
  getDict() {
    app.request('post', 'common/getDictTypeList', {}, (res) => {
      if (res.code == '0000') {
        const tempArr = res.data.find(item => item.dictCode == 'area_code').dictDataModelList || [];
        tempArr.forEach((item) => {
          item.text = item.dictLabel;
          item.value = item.dictValue;
        });
        this.setData({
          areaOptions: tempArr,
          activeIndex: tempArr[0].value,
        });
        this.getListData();
        return;
      }
      app.toast(res.msg);
    });
  },
  getListData() {
    const { activeIndex } = this.data;
    app.request('post', 'applet/travel/strategy/getPageList', {
      page: {
        pages: 0,
        size: 200
      },
      query: {
        strategyTab: activeIndex,
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

  // 选择标签事件
  selectTag(event) {
    this.setData({ activeIndex: event.currentTarget.dataset.tag });
    this.getListData();
  }
});