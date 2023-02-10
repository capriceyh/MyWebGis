import Draw from 'ol/interaction/Draw'
import {TileDebug, Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {Icon, Style, Stroke, Fill} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/observable';
import {transform} from 'ol/proj';
import {LineString, Polygon, Point} from 'ol/geom';
import $ from "jquery";

const format = new GeoJSON({featureProjection: 'EPSG:4326'});
const format3857 = new GeoJSON({featureProjection: 'EPSG:3857'});
// 
const wpsUrl = "http://localhost:8080/geoserver/ows?service=wps&version=1.0.0";

let bufferUtil = {
  source:null,
  drawLayer: null,
  bufferSource:null,
  bufferLayer:null,
  map: null,
  distance: 0,
  drawTool: null,
  drawEndListener: null,
  fillStyle: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  strokeStyle: new Stroke({
    color: '#0099FF',
    width: 2,
  }),
  pointStyle:new Icon({
    anchor: [0.5, 32],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: '.images/query_point.png',
  }),
  init: function(params){
    this.fillStyle = params.fillStyle? params.fillStyle : this.fillStyle;
    this.strokeStyle = params.strokeStyle? params.strokeStyle : this.strokeStyle;
    this.pointStyle = params.pointStyle? params.pointStyle : this.pointStyle;
    this.distance = params.distance? params.distance : this.distance;

    this.source = new VectorSource();
    this.drawLayer = new VectorLayer({
      source: this.source,
      style: new Style({
        fill: this.fillStyle,
        stroke: this.strokeStyle,
        image: this.pointStyle,
      }),
    });
    this.map = params.map;
  },
  start: function(type, distance){
    if (distance){
      this.distance = distance;
    }
    this.clear();
    // 1、定义绘制工具
    this.drawTool = new Draw({
      source: this.source,
      type: type
    });
    
    // 2、添加绘制工具
    this.map.addInteraction(this.drawTool);

    let that = this;
    // 3、监听绘制结果
    this.drawEndListener = this.drawTool.on("drawend", function(evt){
      // 4、获取绘制的结果对象evt.feature,点、线、面
      let featureJson = format.writeFeatureObject(evt.feature);
      // 5、将绘制的对象转换成字符串
      let jsonStr = JSON.stringify(featureJson.geometry);
      // 6、调用buildBufferWpsBody方法拼接wps请求体字符串
      let xmlData = that.buildBufferWpsBody(jsonStr)

      // 7、指向wps请求
      $.ajax({
        url: wpsUrl,
        type: 'post',
        contentType: 'application/json',
        data: xmlData,
        dataType: 'json',
        success: function(result) {
          // 8、得到缓冲区结果result（geojson对象),将结果添加到地图上，使用vectorSource
          that.bufferSource = new VectorSource({
            projection: 'EPSG:3857',
            features: new GeoJSON().readFeatures(result)
          });
          that.bufferLayer = new VectorLayer({
            source: that.bufferSource,
            style: new Style({
              stroke: new Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3,
              }),
              fill: new Fill({
                color: 'rgba(0, 0, 255, 0.1)',
              }),
            }),
              visible: true
          });
          that.map.addLayer(that.bufferLayer);
        },
        error:function(error){
          console.log(error)
        }
      });
      
      that.map.removeInteraction(that.drawTool);
      unByKey(that.drawEndListener);
    });
  },
  clear: function(){
    this.map.removeInteraction(this.drawTool);
    this.source.clear();
    if (this.bufferLayer){
      this.map.removeLayer(this.bufferLayer);
      this.bufferLayer = null;
    }
    if (this.bufferSource){
      this.bufferSource.clear();
      this.bufferSource = null;
    }

    unByKey(this.drawEndListener);
  },
  // wps请求体拼接函数
  buildBufferWpsBody(geom){
    let bufferWpsBody = '<?xml version="1.0" encoding="UTF-8"?><wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">';
    bufferWpsBody += '<ows:Identifier>JTS:buffer</ows:Identifier>';
    bufferWpsBody += '<wps:DataInputs>';
    bufferWpsBody += '<wps:Input>';
    bufferWpsBody += '<ows:Identifier>geom</ows:Identifier>';
    bufferWpsBody += '<wps:Data>';
    bufferWpsBody += '<wps:ComplexData mimeType="application/json"><![CDATA[' + geom + ']]></wps:ComplexData>';
    bufferWpsBody += '</wps:Data>';
    bufferWpsBody += '</wps:Input>';
    bufferWpsBody += '<wps:Input>';
    bufferWpsBody += '<ows:Identifier>distance</ows:Identifier>';
    bufferWpsBody += '<wps:Data>';
    bufferWpsBody += '<wps:LiteralData>'+ this.distance +'</wps:LiteralData>';
    bufferWpsBody += '</wps:Data>';
    bufferWpsBody += '</wps:Input>';
    bufferWpsBody += '<wps:Input>';
    bufferWpsBody += '<ows:Identifier>capStyle</ows:Identifier>';
    bufferWpsBody += '<wps:Data>';
    bufferWpsBody += '<wps:LiteralData>Round</wps:LiteralData>';
    bufferWpsBody += '</wps:Data>';
    bufferWpsBody += '</wps:Input>';
    bufferWpsBody += '</wps:DataInputs>';
    bufferWpsBody += '<wps:ResponseForm>';
    bufferWpsBody += '<wps:RawDataOutput mimeType="application/json">';
    bufferWpsBody += '<ows:Identifier>result</ows:Identifier>';
    bufferWpsBody += '</wps:RawDataOutput>';
    bufferWpsBody += '</wps:ResponseForm>';
    bufferWpsBody += '</wps:Execute>';
    return bufferWpsBody;
  }
}

export default bufferUtil;