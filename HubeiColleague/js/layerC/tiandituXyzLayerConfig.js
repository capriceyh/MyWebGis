import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { get as getProjection } from "ol/proj";
import LayerGroup from "ol/layer/group";

// 创建XYZ图层
function createXYZLayer(url) {
  return new TileLayer({
    source: new XYZ({
      url: url,
      projection: projection,
    })
  });
}

// WGS84坐标系
const projection = getProjection("EPSG:4326");

// 天地图key--自行获取
const tiandituKey;

// 天地图矢量
const tiandituVecUrl =
  "http://t{0-6}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

// 天地图矢量注记
const tiandituCvaUrl =
  "http://t{0-6}.tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

// 天地图影像
const tiandituImgUrl =
  "http://t{0-6}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

// 天地图影像注记
const tiandituCiaUrl =
  "http://t{0-6}.tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

// 天地图地形
const tiandituTerUrl =
  "http://t{0-6}.tianditu.gov.cn/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

// 天地图地形注记
const tiandituCtaUrl =
  "http://t{0-6}.tianditu.gov.cn/cta_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta" +
  "&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&tk=" +
  tiandituKey;

const tiandituXYZ = {
  VEC: new LayerGroup({
    id: "tiandituXYZVec",
    layers: [createXYZLayer(tiandituVecUrl), createXYZLayer(tiandituCvaUrl)],
    visible: false
  }),
  IMG: new LayerGroup({
    id: "tiandituXYZImg",
    layers: [createXYZLayer(tiandituImgUrl), createXYZLayer(tiandituCiaUrl)],
    visible: false
  }),
  TER: new LayerGroup({
    id: "tiandituXYZTer",
    layers: [createXYZLayer(tiandituTerUrl), createXYZLayer(tiandituCtaUrl)],
    visible: false
  }),
};

export default tiandituXYZ;
