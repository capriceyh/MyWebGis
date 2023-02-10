import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {getArea, getLength} from 'ol/sphere';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import {LineString, Polygon, Point} from 'ol/geom';
import {transform} from 'ol/proj';
import {unByKey} from 'ol/Observable';

let measureUtil = {
  source: null,
  drawLayer: null,
  drawtool:null,
  fillStyle: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  strokeStyle: new Stroke({
    color: '#ffcc33',
    width: 2,
  }),
  pointStyle:new CircleStyle({
    radius: 7,
    fill: new Fill({
      color: '#ffcc33',
    }),
  }),
  drawFillStyle: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  drawStrokeStyle: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  drawPointStyle: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
  map: null,
  sketch: null,
  helpTooltipElement: null,
  helpTooltip: null,
  measureTooltipElement:null,
  measureTooltip: null,
  continuePolygonMsg: "点击继续绘制",
  continueLineMsg: "点击继续绘制",
  pointermoveListener: null,
  mouseOutListener: null,
  Overlays: null,
  init: function(params){
    this.fillStyle = params.fillStyle? params.fillStyle : this.fillStyle;
    this.strokeStyle = params.strokeStyle? params.strokeStyle : this.strokeStyle;
    this.pointStyle = params.pointStyle? params.pointStyle : this.pointStyle;
    this.drawFillStyle = params.drawFillStyle? params.drawFillStyle : this.drawFillStyle;
    this.drawStrokeStyle = params.drawStrokeStyle? params.drawStrokeStyle : this.drawStrokeStyle;
    this.drawPointStyle = params.drawPointStyle? params.drawPointStyle : this.drawPointStyle;

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
    this.Overlays = [];
  },
  formatLength: function (line) {
    var length1 = getLength(line);
    var length = length1 * 100000;
    var output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  },
  formatArea: function (polygon) {
    var area1 = getArea(polygon);
    var area = area1 * 1000000000000;
    var output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
  },
  createHelpTooltip: function(){
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'ol-tooltip hidden';

    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left',
    });
    this.map.addOverlay(this.helpTooltip);
  },
  createMeasureTooltip: function(){
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    });
    this.map.addOverlay(this.measureTooltip);
    this.Overlays.push(this.measureTooltip);
  },
  stop: function(){
    this.map.removeInteraction(this.drawtool);
    unByKey(this.pointermoveListener);
    unByKey(this.mouseOutListener);
  },
  clear: function(){
    this.stop();
    this.source.clear();
    let that = this;
    this.Overlays.forEach(overlay => {
      that.map.removeOverlay(overlay);
    });
  },
  start: function(measureType){
    let type = measureType == 'area' ? 'Polygon' : measureType == 'point' ? 'Point' : 'LineString';
    let that = this;
    this.stop();
    this.drawtool = new Draw({
      source: this.source,
      type: type,
      style: new Style({
        fill: this.drawFillStyle,
        stroke: this.drawStrokeStyle,
        image: this.drawPointStyle,
      }),
    });
    this.createMeasureTooltip();
    this.createHelpTooltip();

    this.map.addInteraction(this.drawtool);
    this.pointermoveListener = this.map.on('pointermove', function(evt){
      if (evt.dragging) {
        return;
      }
      
      var helpMsg = '点击开始绘制';
    
      if (that.sketch) {
        var geom = that.sketch.getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = that.continuePolygonMsg;
        } else if (geom instanceof LineString) {
          helpMsg = that.continueLineMsg;
        }
      }
    
      that.helpTooltipElement.innerHTML = helpMsg;
      that.helpTooltip.setPosition(evt.coordinate);
    
      that.helpTooltipElement.classList.remove('hidden');
    });
    this.mouseOutListener = this.map.getViewport().addEventListener('mouseout', function () {
      that.helpTooltipElement.classList.add('hidden');
    });

    let listener;

    this.drawtool.on("drawstart", function(evt){
      that.sketch = evt.feature;
      let tooltipCoord = evt.coordinate;

      listener = that.sketch.getGeometry().on('change', function (evt) {
        let geom = evt.target;
        let output;
        if (geom instanceof Polygon) {
          output = that.formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = that.formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        that.measureTooltipElement.innerHTML = output;
        that.measureTooltip.setPosition(tooltipCoord);
      });
    });

    this.drawtool.on('drawend', function (evt) {
      let geom = evt.feature.getGeometry();
      if (geom instanceof Point){
        let coordinate = geom.getCoordinates();
        that.measureTooltipElement.innerHTML = coordinate.toLocaleString();
        that.measureTooltip.setPosition(coordinate);
      }
      // debugger
      that.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      that.measureTooltip.setOffset([0, -7]);
      // unset sketch
      that.sketch = null;
      // unset tooltip so that a new one can be created
      that.measureTooltipElement = null;
      that.createMeasureTooltip();
      unByKey(listener);
    });
  }
}

export default measureUtil;