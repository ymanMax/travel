const app = getApp()

Page({
  data: {
    formData: {
      headPortraitLink: '',
      nickName: '',
      sex: '',
      birthday: '',
      phone: '',
      email: ''
    },
    genders: [{
        name: '男',
        value: '0'
      },
      {
        name: '女',
        value: '1'
      },
      {
        name: '保密',
        value: '2',
      }
    ]
  },
  onLoad() {
    this.getUserInfo();
  },
  getUserInfo() {
    const data = wx.getStorageSync('userInfo') || {};
    const { headPortraitLink, birthday } = data;
    this.setData({
      formData: {
        ...data,
        birthday: app.parseDateTime(birthday).split(' ')[0],
        headPortraitLink: app.globalData.imgHost + headPortraitLink
      }
    });
  },
  previewImg(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
        showmenu: false,
        urls: [url], // 需要预览的图片 http 链接列表
    });
  },
  chooseAvatar() {
    wx.chooseImage({
      count: 1, // 最多9张[7](@ref)
      sizeType: ['compressed'], // 压缩图片[6](@ref)
      success: async (res) => {
        this.uploadImg(res.tempFilePaths[0])
      }
    })
  },
  async uploadImg(imgUrl) {
    await wx.uploadFile({
      url: 'http://111.229.213.248:7002/common/uploadImage',
      filePath: imgUrl,
      name: 'file',
      success: (res) => {
        const {
          code,
          data,
          msg
        } = JSON.parse(res.data);
        if (code != '0000') return app.toast(msg)
        this.setData({
          'formData.headPortraitLink': app.globalData.imgHost + data
        })
      },
    })
  },

  // 表单输入处理
  bindInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  // 日期选择
  bindDateChange(e) {
    this.setData({
      'formData.birthday': e.detail.value
    })
  },

  // 单选框变更
  radioChange(e) {
    this.setData({
      'formData.sex': e.detail.value
    })
  },

  // 表单提交
  formSubmit(e) {
    const formData = e.detail.value
    console.log(1111, formData);
    // 添加验证逻辑
    if (!this.validateForm(formData)) return
    const {
      headPortraitLink,
      nickName,
      birthday,
      sex,
      email,
      phone
    } = formData;
    app.request('post', 'applet/user/updateAppletUser', {
      headPortraitLink,
      nickName,
      birthday,
      sex,
      email,
      phone
    }, (res) => {
      if (res.code == '0000') {
        wx.showToast({
          title: '操作成功'
        });
        app.globalData.backFresh = true;
        setTimeout(() => wx.navigateBack(), 1500)
        return;
      }
      app.toast(res.msg);
    });
  },

  // 表单验证
  validateForm(data) {
    if (!data.nickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return false
    }
    if (data.phone && !/^1[3-9]\d{9}$/.test(data.phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return false
    }
    if (data.email && !/^\w+@[a-z0-9]+\.[a-z]{2,4}$/.test(data.email)) {
      wx.showToast({
        title: '邮箱格式错误',
        icon: 'none'
      })
      return false
    }
    return true
  }
})