const app = getApp()

Page({
  data: {
    images: [],
    images1: [],
    title: "", // 标题输入内容
    scenicSpots: [], // 景点列表
    selectedSpotIndex: '', // 选中景点索引
    description: "" // 描述内容
  },
  onLoad() {
    this.getDict()
  },
  getDict() {
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
        this.setData({
          scenicSpots: records,
        });
        return;
      }
      app.toast(res.msg);
    });
  },
  // 标题输入事件
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },

  // 景点选择事件
  onSpotChange(e) {
    this.setData({
      selectedSpotIndex: e.detail.value
    });
  },

  // 描述输入事件
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
  },

  // 选择图片（支持多选）
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length, // 最多9张[7](@ref)
      sizeType: ['compressed'], // 压缩图片[6](@ref)
      success: async (res) => {
        try {
          for(let i=0; i<res.tempFilePaths.length; i++) {
            await this.uploadImg(res.tempFilePaths[i])
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    })
  },
  async uploadImg(imgUrl) {
    await wx.uploadFile({
      url: 'http://111.229.213.248:7002/common/uploadImage',
      filePath: imgUrl,
      name: 'file',
      success: (res) => {
        const { code, data, msg } = JSON.parse(res.data);
        if (code != '0000') return app.toast(msg)
        const newImages = [...this.data.images, imgUrl]
        const newImages1 = [...this.data.images1, data]
        this.setData({
          images: newImages.slice(0, 9),
          images1: newImages1.slice(0, 9)
        }) // 限制数量
      },
    })
  },
  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const newImages = this.data.images.filter((_, i) => i !== index)
    this.setData({
      images: newImages
    })
  },

  // 提交发布
  async submitPost() {
    if (!this.data.title) {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      })
      return
    }
    if (this.data.selectedSpotIndex == '') {
      wx.showToast({
        title: '景点不能为空',
        icon: 'none'
      })
      return
    }
    if (!this.data.description) {
      wx.showToast({
        title: '描述不能为空',
        icon: 'none'
      })
      return
    }

    app.request('post', 'applet/travel/createTraStrategy', {
      strategyType: 2,
      scenicId: this.data.scenicSpots[this.data.selectedSpotIndex].id,
      image: this.data.images1.join(','),
      name: this.data.title,
      content: this.data.description
    }, (res) => {
      if (res.code == '0000') {
        wx.showToast({
          title: '发布成功'
        })
        setTimeout(() => wx.navigateBack(), 1500)
        return;
      }
      app.toast(res.msg);
    });
  }
})