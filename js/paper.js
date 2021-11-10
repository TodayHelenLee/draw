let event_from = {},
    event_to = {},
    draw_tool = null,
    text_box = null;
    let pen_color ='gray';
  let draw_width = 2; //筆頭寬度
  let drawing_object = null; //是否有當前繪畫物件
  let move_count = 1; //計算移動長度
  let is_drawing = false; // 是否繪畫中
  let  image_object=null;
 
  

 
  var vm = new Vue({
   el:'#app',
   mounted(){
  //初設定畫板
 
  var canvas = new fabric.Canvas("c", {
    selection:false,
  });
  
  setTimeout(()=>{
    const photo = canvas;
    const save = document.getElementById('save')
   save.href=photo.toDataURL();
   save.download = 'canvas';
  
  },100)

  window.canvas = canvas;
  window.zoom = window.zoom ? window.zoom : 1;

  canvas.freeDrawingBrush.color = pen_color; //設置自由繪圖顏色
  canvas.freeDrawingBrush.width = draw_width;

  //綁定繪圖板事件
  canvas.on("mouse:down", function (options) {
    
    var xy = transformMouse(options.e.offsetX, options.e.offsetY);
    event_from.x = xy.x;
    event_from.y = xy.y;
    
    is_drawing = true;
    
  });
  
  canvas.on("mouse:up", function (options) {
    var xy = transformMouse(options.e.offsetX, options.e.offsetY)
    event_to.x = xy.x;
    event_to.y = xy.y;
    drawing_object = null;
    move_count = 1;
    is_drawing = false;
    setTimeout(()=>{
      const photo = canvas;
      const save = document.getElementById('save')
     save.href=photo.toDataURL();
     save.download = 'canvas';
    
    },100)
  });
  canvas.on("mouse:move", function (options) {
    if ( !is_drawing) {
      //減少繪圖點
      return;
    }
    var xy = transformMouse(options.e.offsetX, options.e.offsetY)
    event_to.x = xy.x;
    event_to.y = xy.y;
    drawing();
  });

  canvas.on("selection:created", function (e) {
   
      canvas.remove(e.target);
  });

  //座標變出物件
  function transformMouse(mouseX, mouseY) {
    return { x: mouseX / window.zoom, y: mouseY / window.zoom };
  }
  
      function drawing() {
        if (drawing_object) {
          //刪除先前圖案物件的紀錄 否則會有一堆陰影
          canvas.remove(drawing_object);
        }//會有幾秒的空白
        
        var canvasObject = null;//空物件方便接值
        
        switch (draw_tool) {
          case "arrow": //箭頭
            canvasObject = new fabric.Path(drawArrow(event_from.x, event_from.y, event_to.x, event_to.y, 30, 30), {
              stroke: pen_color,
              fill: "rgba(255,255,255,0)",
              strokeWidth: draw_width
            });
            break;
          case "line": //直線
            canvasObject = new fabric.Line([event_from.x, event_from.y, event_to.x, event_to.y], {
              stroke: pen_color,
              strokeWidth: draw_width
            });
            break;
          case "dottedline": //虛線
            canvasObject = new fabric.Line([event_from.x, event_from.y, event_to.x, event_to.y], {
              strokeDashArray: [3, 1],
              stroke: pen_color,
              strokeWidth: draw_width
            });
            break;
          case "circle": //圓形
            var left = event_from.x,
              top = event_from.y;
            var radius = Math.sqrt((event_to.x - left) * (event_to.x - left) + (event_to.y - top) * (event_to.y - top)) / 2;
            canvasObject = new fabric.Circle({
              left: left,
              top: top,
              stroke: pen_color,
              fill: "rgba(255, 255, 255, 0)",
              radius: radius,
              strokeWidth: draw_width
            });
            break;
          case "ellipse": //橢圓形
            var left = event_from.x,
              top = event_from.y;
            var radius = Math.sqrt((event_to.x - left) * (event_to.x - left) + (event_to.y - top) * (event_to.y - top)) / 2;
            canvasObject = new fabric.Ellipse({
              left: left,
              top: top,
              stroke:pen_color,
              fill: "rgba(255, 255, 255, 0)",
              originX: "center",
              originY: "center",
              rx: Math.abs(left - event_to.x),
              ry: Math.abs(top - event_to.y),
              strokeWidth: draw_width
            });
            break;
          case "square": //正方形
            break;
          case "rectangle": //長方形
            var path =
              "M " +
              event_from.x +
              " " +
              event_from.y +
              " L " +
              event_to.x +
              " " +
              event_from.y +
              " L " +
              event_to.x +
              " " +
              event_to.y +
              " L " +
              event_from.x +
              " " +
              event_to.y +
              " L " +
              event_from.x +
              " " +
              event_from.y +
              " z";
            canvasObject = new fabric.Path(path, {
              left: left,
              top: top,
              stroke: pen_color,
              strokeWidth: draw_width,
              fill: "rgba(255, 255, 255, 0)"
            });
            //也可以使用fabric.Rect
            break;
          case "rightangle": //直角三角形
            var path = "M " + event_from.x + " " + event_from.y + " L " + event_from.x + " " + event_to.y + " L " + event_to.x + " " + event_to.y + " z";
            canvasObject = new fabric.Path(path, {
              left: left,
              top: top,
              stroke: pen_color,
              strokeWidth: draw_width,
              fill: "rgba(255, 255, 255, 0)"
            });
            break;
          case "equilateral": //等邊三角形
            var height = event_to.y - event_from.y;
            canvasObject = new fabric.Triangle({
              top: event_from.y,
              left: event_from.x,
              width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
              height: height,
              stroke: pen_color,
              strokeWidth: draw_width,
              fill: "rgba(255,255,255,0)"
            });
            break;
          
          case "text":
            text_box = new fabric.text_box("", {
              left: event_from.x - 60,
              top: event_from.y - 20,
              width: 150,
              fontSize: 18,
              borderColor: "#2c2c2c",
              fill: pen_color,
              hasControls: false
            });
            canvas.add(text_box);
            text_box.enterEditing();
            text_box.hiddenTextarea.focus();
            break;
          case "remove":
            break;
          default:
            break;
        }
        if (canvasObject) {
          
          canvas.add(canvasObject); //圖案物件加到畫布
          drawing_object = canvasObject;
        }
        
      }
  
     
   },
   updated(){
    this.colors =  `rgb(${this.R},${this.G},${this.B})`  ;
    pen_color =this.colors;
   }
   ,
   data:{
     demo_src:'',
    R:'100',
    G:'100',
    B:'100',
    colors:'rgb(100,100,100)',
     list:[{img_tool:'data:image/png;base64,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',tool:'pen'},
     {img_tool:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAADFBMVEX///8AAAAJAAO2traceGFOAAAAXElEQVR4nO3UgQkAIBADsar77+wUj1CTDQ5KEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEGrXXa7Dwpfj2hcTrvXRwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHS7PGUH6u1f6hoAAAAASUVORK5CYII=',tool:'line'},
     {img_tool:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAclBMVEX///8AAADy8vLr6+vW1ta2trbHx8fj4+PR0dG6urrd3d1bW1shISGkpKS+vr75+fmWlpaAgIA+Pj43NzcYGBhJSUkvLy+wsLDExMRxcXFmZmZRUVGLi4vMzMyoqKgmJiZ6enqPj48SEhI7OzttbW2cnJwYfw8cAAABo0lEQVR4nO3Sy3LqMAwAUAcKSYDyKo/waCkU/v8Xr+wwrO6mM12es2A0yLFlWSkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAn1uEwWAQ0WBYRDSs63oymcSfw7eijmzTNJ8h0p/deDzuukg3824+n7eRrkdtNo6F7Sjb/7qSJg5qYqthM87ipEXZc79fpDT6es8i3V2Xy+X1PEppcl4VsfCQHY+RPk+z0zw+2Z5Op+36OxZu19lHHLL+yC5NSqvLLsyWKbW3y2U226zjFrNbVkUTdlXRpnTto0NK4z6q4pLPaJLSto8eKb330Talt9fCXypfxYW++u83UdJzq+EzWVVx89WrpO5/JU2r22azqb5ySbPsGCXN+vvGIT+lB7vowXlX+hK1d+ttON2j/dNTaWE87+oYDvdY2N5zo79jx/oc4gmi6e+P/CSPWNjtQ1vmoC2PF58s+tFpft2DfR6ft9dIdbHVvOhiDmLu8vBFN+rPoh/NfFJcPE2KepFnuExzRHm8B4NFRKn8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAH/gHM8UW0DxUGD4AAAAASUVORK5CYII=',tool:'dottedline'},{img_tool:'https://img2.momomall.com.tw/goodsimg/101/670/0008/877/1016700008877_L1.jpg',tool:'circle'},{img_tool:'data:image/png;base64,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',tool:'ellipse'},{img_tool:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAVFBMVEX///8AAAD8/PylpaW7u7vd3d14eHiysrIUFBSBgYHr6+vn5+e4uLju7u6EhIT29vYICAirq6vCwsKZmZkaGhp0dHTOzs7Y2Nji4uKSkpIWFhagoKBCMH7EAAABsElEQVR4nO3UWVLbUBBAUVuYKZZtmThkYP/7jKj85RbfT1DnbOB1XbV6twMAAAAAAL6eaXeZdtNl3PuXdYSNeR9oHWuckR/kA9Px5TDP1/lxiHl+fDmNTlDf92Mt19EF6mG/f1puy9MIy3Lb7+9GF6i1yfVwmA8jzIe39yabO7Jrk4FH7n6rezLwym22ybdxr2tSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJaVKalCalSWlSmpQmpUlpUpqUJqVJTJr8b/q3J9Oo9z/yY20yXcaMNe1eN9lk3ZPTqKmm7d6T19PP++MIp1/zVpuMtGzx3/l9Gxvlz3V0gTq+Pa/OzyOcH87nu9O0uT0BAAAAAAAAgE/tL510JXxDGjNCAAAAAElFTkSuQmCC',tool:'rectangle'},{img_tool:'data:image/png;base64,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',tool:'rightangle'},{img_tool:'data:image/png;base64,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',tool:'equilateral'},{img_tool:'data:image/png;base64,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',tool:'remove'}]
   },
   watch:{
     colors(){
      canvas.freeDrawingBrush.color = this.colors;
     }
   }
   ,
   methods:{
     search_photo(e){
      
      fabric.Image.fromURL(`${window.URL.createObjectURL(e.currentTarget.files[0])}`, (img) => {
        img.set({
           top: 200,
           left:300,
           selectable:true,
           selection:false,
           skipTargetFind :true,
        }).scale(3);
        


        canvas.add(img); 
        
        canvas.isDrawingMode = false;
        draw_tool = null;
        canvas.skipTargetFind = true;
      });
      setTimeout(()=>{
        const photo = canvas;
          const save = document.getElementById('save')
         save.href=photo.toDataURL();
         save.download = 'canvas';
      },100)
     },
     add_class(){
      $('#c').addClass('cursor');
     },
     clear_focus(){
       canvas.isDrawingMode = false;
       draw_tool = null;
       canvas.skipTargetFind = true;
       $('li').removeClass('active')
     },
     get_tool_type(type,event){
       console.log(event.currentTarget)
       $(event.currentTarget).addClass('active').siblings().removeClass( "active" )
      draw_tool = type;
      canvas.isDrawingMode = false;
      if (text_box) {
        //退出編輯狀態
        console.log(text_box)
        text_box.exitEditing();
        text_box = null;
      }
      if (draw_tool == "pen") {
        canvas.isDrawingMode = true;//開啟自由畫筆功能
        canvas.freeDrawingBrush.color = this.colors;
        console.log('pen')
      } else if (draw_tool == "remove") {
        canvas.skipTargetFind = false;//不忽略選中物件 點下去觸發刪除行為
      } else {
        canvas.skipTargetFind = true; //畫板項目不被框選
        canvas.selection = false; //畫板不顯示選中
      }
      
     }
   }
 });
    