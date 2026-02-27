// FrostBite Arena - 地图配置注册表
// 各地图配置已拆分到 js/map/ 目录下的独立文件中
// 本文件负责将所有地图注册到统一的 MAP_CONFIGS 对象中

const MAP_CONFIGS = {
    fy_iceworld: MAP_FY_ICEWORLD,
    dust_arena: MAP_DUST_ARENA,
    frost_fortress: MAP_FROST_FORTRESS,
    industrial_ruins: MAP_INDUSTRIAL_RUINS,
    canyon_maze: MAP_CANYON_MAZE,
    train_factory: MAP_TRAIN_FACTORY
};

// 获取所有地图列表
function getMapList() {
    return Object.values(MAP_CONFIGS).map(config => ({
        id: config.id,
        name: config.name,
        description: config.description,
        thumbnail: config.thumbnail,
        size: config.size
    }));
}

// 获取指定地图配置
function getMapConfig(mapId) {
    return MAP_CONFIGS[mapId] || MAP_CONFIGS.fy_iceworld;
}
