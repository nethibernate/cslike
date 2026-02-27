// FrostBite Arena - 火车工厂地图配置
const MAP_TRAIN_FACTORY = {
    id: 'train_factory',
    name: '火车工厂',
    description: '废弃的工业工厂，火车道纵横交错，室内外复杂地形',
    thumbnail: 'assets/maps/factory_thumb.jpg',

    size: 112,
    corridorWidth: 5,
    blockSize: 8,

    colors: {
        sky: 0x5a5a6a,
        fog: 0x5a5a6a,
        floor: 0x4a4a4a,
        block: 0x3a3a3a,
        wall: 0x5a5a5a,
        crate: 0x6a5a4a,
        platform: 0x6a6a6a,
        factory: 0x4a4a4a,
        train: 0x2a2a3a,
        rail: 0x3a3a3a,
        glass: 0x88aacc,
        office: 0x5a5a5a
    },

    lighting: {
        ambientColor: 0x888899,
        ambientIntensity: 0.6,
        mainColor: 0xddddee,
        mainIntensity: 0.8,
        mainPosition: { x: 20, y: 50, z: 20 },
        fogNear: 40,
        fogFar: 120,
        pointLights: [
            // 工厂内部照明 (增强)
            { x: 0, y: 10, z: 0, color: 0xffffcc, intensity: 3, distance: 40 },
            { x: -15, y: 10, z: 0, color: 0xffffcc, intensity: 2.5, distance: 30 },
            { x: 15, y: 10, z: 0, color: 0xffffcc, intensity: 2.5, distance: 30 },
            { x: 0, y: 10, z: 10, color: 0xffffcc, intensity: 2, distance: 25 },
            { x: 0, y: 10, z: -10, color: 0xffffcc, intensity: 2, distance: 25 },
            // 火车道照明
            { x: -35, y: 6, z: -35, color: 0xffaa66, intensity: 1.5, distance: 25 },
            { x: 35, y: 6, z: -35, color: 0xffaa66, intensity: 1.5, distance: 25 },
            { x: -35, y: 6, z: 35, color: 0xffaa66, intensity: 1.5, distance: 25 },
            { x: 35, y: 6, z: 35, color: 0xffaa66, intensity: 1.5, distance: 25 }
        ]
    },

    // ========== 工厂主体建筑 ==========
    factoryBuilding: {
        x: 0, z: 0,
        width: 50, depth: 35, height: 12,
        wallThickness: 1,
        doors: [
            { side: 'north', position: 0.5, width: 4, height: 4 },
            { side: 'south', position: 0.5, width: 4, height: 4 },
            { side: 'east', position: 0.3, width: 3, height: 3.5 },
            { side: 'west', position: 0.3, width: 3, height: 3.5 }
        ],
        secondFloor: {
            y: 6,
            offices: [
                { x: -18, z: -12, width: 10, depth: 6, height: 5 },
                { x: 18, z: -12, width: 10, depth: 6, height: 5 }
            ],
            corridors: [
                { x: 0, z: -12, width: 26, depth: 4 },
                { x: -18, z: -3, width: 6, depth: 14 },
                { x: 18, z: -3, width: 6, depth: 14 },
                { x: 0, z: 2, width: 30, depth: 4 }
            ],
            glassWindows: [
                { x: 0, z: -5, width: 20, height: 3.5 }
            ]
        },
        stairs: [
            { x: -20, z: 8, rotation: Math.PI },
            { x: 20, z: 8, rotation: Math.PI }
        ]
    },

    // ========== 火车道系统 ==========
    trainTracks: [
        { z: -42, length: 100 },
        { z: -48, length: 100 },
        { z: 42, length: 100 },
        { z: 48, length: 100 }
    ],

    // ========== 火车车厢 ==========
    trains: [
        { x: -25, z: -42, length: 12, hasLadder: true },
        { x: -13, z: -42, length: 10, hasLadder: false },
        { x: 20, z: -48, length: 15, hasLadder: true },
        { x: -20, z: 42, length: 14, hasLadder: true },
        { x: 15, z: 48, length: 12, hasLadder: false },
        { x: 28, z: 48, length: 10, hasLadder: true }
    ],

    // ========== 外部掩体 ==========
    blocks: [
        { type: 'stone', offsetX: -1.8, offsetZ: -0.3, scale: 0.3 },
        { type: 'stone', offsetX: -1.8, offsetZ: 0.3, scale: 0.25 },
        { type: 'stone', offsetX: 1.8, offsetZ: -0.3, scale: 0.3 },
        { type: 'stone', offsetX: 1.8, offsetZ: 0.3, scale: 0.25 },
        { type: 'stone', offsetX: -1.6, offsetZ: -1.5, scale: 0.35 },
        { type: 'stone', offsetX: 1.6, offsetZ: -1.5, scale: 0.35 },
        { type: 'stone', offsetX: -1.6, offsetZ: 1.5, scale: 0.35 },
        { type: 'stone', offsetX: 1.6, offsetZ: 1.5, scale: 0.35 }
    ],

    // 高台平台
    platforms: [
        { x: -40, z: 0, width: 6, height: 2.5, depth: 10 },
        { x: 40, z: 0, width: 6, height: 2.5, depth: 10 },
        { x: 0, z: -36, width: 8, height: 1.5, depth: 4 },
        { x: 0, z: 36, width: 8, height: 1.5, depth: 4 },
        { x: -45, z: -45, width: 5, height: 2, depth: 5 },
        { x: 45, z: -45, width: 5, height: 2, depth: 5 },
        { x: -45, z: 45, width: 5, height: 2, depth: 5 },
        { x: 45, z: 45, width: 5, height: 2, depth: 5 }
    ],

    // 圆柱 (油桶、烟囱)
    cylinders: [
        { x: -30, z: -5, radius: 2, height: 15 },
        { x: 30, z: -5, radius: 2, height: 15 },
        { x: -35, z: 15, radius: 1, height: 2 },
        { x: -33, z: 17, radius: 0.8, height: 1.8 },
        { x: -37, z: 16, radius: 0.9, height: 1.9 },
        { x: 35, z: 15, radius: 1, height: 2 },
        { x: 33, z: 17, radius: 0.8, height: 1.8 },
        { x: 37, z: 16, radius: 0.9, height: 1.9 },
        { x: -40, z: -40, radius: 0.7, height: 1.5 },
        { x: 40, z: -40, radius: 0.7, height: 1.5 },
        { x: -40, z: 40, radius: 0.7, height: 1.5 },
        { x: 40, z: 40, radius: 0.7, height: 1.5 }
    ],

    // 木箱掩体
    crates: [
        // 工厂内部
        { x: -18, z: 8 }, { x: 18, z: 8 }, { x: -10, z: 5 }, { x: 10, z: 5 },
        { x: 0, z: 10 }, { x: -5, z: -5 }, { x: 5, z: -5 },
        // 工厂外部
        { x: -35, z: 0 }, { x: 35, z: 0 },
        { x: -45, z: -25 }, { x: 45, z: -25 },
        { x: -45, z: 25 }, { x: 45, z: 25 },
        // 火车道旁
        { x: -10, z: -38 }, { x: 10, z: -38 },
        { x: -10, z: 38 }, { x: 10, z: 38 },
        { x: -30, z: -45 }, { x: 30, z: -45 },
        { x: -30, z: 45 }, { x: 30, z: 45 }
    ],

    // L形墙
    lShapes: [
        { x: -8, z: -20, armLength: 3, armWidth: 0.5, height: 2.5, rotation: 0 },
        { x: 8, z: -20, armLength: 3, armWidth: 0.5, height: 2.5, rotation: Math.PI / 2 },
        { x: -8, z: 20, armLength: 3, armWidth: 0.5, height: 2.5, rotation: -Math.PI / 2 },
        { x: 8, z: 20, armLength: 3, armWidth: 0.5, height: 2.5, rotation: Math.PI }
    ],

    spawnPoints: {
        blue: [
            { x: -40, z: 52 }, { x: -20, z: 52 }, { x: 0, z: 52 },
            { x: 20, z: 52 }, { x: 40, z: 52 }
        ],
        red: [
            { x: -40, z: -52 }, { x: -20, z: -52 }, { x: 0, z: -52 },
            { x: 20, z: -52 }, { x: 40, z: -52 }
        ]
    },

    patrolPoints: [
        // 工厂内部
        { x: 0, z: 0 }, { x: -15, z: 0 }, { x: 15, z: 0 },
        { x: 0, z: 10 }, { x: 0, z: -10 },
        { x: -20, z: 10 }, { x: 20, z: 10 },
        // 工厂外部
        { x: -35, z: 0 }, { x: 35, z: 0 },
        { x: -35, z: -25 }, { x: 35, z: -25 },
        { x: -35, z: 25 }, { x: 35, z: 25 },
        // 火车道区域
        { x: 0, z: -40 }, { x: -25, z: -40 }, { x: 25, z: -40 },
        { x: 0, z: 40 }, { x: -25, z: 40 }, { x: 25, z: 40 },
        // 角落
        { x: -45, z: -45 }, { x: 45, z: -45 },
        { x: -45, z: 45 }, { x: 45, z: 45 }
    ]
};
