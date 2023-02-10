import "ol/ol.css";
import "layui-src/dist/css/layui.css";
import "layui-src/dist/css/modules/layer/default/layer.css";
import $ from "jquery";
require("layui-src");
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import {get as getProjection}from "ol/proj";
import {Map,View} from "ol";
import {FullScreen,OverviewMap ,ScaleLine, defaults as defaultControls}from "ol/control";
import {defaults as defaultInteractions}from "ol/interaction";


/*图层*/
require("layui-src");
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {Image as ImageLayer} from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import tiandituXYZ from "./layerC/tiandituXyzLayerConfig";
import tiandituWMTS from "./layerC/tiandituWMTSLayerConfig";
import vectorUtil from "./layerC/vectorLayerUtil";
import {useGeographic} from 'ol/proj';
/* */

/* 引入绘制和测量 */
import measureUtil from "./featureC/measureUtil";
import drawUtil from "./featureC/drawUtil";
/* */

/* 属性查询 */
import {GeoJSON, WFS} from 'ol/format';
import {
  and as andFilter,
  equalTo as equalToFilter,
  like as likeFilter,
} from 'ol/format/filter';
import Overlay from 'ol/Overlay';
import EqualTo from 'ol/format/filter/EqualTo';
/* */

import Draw, {createRegularPolygon} from 'ol/interaction/Draw';
import * as source from 'ol/source';
import {Icon, Style, Stroke, Fill} from 'ol/style';
import {Circle as CircleStyle} from 'ol/style';
import {intersects} from 'ol/format/filter';



//WGS84坐标系
const projection = getProjection("EPSG:4326");
//天地图key--此处需自行到天地图获取
const tiandituKey;
//构造map对象
const map=new Map({
    //指定map容器id
    target:"map",
    //添加全屏控件
    controls: defaultControls().extend([new FullScreen()]),
    //修改默认交互
    interactions: defaultInteractions({
    //禁用双击缩放
    doubleClickZoom:false,
    //禁用滚轮缩放
    //mouseWheelZoom:false,
}),
layers:[],
//设置显示范围
view:new View({
    //显示范围中心点坐标
    center:[114.30,30.55],
    zoom:13,
    projection:projection,
}),
});

/* 添加比例尺*/
function scaleControl(){
  let control = new ScaleLine()
  return control
}
map.addControl(scaleControl())

// 鹰眼
const overviewMapControl = new OverviewMap({
    layers: [
        new TileLayer({
            source: new XYZ({
              url:
                "http://t{0-6}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec" +
                "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
                "&tk=" +
                tiandituKey,
              projection: projection,
            }),
        })
    ],
    
});

/*图层*/
let layers = {};

layers["terXyz"] = tiandituXYZ.TER;
layers["vecXyz"] = tiandituXYZ.VEC;
layers["imgXyz"] = tiandituXYZ.IMG;
layers["terWmts"] = tiandituWMTS.TER;
layers["vecWmts"] = tiandituWMTS.VEC;
layers["imgWmts"] = tiandituWMTS.IMG;

map.addLayer(layers["terXyz"]);
layers["vecXyz"].setVisible(true);
map.addLayer(layers["vecXyz"]);
map.addLayer(layers["imgXyz"]);
map.addLayer(layers["terWmts"])
map.addLayer(layers["vecWmts"]);
map.addLayer(layers["imgWmts"]);

//WMS 图层
let wmsLayer = new ImageLayer({
  source: new ImageWMS({
    ratio: 1,
    //WMS 图层地址
    
    // http://124.221.116.93:8080/geoserver/map/wms?service=WMS&version=1.1.0&request=GetMap&layers=map%3A--polygon&bbox=113.702281%2C29.969132%2C115.082378%2C31.36126&width=761&height=768&srs=EPSG%3A4326&styles=&format=application/openlayers
    url: 'http://124.221.116.93:8080/geoserver/cite/wms',
    params: {
      'FORMAT': 'image/png',
      'VERSION': '1.1.0',  
      "STYLES": '',
      "LAYERS": 'cite:--polygon',
      "exceptions": 'application/vnd.ogc.se_inimage',
    }
  }),
  visible: false
});
map.addLayer(wmsLayer);
layers["wmsLayer"] = wmsLayer;

// 定义矢量数据源
let vectorSource = new VectorSource({
  features:[]
});

// 定义矢量图层
let vectorLayer = new VectorLayer({
  source: vectorSource,
  visible:false
});
layers["featureLayer"] = vectorLayer;

// 创建并添加点、线、面
/*vectorSource.addFeature(vectorUtil.createFeature("point", [118.093586,24.630331], "测试点"));
vectorSource.addFeature(vectorUtil.createFeature("line", [[118.09815,24.632861],[118.1182,24.637623],[118.120967,24.626685]], "测试线"));
vectorSource.addFeature(vectorUtil.createFeature("polygon", [[[118.079177,24.6302],[118.081764,24.632368],[118.083453,24.629182],[118.079177,24.6302]]], "测试面"));*/
// map.addLayer(vectorLayer);

// 加载JSON数据
let jsonLayer = vectorUtil.loadJSON("./wuhan.json");
layers["jsonLayer"] = jsonLayer;
map.addLayer(jsonLayer);

/*鼠标单击事件 */

// map.on('singleclick',function(evt){
//   var pixel=map.getEventPixel(evt.originalEvent);
//   map.forEachFeatureAtPixel(pixel,function(feature,layer){
//       if(feature!=undefined){
//           console.log(feature);
//       }
//   })
// })



//加载WFS服务 
useGeographic();
let wfsLayer = vectorUtil.loadWFSService('http://124.221.116.93:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3A--polygon&maxFeatures=50&outputFormat=application%2Fjson');
layers["wfsLayer"] = wfsLayer;
map.addLayer(wfsLayer);
layers["wfsLayer"].setVisible(false);


layui.use(["tree"], function () {
  var tree = layui.tree;
  var inst1 = tree.render({
    elem: "#tocTree",
    showCheckbox: true,
    data: [
      {
        id: 1,
        title: "矢量图层",
        spread: true,
        children: [
          {
            id: 11,
            title: "点、线、面",
            layer: "featureLayer"
          },
          {
            id: 12,
            title: "JSON文件",
            layer: "jsonLayer"
          },
          {
            id: 13,
            title: "WFS服务",
            layer: "wfsLayer"
          }
        ],
      },
      {
        id: 2,
        title: "WMS图层",
        spread: true,
        layer: "wmsLayer"
      },
      {
        id: 3,
        title: "WMTS图层",
        spread: true,
        children: [
          {
            id: 31,
            title: "天地图影像",
            layer: "imgWmts"
          },
          {
            id: 32,
            title: "天地图矢量",
            layer: "vecWmts"
          },
          {
            id: 33,
            title: "天地图地形",
            layer: "terWmts"
          },
        ],
      },
      {
        id: 4,
        title: "XYZ图层",
        spread: true,
        children: [
          {
            id: 41,
            title: "天地图影像",
            layer: "imgXyz"
          },
          {
            id: 42,
            title: "天地图矢量",
            checked: true,
            layer: "vecXyz"
          },
          {
            id: 43,
            title: "天地图地形",
            layer: "terXyz"
          },
        ],
      },
    ],
    oncheck: function (obj) {
      if (obj.data.children){
        for (let i=0; i<obj.data.children.length; i++){
          let data = obj.data.children[i];
          layers[data.layer].setVisible(obj.checked);
        }
      }else{
        layers[obj.data.layer].setVisible(obj.checked);
      }
    },
  });
});
/*图层管理功能*/


// 测量工具
measureUtil.init({map:map});
map.addLayer(measureUtil.drawLayer);
drawUtil.init({map:map});
map.addLayer(drawUtil.drawLayer);

$(".measure-tool").on("click", function(){
  drawUtil.stop();
  switch (this.id) {
    case "measureCoordinate":
      measureUtil.start("point");
      break;
    case "measureDistance":
      measureUtil.start("length");
      break;
    case "measureArea":
      measureUtil.start("area");
      break;
    case "measureClear":
      measureUtil.clear();
      $(this).removeClass("layui-this");
      break;
    default:
      break;
  }
});

// 标注工具
$(".marker-tool").on("click", function(){
  measureUtil.stop();
  switch (this.id) {
    case "markerPoint":
      drawUtil.start("Point");
      break;
    case "markerLine":
      drawUtil.start("LineString");
      break;
    case "markerSquare":
      drawUtil.start("Square");
      break;
    case "markerCircle":
      drawUtil.start("Circle");
      break;
    case "markerPolygon":
      drawUtil.start("Polygon");
      break;
    case "markerClear":
      drawUtil.clear();
      break;
    default:
      break;
  }
});

$("#drawQuery").on("click", function(){
  let type = $("input[name='queryType']:checked").val();
  let distance = $("input[name='buffer']").val();
  spatialQueryUtil.start(type, distance);
  return false;
});

// 添加Control
$("#addControl").on("click", function(){
    map.addControl(overviewMapControl);
    var ovm = document.querySelector('.ol-overviewmap');
    var ovmB = ovm.children[1];
    ovmB.click();
});

/*Layer管理页面*/
//打开
$("#layer").on("click",function(){
    var layerPanel = document.querySelector('.toolPanel')
    layerPanel.style.display = 'block';
});
//关闭
$(".layerPanelTitle").on("click",function(){
    var layerPanel = document.querySelector('.toolPanel')
    layerPanel.style.display = 'none';
})
/*Layer管理页面*/

/*属性查询 */
// const featureRequest = new WFS().writeGetFeature({
//   srsName: 'EPSG:4326',
//   featureNS: 'http://www.opengeospatial.net/cite',
//   featurePrefix: 'cite',
//   featureTypes: ['school'],
//   outputFormat: 'application/json',
//   filter: andFilter(
//     likeFilter('Id', '*'),
//     equalToFilter('name', '武汉大学')
//   ),
// });


//获取dom对象
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");
//创建Overlayer叠加层对象
var overlay = new Overlay({
  element: container,
  autoPanAnimation: {
      duration: 250
  }
});
//弹窗的关闭
closer.onclick = function() {
  overlay.setPosition(undefined);
  return false;
};

// let vectorLayer = new VectorLayer({
//   source: vectorSource,
//   visible:false
// });
// then post the request and add the received features to a layer
$("#search").on('click',function pointQuery(){
  var searchname = document.getElementById('searchbox').value
  var filter = new EqualTo('name',searchname);
  const featureRequest = new WFS().writeGetFeature({
    srsName: 'EPSG:4326',
    featureNS: 'http://www.opengeospatial.net/cite',
    featurePrefix: 'cite',
    featureTypes: ['school'],
    outputFormat: 'application/json',
    filter: filter,
  });
fetch('http://124.221.116.93:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Aschool&maxFeatures=50&outputFormat=application%2Fjson', {
method: 'POST',
body: new XMLSerializer().serializeToString(featureRequest),
})
.then(function (response) {
  return response.json();
})
.then(function (json) {
  const features = new GeoJSON().readFeatures(json);
  if(features.length == 0){
    alert('没有数据')}else{
      // vectorSource.clear()
  // vectorSource.addFeatures(features);
  const cp = features[0].values_.geometry.flatCoordinates
  let vectorLayer = new VectorLayer({
    source: vectorSource,
    visible:false
  });
  vectorSource.addFeature(vectorUtil.createFeature("point", cp, searchname));
  if(vectorSource.getFeatures().length>1){
    vectorSource.removeFeature(vectorSource.getFeatures().shift())
  }
  console.log(vectorSource.getFeatures())
  map.addLayer(vectorLayer);
  layers["featureLayer"] = vectorLayer;
  layers["featureLayer"].values_.visible=true
  map.getView().animate({ // 只设置需要的属性即可
    center: cp, // 中心点
    zoom: 16, // 缩放级别
    rotation: undefined, // 缩放完成view视图旋转弧度
    duration: 1000 // 缩放持续时间，默认不需要设置
  })
  window.alert("欢迎来到："+ searchname +"。坐标为："+ cp)
    }
//点击查询
//设置单机处理弹窗
map.on("click", function(e) {
  var pixel = map.getEventPixel(e.originalEvent);
  //forEachFeatureAtPixel的原理，是遍历操作
  var feature = map.forEachFeatureAtPixel(pixel,
      function (feature,) {
          return feature;
      });
      if(feature != undefined){
        console.log(feature);
      var coordinate = e.coordinate;
      content.innerHTML = "<p>地区信息：</p><code>"+'地区名:'+feature.values_.name + "</code>";
      overlay.setPosition(coordinate);
      }

});
// map.on('singleclick',function(evt){
//   var pixel = map.getEventPixel(evt.originalEvent);
//   var cname = vectorSource.getFeatures().shift().values_.name
//   var ccp = vectorSource.getFeatures().shift().values_.geometry.flatCoordinates
//   console.log(cname,ccp)
//   console.log(this)
//   console.log(json.features[0].properties)
//   window.alert("欢迎来到："+ cname +"。坐标为："+ ccp)
// });
});
})

/* 空间查询 */
var draw = new Draw({
  source: source,
  type: 'Polygon',
  /*用于交互绘制图形时所设置的样式*/
  style: new Style({
      fill: new Fill({
          color: 'yellow'
      }),
      stroke: new Stroke({
          color: '#ffcc33',
          width: 2
      }),
      image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
              color: 'red'
          }),
          fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)'
          })
      })
  })
});

$("#spatialQ").on('click',function(){
map.addInteraction(draw);
draw.on("drawend", function (evt) {
    vectorSource.clear()
    var feature = evt.feature;
    var inputGeometry = feature.getGeometry();
    specialQuery(inputGeometry);
    map.removeInteraction(draw);
});


function specialQuery(geometry) {
  vectorSource.clear()
    // 拼接查询参数
    var featureRequest = new WFS().writeGetFeature({
    srsName: 'EPSG:4326',
    featureNS: 'http://www.opengeospatial.net/cite',
    featurePrefix: 'cite',
    featureTypes: ['school'],
    outputFormat: 'application/json',
        geometryName: "the_geom",
        filter: new intersects('the_geom', geometry)
    });

    fetch('http://124.221.116.93:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Aschool&maxFeatures=50&outputFormat=application%2Fjson', {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
    }).then(function (response) {
        // console.log(response.json());
        return response.json();
    }).then(function (json) {
        // 从geojson数据生成feature
        vectorSource.clear()
        var features = new GeoJSON().readFeatures(json);
        if(features.length==0){
          window.alert("该范围内没有数据所存有的高校")
        }else{
          window.alert("该范围内有"+features.length+"所高校")
          vectorSource.addFeatures(features);
          layers["featureLayer"] = vectorLayer;
          map.addLayer(vectorLayer);
          layers["featureLayer"].values_.visible=true
        }
    });
  }
})

$("#cc").on('click',function(){
  vectorSource.clear()
})
