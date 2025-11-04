const app = getApp()

Page({
  data: {
    noBack: false,
    orderInfo: {},
    bookId: '',
    goods: [],
    showCartPop: false, // 是否显示购物车列表
    showGoodsDetailPOP: false, // 是否显示商品详情

    showPingtuanPop: false,
    share_goods_id: undefined,
    share_pingtuan_open_id: undefined,
    lijipingtuanbuy: false,
    pingtuan_open_id: undefined
  },  
  onLoad: function (options) {
    this.setData({
      bookId: options.id,
      noBack: options.type
    })
    this.getCartInfo(options.id)
  },
  onShow: function(){
    
  },
  // 获取购物车信息
  getCartInfo(bookId, fresh) {
    app.request('get', `applet/order/${bookId}`, {}, (res) => {
      if (res.code == '0000') {
        const tempObj = res.data || {};
        tempObj.orderTm = app.formatTime(tempObj.reservationDate);
        this.setData({
          orderInfo: tempObj,
        });
        if (fresh) {
          this.dealNum(this.data.goods)
        } else {
          this.categories()
        }
        return;
      }
      this.categories()
      app.toast(res.data);
    });
  },
  // 获取分类
  categories() {
    app.request('get', 'applet/user/getDictByCode/dishes_type', {
      query: {},
      page: {
        size: 20,
        current: 1,
      },
    }, (res) => {
      if (res.code == '0000') {
        this.setData({
          categories: res.data || [],
          categorySelected: res.data[0] || {}
        });
        this.getGoodsList()
        return;
      }
      app.toast(res.data);
    });
  },
  getGoodsList() {
    app.request('post', 'applet/dishes/getPageList', {
      query: {
        type: this.data.categorySelected.dictValue,
      },
      page: {
        size: 20,
        current: 1,
      },
    }, (res) => {
      if (res.code == '0000') {
        const { records = [] } = res.data
        this.dealNum(records)
        return
      }
      app.toast(res.data);
    });
  },
  dealNum(records) {
    const { orderDishesModels } = this.data.orderInfo
    records.forEach(item => item.hasNum = 0)
    orderDishesModels.forEach((item) => {
      records.forEach((itm) => {
        if (item.dishesId == itm.id) {
          itm.hasNum = item.dishesNum
        }
      })
    });
    this.setData({
      goods: records
    })
  },
  cartStepChange(e) {
    const { orderDishesModels } = this.data.orderInfo
    const tempOrder = JSON.parse(JSON.stringify(orderDishesModels))
    const { idx } = e.currentTarget.dataset
    if (e.detail == 0) {
      tempOrder.splice(idx, 1)
    } else {
      tempOrder[idx].dishesNum = e.detail
    }
    this.sendCart(tempOrder)
  },
  sendCart(tempOrder) {
    app.request('post', 'applet/order/changeOrderDishes', {
      orderDishesModels: tempOrder,
      id: this.data.bookId,
    }, (res) => {
      if (res.code != '0000') {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      } else {
        this.setData({
          'orderInfo.orderDishesModels': tempOrder
        })
        this.getCartInfo(this.data.bookId, true); // 刷新购物车
      }
    });
  },
  addCart(e) {
    const index = e.currentTarget.dataset.idx
    const chooseItem = this.data.goods[index]
    wx.showLoading({
      title: '',
    })
    const { orderDishesModels } = this.data.orderInfo
    const tempOrder = JSON.parse(JSON.stringify(orderDishesModels))
    const hasIndex = tempOrder.findIndex(item => item.dishesId == chooseItem.id)
    if (hasIndex > -1) {
      tempOrder[hasIndex].dishesNum += 1
    } else {
      tempOrder.push({
        dishesNum: 1,
        dishesId: chooseItem.id,
        dishesPrice: chooseItem.dishesPrice
      })
    }
    this.sendCart(tempOrder)
  },
  goPay() {
    if (this.data.noBack) {
      wx.navigateTo({
        url: `/pages/orderDetail/index?id=${this.data.bookId}`
      })
      return
    }
    wx.navigateBack()
  },
  showCartPop() {
    this.setData({
      showCartPop: true
    })
  },
  hideCartPop() {
    this.setData({
      showCartPop: false
    })
  },
  clearCart() {
    app.confirm({ content: '确认清空购物车？' }, (res) => {
      if (res.cancel) return
      wx.showLoading({
        title: '',
      })
      this.sendCart([])
    })
  },
  categoryClick(e) {
    const index = e.currentTarget.dataset.idx
    const categorySelected = this.data.categories[index]
    this.setData({
      page: 1,
      categorySelected,
      scrolltop: 0
    })
    this.getGoodsList()
  },
  async shippingCarInfo() {
    const res = await WXAPI.shippingCarInfo(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        shippingCarInfo: res.data
      })
    } else {
      this.setData({
        shippingCarInfo: null,
        showCartPop: false
      })
    }
    this.processBadge()
  },
  async skuClick(e) {
    const index1 = e.currentTarget.dataset.idx1
    const index2 = e.currentTarget.dataset.idx2
    const curGoodsMap = this.data.curGoodsMap
    curGoodsMap.properties[index1].childsCurGoods.forEach(ele => {
      ele.selected = false
    })
    curGoodsMap.properties[index1].childsCurGoods[index2].selected = true
    this.setData({
      curGoodsMap
    })
    this.calculateGoodsPrice()
  },
  async calculateGoodsPrice() {
    const curGoodsMap = this.data.curGoodsMap
    // 计算最终的商品价格
    let price = curGoodsMap.basicInfo.minPrice
    let originalPrice = curGoodsMap.basicInfo.originalPrice
    let totalScoreToPay = curGoodsMap.basicInfo.minScore
    let buyNumMax = curGoodsMap.basicInfo.stores
    let buyNumber = curGoodsMap.basicInfo.minBuyNumber
    if (this.data.shopType == 'toPingtuan') {
      price = curGoodsMap.basicInfo.pingtuanPrice
    }
    // 计算 sku 价格
    const canSubmit = this.skuCanSubmit()
    if (canSubmit) {
      let propertyChildIds = "";
      if (curGoodsMap.properties) {
        curGoodsMap.properties.forEach(big => {
          const small = big.childsCurGoods.find(ele => {
            return ele.selected
          })
          propertyChildIds = propertyChildIds + big.id + ":" + small.id + ","
        })
      }
      const res = await WXAPI.goodsPrice(curGoodsMap.basicInfo.id, propertyChildIds)
      if (res.code == 0) {
        price = res.data.price
        if (this.data.shopType == 'toPingtuan') {
          price = res.data.pingtuanPrice
        }
        originalPrice = res.data.originalPrice
        totalScoreToPay = res.data.score
        buyNumMax = res.data.stores
      }
    }
    // 计算时段定价的价格
    if (this.data.goodsTimesSchedule) {
      const a = this.data.goodsTimesSchedule.find(ele => ele.active)
      if (a) {
        const b = a.items.find(ele => ele.active)
        if (b) {
          price = b.price
          buyNumMax = b.stores
        }
      }
    }
    // 计算配件价格
    if (this.data.goodsAddition) {
      this.data.goodsAddition.forEach(big => {
        big.items.forEach(small => {
          if (small.active) {
            price = (price*100 + small.price*100) / 100
          }
        })
      })
    }
    curGoodsMap.price = price
    this.setData({
      curGoodsMap,
      buyNumMax
    });
  },
  async skuClick2(e) {
    const propertyindex = e.currentTarget.dataset.idx1
    const propertychildindex = e.currentTarget.dataset.idx2

    const goodsAddition = this.data.goodsAddition
    const property = goodsAddition[propertyindex]
    const child = property.items[propertychildindex]
    if (child.active) {
      // 该操作为取消选择
      child.active = false
      this.setData({
        goodsAddition
      })
      this.calculateGoodsPrice()
      return
    }
    // 单选配件取消所有子栏目选中状态
    if (property.type == 0) {
      property.items.forEach(child => {
        child.active = false
      })
    }
    // 设置当前选中状态
    child.active = true
    this.setData({
      goodsAddition
    })
    this.calculateGoodsPrice()
  },
  skuCanSubmit() {
    const curGoodsMap = this.data.curGoodsMap
    let canSubmit = true
    if (curGoodsMap.properties) {
      curGoodsMap.properties.forEach(big => {
        const small = big.childsCurGoods.find(ele => {
          return ele.selected
        })
        if (!small) {
          canSubmit = false
        }
      })
    }
    if (this.data.goodsTimesSchedule) {
      const a = this.data.goodsTimesSchedule.find(ele => ele.active)
      if (!a) {
        canSubmit = false
      } else {
        const b = a.items.find(ele => ele.active)
        if (!b) {
          canSubmit = false
        }
      }
    }
    return canSubmit
  },
  additionCanSubmit() {
    const curGoodsMap = this.data.curGoodsMap
    let canSubmit = true
    if (curGoodsMap.basicInfo.hasAddition) {
      this.data.goodsAddition.forEach(ele => {
        if (ele.required) {
          const a = ele.items.find(item => {return item.active})
          if (!a) {
            canSubmit = false
          }
        }
      })
    }
    return canSubmit
  },
  async addCart2() {
    const token = wx.getStorageSync('token')
    const curGoodsMap = this.data.curGoodsMap
    const canSubmit = this.skuCanSubmit()
    const additionCanSubmit = this.additionCanSubmit()
    if (!canSubmit || !additionCanSubmit) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    const sku = []
    if (curGoodsMap.properties) {
      curGoodsMap.properties.forEach(big => {
        const small = big.childsCurGoods.find(ele => {
          return ele.selected
        })
        sku.push({
          optionId: big.id,
          optionValueId: small.id
        })
      })
    }
    const goodsAddition = []
    if (this.data.goodsAddition) {
      this.data.goodsAddition.forEach(ele => {
        ele.items.forEach(item => {
          if (item.active) {
            goodsAddition.push({
              id: item.id,
              pid: item.pid
            })
          }
        })
      })
    }
    wx.showLoading({
      title: '',
    })
    const d = {
      token,
      goodsId: curGoodsMap.basicInfo.id,
      number: curGoodsMap.number,
      sku: sku && sku.length > 0 ? JSON.stringify(sku) : '',
      addition: goodsAddition && goodsAddition.length > 0 ? JSON.stringify(goodsAddition) : '',
    }
    if (this.data.goodsTimesSchedule) {
      const a = this.data.goodsTimesSchedule.find(ele => ele.active)
      if (a) {
        const b = a.items.find(ele => ele.active)
        if (b) {
          d.goodsTimesDay = a.day
          d.goodsTimesItem = b.name
        }
      }
    }
    const res = await WXAPI.shippingCarInfoAddItemV2(d)
    wx.hideLoading()
    if (res.code == 2000) {
      this.hideGoodsDetailPOP()
      return
    }
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    this.hideGoodsDetailPOP()
    this.shippingCarInfo()
  },
  goodsStepChange(e) {
    const curGoodsMap = this.data.curGoodsMap
    curGoodsMap.number = e.detail
    this.setData({
      curGoodsMap
    })
  },
  async showGoodsDetailPOP(e) {
    const index = e.currentTarget.dataset.idx
    const goodsId = this.data.goods[index].id
    this._showGoodsDetailPOP(goodsId)
    this.goodsAddition(goodsId)
    this._goodsTimesSchedule(goodsId)
  },
  async _showGoodsDetailPOP(goodsId) {
    const token = wx.getStorageSync('token')
    const res = await WXAPI.goodsDetail(goodsId)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.hideTabBar()
    res.data.price = res.data.basicInfo.minPrice
    res.data.number = res.data.basicInfo.minBuyNumber
    const _data = {
      curGoodsMap: res.data,
      pingtuan_open_id: null,
      lijipingtuanbuy: false
    }
    if (res.data.basicInfo.pingtuan) {
      _data.showPingtuanPop = true
      _data.showGoodsDetailPOP = false
      // 获取拼团设置
      const resPintuanSet = await WXAPI.pingtuanSet(goodsId)
      if (resPintuanSet.code != 0) {
        _data.showPingtuanPop = false
        _data.showGoodsDetailPOP = true
        wx.showToast({
          title: "拼团功能未开启",
          icon: 'none'
        })
        return
      } else {
        _data.pintuanSet = resPintuanSet.data
        // 是否是别人分享的团进来的
        if (this.data.share_goods_id && this.data.share_goods_id == goodsId && this.data.share_pingtuan_open_id) {
          // 分享进来的
          _data.pingtuan_open_id = this.data.share_pingtuan_open_id
        } else {
          // 不是通过分享进来的
          const resPintuanOpen = await WXAPI.pingtuanOpen(token, goodsId)
          if (resPintuanOpen.code != 0) {
            wx.showToast({
              title: resPintuanOpen.msg,
              icon: 'none'
            })
            return
          }
          _data.pingtuan_open_id = resPintuanOpen.data.id
        }
        // 读取拼团记录
        const helpUsers = []
        for (let i = 0; i < _data.pintuanSet.numberOrder; i++) {
          helpUsers[i] = '/images/who.png'
        }
        _data.helpNumers = 0
        const resPingtuanJoinUsers = await WXAPI.pingtuanJoinUsers(_data.pingtuan_open_id)
        if (resPingtuanJoinUsers.code == 700 && this.data.share_pingtuan_open_id) {
          this.data.share_pingtuan_open_id = null
          this._showGoodsDetailPOP(goodsId)
          return
        }
        if (resPingtuanJoinUsers.code == 0) {
          _data.helpNumers = resPingtuanJoinUsers.data.length
          resPingtuanJoinUsers.data.forEach((ele, index) => {
            if (_data.pintuanSet.numberOrder > index) {
              helpUsers.splice(index, 1, ele.apiExtUserHelp.avatarUrl)
            }
          })
        }
        _data.helpUsers = helpUsers
      }
    } else {
      _data.showPingtuanPop = false
      _data.showGoodsDetailPOP = true
    }
    this.setData(_data)
  },
  hideGoodsDetailPOP() {
    this.setData({
      showGoodsDetailPOP: false,
      showPingtuanPop: false
    })
    if (!this.data.scanDining) {
      wx.showTabBar()
    }
  },
  async goodsAddition(goodsId){
    const res = await WXAPI.goodsAddition(goodsId)
    if (res.code == 0) {
      this.setData({
        goodsAddition: res.data
      })
    } else {
      this.setData({
        goodsAddition: null
      })
    }
  },
  tabbarChange(e) {
    if (e.detail == 1) {
      wx.navigateTo({
        url: '/pages/orderDetail/index',
      })
    }
    if (e.detail == 2) {
      wx.navigateTo({
        url: '/pages/orderDetail/order',
      })
    }
  },
  // 显示分类和商品数量徽章
  processBadge() {
    const categories = this.data.categories
    const goods = this.data.goods
    const shippingCarInfo = this.data.shippingCarInfo
    if (!categories) {
      return
    }
    if (!goods) {
      return
    }
    categories.forEach(ele => {
      ele.badge = 0
    })
    goods.forEach(ele => {
      ele.badge = 0
    })
    if (shippingCarInfo) {
      shippingCarInfo.items.forEach(ele => {
        if (ele.categoryId) {
          const category = categories.find(a => {
            return a.id == ele.categoryId
          })
          if (category) {
            category.badge += ele.number
          }
        }
        if (ele.goodsId) {
          const _goods = goods.find(a => {
            return a.id == ele.goodsId
          })
          if (_goods) {
            _goods.badge += ele.number
          }
        }
      })
    }
    this.setData({
      categories,
      goods
    })
  },
  goGoodsDetail(e) {
    const index = e.currentTarget.dataset.idx
    const goodsId = this.data.goods[index].id
    wx.navigateTo({
      url: '/pages/goods-details/index?id=' + goodsId,
    })
  },
  async _goodsTimesSchedule(goodsId) {
    const res = await WXAPI.goodsTimesSchedule(goodsId, '') // todo sku
    if (res.code == 0) {
      const goodsTimesSchedule = res.data
      res.data.forEach(ele => {
        ele.active = false
      })
      goodsTimesSchedule[0].active = true
      goodsTimesSchedule[0].items[0].active = true
      this.setData({
        goodsTimesSchedule
      })
      this.calculateGoodsPrice()
    } else {
      this.setData({
        goodsTimesSchedule: null
      })
    }
  },
  async skuClick3(e) {
    const propertyindex = e.currentTarget.dataset.idx1
    const propertychildindex = e.currentTarget.dataset.idx2

    const goodsTimesSchedule = this.data.goodsTimesSchedule
    const property = goodsTimesSchedule[propertyindex]
    const child = property.items[propertychildindex]
    if (child.stores <= 0) {
      wx.showToast({
        title: '已售罄',
        icon: 'none'
      })
      return
    }
    goodsTimesSchedule.forEach(a => {
      a.active = false
      a.items.forEach(b => {
        b.active = false
      })
    })
    property.active = true
    child.active = true
    this.setData({
      goodsTimesSchedule
    })
    this.calculateGoodsPrice()
  },
})
