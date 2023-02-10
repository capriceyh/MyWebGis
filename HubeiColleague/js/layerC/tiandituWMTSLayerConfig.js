import TileLayer from "ol/layer/Tile";
import { get as getProjection } from "ol/proj";
import LayerGroup from "ol/layer/group";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import * as olExtent from "ol/extent";

const projection = getProjection("EPSG:4326");
const size = olExtent.getWidth(projection.getExtent()) / 256;

const resolutions = [];
const matrixIds = [];
for (let i = 0; i < 19; ++i) {
  resolutions[i] = size / Math.pow(2, i);
  matrixIds[i] = i;
}

// 天地图key自行获取
const tiandituKey;

// 创建天地图图层，WMTS方式调用
function createTiandituWMTSLayer(options) {
  return new TileLayer({
    source: new WMTS({
      url: options.url + `?tk=${tiandituKey}`,
      projection: projection,
      layer: options.layer,
      style: "default",
      format: "tiles",
      matrixSet: options.matrixSet,
      tileGrid: new WMTSTileGrid({
        resolutions: resolutions.slice(0, 18),
        matrixIds: matrixIds,
        origin: olExtent.getTopLeft(projection.getExtent()),
      }),
      wrapX: true,
    })
  });
}

// 天地图矢量
const tiandituVecOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/vec_c/wmts",
  layer: "vec",
  matrixSet: "c",
};

// 天地图矢量注记
const tiandituCvaOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/cva_c/wmts",
  layer: "cva",
  matrixSet: "c",
};

// 天地图影像
const tiandituImgOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/img_c/wmts",
  layer: "img",
  matrixSet: "c",
};

// 天地图影像注记
const tiandituCiaOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/cia_c/wmts",
  layer: "cia",
  matrixSet: "c",
};

// 天地图地形
const tiandituTerOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/ter_c/wmts",
  layer: "ter",
  matrixSet: "c",
};

// 天地图地形注记
const tiandituCtaOptions = {
  url: "http://t{0-6}.tianditu.gov.cn/cta_c/wmts",
  layer: "cta",
  matrixSet: "c",
};

const tiandituWMTS = {
  VEC: new LayerGroup({
    id: "tiandituWMTSVec",
    layers: [
      createTiandituWMTSLayer(tiandituVecOptions),
      createTiandituWMTSLayer(tiandituCvaOptions),
    ],
    visible: false
  }),
  IMG: new LayerGroup({
    id: "tiandituWMTSImg",
    layers: [
      createTiandituWMTSLayer(tiandituImgOptions),
      createTiandituWMTSLayer(tiandituCiaOptions),
    ],
    visible: false
  }),
  TER: new LayerGroup({
    id: "tiandituWMTSTer",
    layers: [
      createTiandituWMTSLayer(tiandituTerOptions),
      createTiandituWMTSLayer(tiandituCtaOptions),
    ],
    visible: false
  }),
};

export default tiandituWMTS;
