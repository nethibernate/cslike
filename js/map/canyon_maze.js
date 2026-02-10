// FrostBite Arena - 迷宫峡谷地图配置
const MAP_CANYON_MAZE = {
    id: 'canyon_maze',
    name: '迷宫峡谷',
    description: '蜿蜒的峡谷地形，迷宫般的路径考验你的战术意识',
    thumbnail: 'assets/maps/canyon_thumb.jpg',

    size: 56,
    corridorWidth: 3.5,
    blockSize: 5,

    colors: {
        sky: 0xcc9966,
        fog: 0xcc9966,
        floor: 0xb89070,
        block: 0x9a7050,
        wall: 0xa88060,
        crate: 0x705030
    },

    // 迷宫式布局 - 15+ 岩石方块
    blocks: [
        // 中央核心区 - 形成多方向通道
        { type: 'stone', offsetX: 0, offsetZ: 0, scale: 0.6 },
        { type: 'stone', offsetX: -0.4, offsetZ: -0.4, scale: 0.4 },
        { type: 'stone', offsetX: 0.4, offsetZ: 0.4, scale: 0.4 },
        { type: 'stone', offsetX: -0.4, offsetZ: 0.4, scale: 0.35 },
        { type: 'stone', offsetX: 0.4, offsetZ: -0.4, scale: 0.35 },

        // 北部峡谷区
        { type: 'stone', offsetX: -1.2, offsetZ: -1.6, scale: 0.7 },
        { type: 'stone', offsetX: 0, offsetZ: -1.5, scale: 0.5 },
        { type: 'stone', offsetX: 1.2, offsetZ: -1.6, scale: 0.65 },
        { type: 'stone', offsetX: -0.6, offsetZ: -1.2, scale: 0.3 },
        { type: 'stone', offsetX: 0.6, offsetZ: -1.2, scale: 0.3 },

        // 南部峡谷区
        { type: 'stone', offsetX: -1.2, offsetZ: 1.6, scale: 0.65 },
        { type: 'stone', offsetX: 0, offsetZ: 1.5, scale: 0.55 },
        { type: 'stone', offsetX: 1.2, offsetZ: 1.6, scale: 0.7 },
        { type: 'stone', offsetX: -0.6, offsetZ: 1.2, scale: 0.3 },
        { type: 'stone', offsetX: 0.6, offsetZ: 1.2, scale: 0.3 },

        // 西部迷宫区 - 复杂曲折
        { type: 'stone', offsetX: -1.8, offsetZ: -0.8, scale: 0.6 },
        { type: 'stone', offsetX: -1.6, offsetZ: 0, scale: 0.5 },
        { type: 'stone', offsetX: -1.8, offsetZ: 0.8, scale: 0.55 },
        { type: 'stone', offsetX: -1.3, offsetZ: -0.4, scale: 0.25 },
        { type: 'stone', offsetX: -1.3, offsetZ: 0.4, scale: 0.25 },

        // 东部迷宫区 - 复杂曲折
        { type: 'stone', offsetX: 1.8, offsetZ: -0.8, scale: 0.55 },
        { type: 'stone', offsetX: 1.6, offsetZ: 0, scale: 0.5 },
        { type: 'stone', offsetX: 1.8, offsetZ: 0.8, scale: 0.6 },
        { type: 'stone', offsetX: 1.3, offsetZ: -0.4, scale: 0.25 },
        { type: 'stone', offsetX: 1.3, offsetZ: 0.4, scale: 0.25 },

        // 四角孤立岩石
        { type: 'stone', offsetX: -1.9, offsetZ: -1.9, scale: 0.45 },
        { type: 'stone', offsetX: 1.9, offsetZ: -1.9, scale: 0.4 },
        { type: 'stone', offsetX: -1.9, offsetZ: 1.9, scale: 0.4 },
        { type: 'stone', offsetX: 1.9, offsetZ: 1.9, scale: 0.45 },

        // 连接通道中的小岩石
        { type: 'stone', offsetX: -1.0, offsetZ: 0, scale: 0.2 },
        { type: 'stone', offsetX: 1.0, offsetZ: 0, scale: 0.2 },
        { type: 'stone', offsetX: 0, offsetZ: -0.9, scale: 0.2 },
        { type: 'stone', offsetX: 0, offsetZ: 0.9, scale: 0.2 }
    ],

    // 分散在峡谷中的掩体
    crates: [
        // 中心十字区域
        { x: 0, z: -8 },
        { x: 0, z: 8 },
        { x: -8, z: 0 },
        { x: 8, z: 0 },
        // 内圈
        { x: -10, z: -10 },
        { x: 10, z: -10 },
        { x: -10, z: 10 },
        { x: 10, z: 10 },
        // 中圈
        { x: -18, z: -18 },
        { x: 18, z: -18 },
        { x: -18, z: 18 },
        { x: 18, z: 18 },
        { x: -18, z: 0 },
        { x: 18, z: 0 },
        { x: 0, z: -18 },
        { x: 0, z: 18 },
        // 外圈
        { x: -24, z: -24 },
        { x: 24, z: -24 },
        { x: -24, z: 24 },
        { x: 24, z: 24 },
        { x: -24, z: 0 },
        { x: 24, z: 0 }
    ],

    spawnPoints: {
        blue: [
            { x: -20, z: 26 },
            { x: -10, z: 26 },
            { x: 0, z: 26 },
            { x: 10, z: 26 },
            { x: 20, z: 26 }
        ],
        red: [
            { x: -20, z: -26 },
            { x: -10, z: -26 },
            { x: 0, z: -26 },
            { x: 10, z: -26 },
            { x: 20, z: -26 }
        ]
    },

    // 密集的巡逻点覆盖迷宫区域
    patrolPoints: [
        // 中心核心
        { x: 0, z: 0 },
        { x: -4, z: 0 },
        { x: 4, z: 0 },
        { x: 0, z: -4 },
        { x: 0, z: 4 },
        // 第一圈
        { x: -8, z: -8 },
        { x: 8, z: -8 },
        { x: -8, z: 8 },
        { x: 8, z: 8 },
        { x: -8, z: 0 },
        { x: 8, z: 0 },
        { x: 0, z: -8 },
        { x: 0, z: 8 },
        // 第二圈
        { x: -14, z: -14 },
        { x: 14, z: -14 },
        { x: -14, z: 14 },
        { x: 14, z: 14 },
        { x: -14, z: 0 },
        { x: 14, z: 0 },
        { x: 0, z: -14 },
        { x: 0, z: 14 },
        // 第三圈
        { x: -20, z: -20 },
        { x: 20, z: -20 },
        { x: -20, z: 20 },
        { x: 20, z: 20 },
        { x: -20, z: 0 },
        { x: 20, z: 0 },
        { x: 0, z: -20 },
        { x: 0, z: 20 },
        // 中间过渡点
        { x: -10, z: -5 },
        { x: 10, z: -5 },
        { x: -10, z: 5 },
        { x: 10, z: 5 },
        { x: -5, z: -10 },
        { x: 5, z: -10 },
        { x: -5, z: 10 },
        { x: 5, z: 10 },
        // 外围点
        { x: -24, z: -12 },
        { x: 24, z: -12 },
        { x: -24, z: 12 },
        { x: 24, z: 12 },
        { x: -12, z: -24 },
        { x: 12, z: -24 },
        { x: -12, z: 24 },
        { x: 12, z: 24 }
    ]
};
