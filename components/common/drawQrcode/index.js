const app = getApp();
import drawQrcode from "./weapp.qrcode.esm";
let canvas = undefined;
// options:{
//   width:360, //二维码宽
//   height:360, //二维码高
//   qrUrl:"",  //二维码链接  //动态生成 setData 会重新触发生成
//   logoOptions:{
//     logoUrl: '/assets/img/logo.png', //二维码中心logo图片地址
//     width: '',  //二维码中心logo图片宽度
//     height: '', //二维码中心logo图片高度
//     round:false //二维码中心logo图片是否为圆形   true 圆  false 方
//   }
// }

/* <drawQrcode  bindOutQR="OutQR" style="position: fixed; left: 99999;" options="{{options}}"></drawQrcode> */
Component({
  properties: {
    is_outQR: {
      type: Boolean,
      value: false
    },
    options: {
      type: Object,
      observer: function (newval) {
        if (newval.qrUrl && newval.qrUrl != '')
          this.createQrCode();
      }
    },
  },
  data: {
  },
  methods: {
    // 生成二维码
    createQrCode() {
      if (this.properties.options.logoOptions) {
        const logoOptions = this.properties.options.logoOptions;
        let img = canvas.createImage();
        img.src = logoOptions.logoUrl;
        img.onload = () => {
          const { width, height, round } = logoOptions;
          let image = {
            imageResource: img,
            width: width || 40, // 建议不要设置过大，以免影响扫码
            height: height || 40, // 建议不要设置过大，以免影响扫码
            round: round && true, // Logo图片是否为圆形
          };
          this.outPNG(image);
          return;
        };
      }
      this.outPNG();
    },
    outPNG(image) {
      const {
        qrUrl,
        width = "260",
        height = "260"
      } = this.properties.options;
      app.loading();
      drawQrcode({
        canvas: canvas,
        canvasId: "myQrcode",
        width,
        height,
        padding: 0,
        background: "#ffffff",
        foreground: "#000000",
        text: qrUrl,
        correctLevel: 1, //纠错等级
        // L1 水平 7%的字码可被修正
        // M0 水平 15%的字码可被修正
        // Q3 水平 25%的字码可被修正
        // H2 水平 30%的字码可被修正
        image: image,
      });
      if (!this.properties.is_outQR) return app.closeLoading();
      wx.canvasToTempFilePath({
        canvasId: "myQrcode",
        canvas: canvas,
        x: 0,
        y: 0,
        width,
        height,
        destWidth: width,
        destHeight: height,
        success: res => {
          app.closeLoading();
          this.triggerEvent("OutQR", res.tempFilePath);
        },
        fail: res => {
          app.closeLoading();
        },
      });
    },
  },
  lifetimes: {
    attached: function () {
      const query = this.createSelectorQuery();
      query
        .select("#myQrcode")
        .fields({
          node: true,
          size: true,
        })
        .exec(res => {
          canvas = res[0].node;
        });
    },
  },
  observers: {
  },
});