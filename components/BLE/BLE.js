//arr数组是一个个类，通过对类的一个属性进行判定，找出索引，没有返回-1
function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}
//16进制ASCII码转换成字符
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
      alert("存在非法字符!");
      return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16);
      resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  //16进制ASCII码转换成字符
  let str=hexArr.join('');
  //res1字符串
  let res1=hexCharCodeToStr(str);
  return res1;
}

Component({

  properties: {

  },

  data: {
    //设备数组
    devices: [],
    //是否连接
    connected: false,
    //数据{characteristicId，value}
    chs: [],
    //当前状态,Steps:16,walk:8,run:8,F:0
    current_status: []
  },

  methods: {
    //微信提供接口，打开蓝牙适配器，异步操作
    openBluetoothAdapter : function (){
      var that=this;
      wx.openBluetoothAdapter({
        success: (res) => {
          console.log('openBluetoothAdapter success', res)
          //连接状态监听
          wx.onBLEConnectionStateChange(function(res) {
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            that.setData({
               connected: res.connected
            })
            if(!res.connected){
              let deviceId="63:77:94:59:08:6C";
              wx.createBLEConnection({
                deviceId,
                success: (res) => {
                  //添加数据
                  // this.setData({
                  //   connected: true,
                  //   name,
                  //   deviceId,
                  // })
                  that.getBLEDeviceServices(deviceId)
                }
              })
            }
          })
          this.startBluetoothDevicesDiscovery()
        },
        fail: (res) => {
          if (res.errCode === 10001) {
            wx.onBluetoothAdapterStateChange(function (res) {
              console.log('onBluetoothAdapterStateChange', res)
              if (res.available) {
                this.startBluetoothDevicesDiscovery()
              }
            })
          }
        }
      })
    },
    //开始搜索蓝牙信号
    startBluetoothDevicesDiscovery:function (){
      if (this._discoveryStarted) {
        return
      }
      this._discoveryStarted = true
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
          console.log('startBluetoothDevicesDiscovery success', res)
          this.onBluetoothDeviceFound()
        },
      })
    },
    //发现蓝牙信号，监听寻找到新设备的事件，res只有一个属性，res.device（这也是一个大类）
    onBluetoothDeviceFound:function() {
      wx.onBluetoothDeviceFound((res) => {
        res.devices.forEach(device => {
          if (!device.name && !device.localName) {
            return
          }
          //拿到data.devices的引用
          const foundDevices = this.data.devices
          //查找该设备id是否在设备数组中，idx是结果
          const idx = inArray(foundDevices, 'deviceId', device.deviceId)
          const data = {}
          if (idx === -1) {
            //若不在，就加到最后
            data[`devices[${foundDevices.length}]`] = device
          } else {
            //若已存在，更新一下信息
            data[`devices[${idx}]`] = device
          }
          this.setData(data)
        })
      })
    },
    //停止按钮调用，直接停止搜索
    stopBluetoothDevicesDiscovery:function () {
      wx.stopBluetoothDevicesDiscovery()
    },
    //结束进程按钮调用，关闭蓝牙适配器
    closeBluetoothAdapter: function() {
      wx.closeBluetoothAdapter()
      this._discoveryStarted = false
    },
    //点击一个设备,连接设备
    createBLEConnection:function(e){
      const ds = e.currentTarget.dataset
      console.log(ds)
      const deviceId = ds.deviceId
      const name = ds.name
    //官方接口，连接低功耗蓝牙设备
      wx.createBLEConnection({
        deviceId,
        success: (res) => {
          //添加数据
          this.setData({
            connected: true,
            name,
            deviceId,
          })
          this.getBLEDeviceServices(deviceId)
        }
      })
      this.stopBluetoothDevicesDiscovery()
    },
    //获取蓝牙设备所有服务(service)
    getBLEDeviceServices:function(deviceId){
      wx.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          for (let i = 0; i < res.services.length; i++) {
            if (res.services[i].isPrimary) {
    //通过UUID获取services的Characteristics
              this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
              
            }
          }
        }
      })
    },
    //获取蓝牙设备某个服务中所有特征值(characteristic)，参数均为UUID
    getBLEDeviceCharacteristics:function(deviceId, serviceId){
      wx.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
        success: (res) => {
          console.log('getBLEDeviceCharacteristics success', res.characteristics)
          for (let i = 0; i < res.characteristics.length; i++) {
            let item = res.characteristics[i]
            if (item.properties.read) {
              //读取低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 read 才可以成功调用
              wx.readBLECharacteristicValue({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
                success (res) {
                  console.log('readBLECharacteristicValue:', res)
                }
              })
            }
            if (item.properties.write) {
              this.setData({
                canWrite: true
              })
              this._deviceId = deviceId
              this._serviceId = serviceId
              this._characteristicId = item.uuid
              //向低功耗蓝牙设备特征值中写入二进制数据。注意：必须设备的特征值支持 write 才可以成功调用
              this.writeBLECharacteristicValue()
            }
            //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值。
            //注意：必须设备的特征值支持 notify 或者 indicate 才可以成功调用
            if (item.properties.notify || item.properties.indicate) {
              wx.notifyBLECharacteristicValueChange({
                deviceId,
                serviceId,
                characteristicId: item.uuid,
                state: true,
              })
            }
          }
        },
        fail: (res)=> {
          console.error('getBLEDeviceCharacteristics', res)
        }
      })
      // on之前先监听，保证第一时间获取数据
      wx.onBLECharacteristicValueChange((characteristic) => {
        const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
        const data = {}
        if (idx === -1) {
          data[`chs[${this.data.chs.length}]`] = {
            uuid: characteristic.characteristicId,
            value: ab2hex(characteristic.value)
          }
        } else {
          data[`chs[${idx}]`] = {
            uuid: characteristic.characteristicId,
            value: ab2hex(characteristic.value)
          }
        }
        let current=ab2hex(characteristic.value)
        //Steps:16,walk:8,run:8,F:0
        current=current.split("#");

        this.setData(data);
        this.setData({
          current_status:current
        })
        //this.setData(current_status)
      })
    },
    //发送数据
    writeBLECharacteristicValue:function () {
      // 向蓝牙设备发送一个0x00的16进制数据
      let buffer = new ArrayBuffer(1)
      let dataView = new DataView(buffer)
      //Math.random()
      dataView.setUint8(0, Math.random() * 255 | 0)
      wx.writeBLECharacteristicValue({
        deviceId: this._deviceId,
        serviceId: this._serviceId,
        characteristicId: this._characteristicId,
        value: buffer,
      })
    },
    closeBLEConnection:function () {
      wx.closeBLEConnection({
        deviceId: this.data.deviceId
      })
      this.setData({
        connected: false,
        chs: [],
        canWrite: false,
      })
    },
    //未调用函数
    getBluetoothAdapterState:function() {
      wx.getBluetoothAdapterState({
        success: (res) => {
          console.log('getBluetoothAdapterState', res)
          if (res.discovering) {
            this.onBluetoothDeviceFound()
          } else if (res.available) {
            this.startBluetoothDevicesDiscovery()
          }
        }
      })
    }





    
  }



})
