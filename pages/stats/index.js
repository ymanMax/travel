// pages/stats/index.js
import * as echarts from '../../components/ec-canvas/echarts';

// 模拟数据：济南各景点游客数据（按年）
const scenicData = {
  2023: [
    { name: '趵突泉', value: 3500000 },
    { name: '大明湖', value: 2800000 },
    { name: '千佛山', value: 2200000 },
    { name: '济南动物园', value: 1800000 },
    { name: '红叶谷', value: 1500000 },
    { name: '九如山', value: 1200000 }
  ],
  2024: [
    { name: '趵突泉', value: 3800000 },
    { name: '大明湖', value: 3200000 },
    { name: '千佛山', value: 2500000 },
    { name: '济南动物园', value: 2000000 },
    { name: '红叶谷', value: 1700000 },
    { name: '九如山', value: 1400000 }
  ],
  2025: [
    { name: '趵突泉', value: 4200000 },
    { name: '大明湖', value: 3600000 },
    { name: '千佛山', value: 2800000 },
    { name: '济南动物园', value: 2200000 },
    { name: '红叶谷', value: 1900000 },
    { name: '九如山', value: 1600000 }
  ]
};

// 模拟数据：济南各月份游客流量（按年）
const monthlyData = {
  2023: [120000, 110000, 180000, 220000, 280000, 350000, 420000, 400000, 320000, 250000, 180000, 150000],
  2024: [140000, 130000, 200000, 250000, 320000, 380000, 450000, 430000, 350000, 280000, 200000, 170000],
  2025: [160000, 150000, 230000, 280000, 360000, 420000, 500000, 480000, 400000, 320000, 230000, 200000]
};

let pieChart = null;
let lineChart = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    years: [2023, 2024, 2025],
    selectedYear: 2025,
    ecPie: {
      onInit: function (canvas, width, height, dpr) {
        pieChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(pieChart);
        return pieChart;
      }
    },
    ecLine: {
      onInit: function (canvas, width, height, dpr) {
        lineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(lineChart);
        return lineChart;
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化图表
    this.initCharts();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(() => {
      // 延迟加载图表数据，确保图表已经初始化
      this.updateCharts();
    }, 200);
  },

  /**
   * 初始化图表
   */
  initCharts: function () {
    // 饼图配置
    const pieOption = {
      title: {
        text: '',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: []
      },
      series: [
        {
          name: '游客数量',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: []
        }
      ]
    };

    // 折线图配置
    const lineOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['游客流量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '游客流量',
          type: 'line',
          stack: 'Total',
          data: [],
          smooth: true,
          itemStyle: {
            color: '#52c41a'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0, color: 'rgba(82, 196, 26, 0.5)'
            }, {
              offset: 1, color: 'rgba(82, 196, 26, 0.1)'
            }])
          }
        }
      ]
    };

    if (pieChart) {
      pieChart.setOption(pieOption);
    }

    if (lineChart) {
      lineChart.setOption(lineOption);
    }
  },

  /**
   * 更新图表数据
   */
  updateCharts: function () {
    const year = this.data.selectedYear;
    const pieData = scenicData[year];
    const lineData = monthlyData[year];

    // 更新饼图数据
    if (pieChart) {
      pieChart.setOption({
        legend: {
          data: pieData.map(item => item.name)
        },
        series: [
          {
            data: pieData
          }
        ]
      });
    }

    // 更新折线图数据
    if (lineChart) {
      lineChart.setOption({
        series: [
          {
            data: lineData
          }
        ]
      });
    }
  },

  /**
   * 年份选择变化事件
   */
  onYearChange: function (e) {
    const yearIndex = e.detail.value;
    this.setData({
      selectedYear: this.data.years[yearIndex]
    });
    this.updateCharts();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})