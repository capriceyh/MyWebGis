import "ol/ol.css";
import Feature from 'ol/Feature';
import { Point, LineString, Polygon } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {Icon, Style, Stroke, Fill, Circle as CircleStyle} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';

// 点样式
const iconStyle = new Style({
    image: new Icon({
        anchor: [0.5, 24],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'point.png',
    }),
});

// 线样式
const lineStyle = new Style({
    stroke: new Stroke({
        color: 'red',
        width: 3
    })
});

// 面样式
const polygonStyle = new Style({
    stroke: new Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
});

/**
 * 创建要素
 * @param {string} type 类型
 * @param {array} points 点坐标
 * @param {string} name 名称
 */
function createFeature(type, points, name){
    let feature = null;
    switch (type) {
        case 'point':
            // 创建点要素
            feature = new Feature({
                geometry: new Point(points),
                name: name
            });
            feature.setStyle(iconStyle);
            break;
        case 'line':
            // 创建线要素
            feature = new Feature({
                geometry: new LineString(points),
                name: name
            });
            feature.setStyle(lineStyle);
            break;
        case 'polygon':
            // 创建面要素
            feature = new Feature({
                geometry: new Polygon(points),
                name: name
            });
            feature.setStyle(polygonStyle);
            break;
        default:
            break;
    }
    return feature;
}

/**
 * 加载JSON文件
 * @param {string} jsonUrl json文件url
 */
function loadJSON(jsonUrl){
    let vectorSource = new VectorSource({
        projection: 'EPSG:4326',
        url: jsonUrl,
        format: new GeoJSON()
    });

    return new VectorLayer({
        source: vectorSource,
        style: function(feature){
            switch (feature.getGeometry().getType()) {
                case 'Point':
                case 'MultiPoint':
                    return iconStyle;
                case 'LineString':
                case 'MultiLineString':
                    return lineStyle;
                case 'Polygon':
                case 'MultiPolygon':
                case 'GeometryCollection':
                case 'Circle':
                    return polygonStyle;
            }
        },
        visible: false
    })
}

/**
 * 加载WFS服务图层
 * @param {string} url WFS服务地址： http://124.221.116.93:8080/geoserver/map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=map%3A--polygon&maxFeatures=50&outputFormat=application%2Fjson
 */
function loadWFSService(url){
    let vectorSource = new VectorSource({
        format: new GeoJSON(),
        url: 
        function (extent) {
          return (
            url+
             '&bbox=' +
            extent.join(',') +
            ',EPSG:4326'
          );
        },
        strategy: bboxStrategy,
    });
    
    return new VectorLayer({
        source: vectorSource,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255,0,0,1.0)',
                width: 2,
              }),
            
            // image: new CircleStyle({
            //     radius: 7,
            //     fill: new Fill({
            //     color: 'yellow',
            //     }),
            // }),
        }),
    });
}

const vectorUtil = {
    createFeature: createFeature,
    loadJSON: loadJSON,
    loadWFSService: loadWFSService
};

export default vectorUtil;