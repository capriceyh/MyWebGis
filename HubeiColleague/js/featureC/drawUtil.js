import Draw, {createRegularPolygon} from 'ol/interaction/Draw';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {Icon, Style, Stroke, Fill} from 'ol/style';


let drawUtil = {
  source: null,
  drawLayer: null,
  map: null,
  drawTool: null,
  fillStyle: new Fill({
    color: 'rgba(255, 255, 255, 0.5)',
  }),
  strokeStyle: new Stroke({
    color: '#0036f3',
    width: 2,
  }),
  pointStyle:new Icon({
    anchor: [0.5, 48],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'images/point.png',
  }),
  init: function(params){
    this.fillStyle = params.fillStyle? params.fillStyle : this.fillStyle;
    this.strokeStyle = params.strokeStyle? params.strokeStyle : this.strokeStyle;
    this.pointStyle = params.pointStyle? params.pointStyle : this.pointStyle;

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
  start: function(type){
    this.stop();
    if (type == "Square"){
      type = "Circle";
      this.drawTool = new Draw({
        source: this.source,
        type: type,
        geometryFunction: createRegularPolygon(4)
      });
    }else{
      this.drawTool = new Draw({
        source: this.source,
        type: type
      });
    }
    this.map.addInteraction(this.drawTool);
  },
  stop: function(){
    this.map.removeInteraction(this.drawTool);
  },
  clear: function(){
    this.stop();
    this.source.clear();
  }
}

export default drawUtil;