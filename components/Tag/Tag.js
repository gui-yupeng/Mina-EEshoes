// components/Tag/Tag.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    abc:{
      type:String,
      value:"123"
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    tabs:[
      {
        id:0,
        name:"首页",
        isActive:true
      },
      {
        id:0,
        name:"原创",
        isActive:false
      },
      {
        id:0,
        name:"分类",
        isActive:false
      },
      {
        id:0,
        name:"关于",
        isActive:false
      }
    ]
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleTap:function (e){
      const {index}=e.currentTarget.dataset;
      let list=this.data.tabs;
      list.forEach((x,i)=>{
        if(i===index){
          x.isActive=true;
        }else{
          x.isActive=false;
        }
      });
      this.setData({
        tabs:list
      });
    }
  }
})
