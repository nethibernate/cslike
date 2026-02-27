// FrostBite Arena - 迷宫峡谷地图配置
const MAP_CANYON_MAZE = {
    id: 'canyon_maze',
    name: '迷宫峡谷',
    description: '蜿蜒的峡谷地形，风雪交加考验你的战术意识',
    thumbnail: 'assets/maps/canyon_thumb.jpg',

    size: 56,
    corridorWidth: 3.5,
    blockSize: 5,

    // 启用下雪天气
    weather: 'snow',

    colors: {
        sky: 0x8899aa,
        fog: 0x8899aa,
        floor: 0x9a8a7a,
        block: 0x7a6a5a,
        wall: 0x8a7a6a,
        crate: 0x5a4a3a,
        platform: 0x8a8a8a,
        cylinder: 0x6a5a4a,
        ramp: 0x8a7a6a
    },

    blocks: [
        // 中央核心区 - 精简版
        { type: 'stone', offsetX: 0, offsetZ: 0, scale: 0.5 },
        { type: 'stone', offsetX: -0.4, offsetZ: -0.4, scale: 0.35 },
        { type: 'stone', offsetX: 0.4, offsetZ: 0.4, scale: 0.35 },
        // 北部峡谷区
        { type: 'stone', offsetX: -1.2, offsetZ: -1.6, scale: 0.6 },
        { type: 'stone', offsetX: 0, offsetZ: -1.5, scale: 0.45 },
        { type: 'stone', offsetX: 1.2, offsetZ: -1.6, scale: 0.55 },
        // 南部峡谷区
        { type: 'stone', offsetX: -1.2, offsetZ: 1.6, scale: 0.55 },
        { type: 'stone', offsetX: 0, offsetZ: 1.5, scale: 0.5 },
        { type: 'stone', offsetX: 1.2, offsetZ: 1.6, scale: 0.6 },
        // 西部迷宫区
        { type: 'stone', offsetX: -1.8, offsetZ: -0.8, scale: 0.5 },
        { type: 'stone', offsetX: -1.6, offsetZ: 0, scale: 0.45 },
        { type: 'stone', offsetX: -1.8, offsetZ: 0.8, scale: 0.5 },
        // 东部迷宫区
        { type: 'stone', offsetX: 1.8, offsetZ: -0.8, scale: 0.5 },
        { type: 'stone', offsetX: 1.6, offsetZ: 0, scale: 0.45 },
        { type: 'stone', offsetX: 1.8, offsetZ: 0.8, scale: 0.5 },
        // 四角孤立岩石
        { type: 'stone', offsetX: -1.9, offsetZ: -1.9, scale: 0.4 },
        { type: 'stone', offsetX: 1.9, offsetZ: -1.9, scale: 0.35 },
        { type: 'stone', offsetX: -1.9, offsetZ: 1.9, scale: 0.35 },
        { type: 'stone', offsetX: 1.9, offsetZ: 1.9, scale: 0.4 }
    ],

    // 高台平台 - 峡谷制高点
    platforms: [
        // 中央高地
        { x: 0, z: 0, width: 5, height: 1.8, depth: 5 },
        // 峡谷入口高台
        { x: 0, z: -20, width: 6, height: 1.5, depth: 4 },
        { x: 0, z: 20, width: 6, height: 1.5, depth: 4 },
        // 侧翼观察点
        { x: -22, z: 0, width: 4, height: 2, depth: 6 },
        { x: 22, z: 0, width: 4, height: 2, depth: 6 }
    ],

    // 斜坡 - 连接不同高度
    ramps: [
        // 中央高台斜坡（四个方向）
        { x: 0, z: -5, width: 3, height: 1.8, length: 4, rotation: 0 },
        { x: 0, z: 5, width: 3, height: 1.8, length: 4, rotation: Math.PI },
        { x: -5, z: 0, width: 3, height: 1.8, length: 4, rotation: Math.PI / 2 },
        { x: 5, z: 0, width: 3, height: 1.8, length: 4, rotation: -Math.PI / 2 },
        // 峡谷入口斜坡
        { x: -4, z: -20, width: 2.5, height: 1.5, length: 3.5, rotation: Math.PI / 2 },
        { x: 4, z: -20, width: 2.5, height: 1.5, length: 3.5, rotation: -Math.PI / 2 },
        { x: -4, z: 20, width: 2.5, height: 1.5, length: 3.5, rotation: Math.PI / 2 },
        { x: 4, z: 20, width: 2.5, height: 1.5, length: 3.5, rotation: -Math.PI / 2 }
    ],

    // 圆柱形岩石柱
    cylinders: [
        // 峡谷内天然石柱
        { x: -12, z: -12, radius: 1.5, height: 4 },
        { x: 12, z: -12, radius: 1.2, height: 3.5 },
        { x: -12, z: 12, radius: 1.2, height: 3.5 },
        { x: 12, z: 12, radius: 1.5, height: 4 },
        // 峡谷通道石柱
        { x: -8, z: 0, radius: 0.8, height: 3 },
        { x: 8, z: 0, radius: 0.8, height: 3 },
        { x: 0, z: -8, radius: 0.8, height: 3 },
        { x: 0, z: 8, radius: 0.8, height: 3 },
        // 外围大石柱
        { x: -20, z: -15, radius: 1.8, height: 5 },
        { x: 20, z: -15, radius: 1.6, height: 4.5 },
        { x: -20, z: 15, radius: 1.6, height: 4.5 },
        { x: 20, z: 15, radius: 1.8, height: 5 },
        // 小石柱散布
        { x: -6, z: -15, radius: 0.6, height: 2 },
        { x: 6, z: -15, radius: 0.5, height: 1.8 },
        { x: -6, z: 15, radius: 0.5, height: 1.8 },
        { x: 6, z: 15, radius: 0.6, height: 2 }
    ],

    crates: [
        { x: 0, z: -8 }, { x: 0, z: 8 }, { x: -8, z: 0 }, { x: 8, z: 0 },
        { x: -18, z: -18 }, { x: 18, z: -18 }, { x: -18, z: 18 }, { x: 18, z: 18 },
        { x: -24, z: 0 }, { x: 24, z: 0 }
    ],

    spawnPoints: {
        blue: [
            { x: -20, z: 26 }, { x: -10, z: 26 }, { x: 0, z: 26 },
            { x: 10, z: 26 }, { x: 20, z: 26 }
        ],
        red: [
            { x: -20, z: -26 }, { x: -10, z: -26 }, { x: 0, z: -26 },
            { x: 10, z: -26 }, { x: 20, z: -26 }
        ]
    },

    patrolPoints: [
        { x: 0, z: 0 }, { x: -4, z: 0 }, { x: 4, z: 0 }, { x: 0, z: -4 }, { x: 0, z: 4 },
        { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
        { x: -14, z: -14 }, { x: 14, z: -14 }, { x: -14, z: 14 }, { x: 14, z: 14 },
        { x: -20, z: -20 }, { x: 20, z: -20 }, { x: -20, z: 20 }, { x: 20, z: 20 },
        { x: -20, z: 0 }, { x: 20, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 },
        { x: -12, z: -6 }, { x: 12, z: -6 }, { x: -12, z: 6 }, { x: 12, z: 6 }
    ]
};
