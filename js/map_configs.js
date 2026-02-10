// FrostBite Arena - 地图配置数据
const MAP_CONFIGS = {
    // ============ fy_iceworld - 冰雪世界 ============
    fy_iceworld: {
        id: 'fy_iceworld',
        name: '冰雪世界',
        description: '经典的冰雪竞技场，四角冰块布局',
        thumbnail: 'assets/maps/iceworld_thumb.jpg',

        // 地图尺寸
        size: 28,
        corridorWidth: 4,
        blockSize: 8,

        // 颜色主题
        colors: {
            sky: 0x88bbee,
            fog: 0x88bbee,
            floor: 0xe8e8e0,
            block: 0xc8c8b0,
            wall: 0xaabbcc,
            crate: 0x8b6914
        },

        // 四个大冰块 (相对于中心的偏移)
        blocks: [
            { type: 'ice', offsetX: -1, offsetZ: -1 },  // 左上
            { type: 'ice', offsetX: 1, offsetZ: -1 },   // 右上
            { type: 'ice', offsetX: -1, offsetZ: 1 },   // 左下
            { type: 'ice', offsetX: 1, offsetZ: 1 }     // 右下
        ],

        // 木箱掩体
        crates: [
            { x: -12, z: -12 },  // 四角
            { x: 12, z: -12 },
            { x: -12, z: 12 },
            { x: 12, z: 12 },
            { x: -12, z: 0 },   // 两侧中央
            { x: 12, z: 0 }
        ],

        // 出生点
        spawnPoints: {
            blue: [
                { x: -8, z: 12 },
                { x: -4, z: 12 },
                { x: 0, z: 12 },
                { x: 4, z: 12 },
                { x: 8, z: 12 }
            ],
            red: [
                { x: -8, z: -12 },
                { x: -4, z: -12 },
                { x: 0, z: -12 },
                { x: 4, z: -12 },
                { x: 8, z: -12 }
            ]
        },

        // 巡逻点
        patrolPoints: [
            { x: 0, z: 0 },
            { x: -5, z: 0 },
            { x: 5, z: 0 },
            { x: 0, z: -5 },
            { x: 0, z: 5 },
            { x: -10, z: 0 },
            { x: 10, z: 0 },
            { x: 0, z: -10 },
            { x: 0, z: 10 },
            { x: -10, z: -10 },
            { x: 10, z: -10 },
            { x: -10, z: 10 },
            { x: 10, z: 10 },
            { x: -6, z: -6 },
            { x: 6, z: -6 },
            { x: -6, z: 6 },
            { x: 6, z: 6 }
        ]
    },

    // ============ dust_arena - 沙漠竞技场 ============
    dust_arena: {
        id: 'dust_arena',
        name: '沙漠竞技场',
        description: '开放式沙漠战场，长走廊设计',
        thumbnail: 'assets/maps/dust_thumb.jpg',

        size: 32,
        corridorWidth: 5,
        blockSize: 6,

        colors: {
            sky: 0xd4a060,
            fog: 0xd4a060,
            floor: 0xc9a35c,
            block: 0xa08050,
            wall: 0xb09060,
            crate: 0x6b4914
        },

        // 两边对称的大方块
        blocks: [
            { type: 'stone', offsetX: -1.2, offsetZ: -0.8 },
            { type: 'stone', offsetX: 1.2, offsetZ: -0.8 },
            { type: 'stone', offsetX: -1.2, offsetZ: 0.8 },
            { type: 'stone', offsetX: 1.2, offsetZ: 0.8 },
            // 中间小方块
            { type: 'stone', offsetX: 0, offsetZ: 0, scale: 0.5 }
        ],

        crates: [
            { x: -14, z: -14 },
            { x: 14, z: -14 },
            { x: -14, z: 14 },
            { x: 14, z: 14 },
            { x: 0, z: -10 },
            { x: 0, z: 10 },
            { x: -7, z: 0 },
            { x: 7, z: 0 }
        ],

        spawnPoints: {
            blue: [
                { x: -10, z: 14 },
                { x: -5, z: 14 },
                { x: 0, z: 14 },
                { x: 5, z: 14 },
                { x: 10, z: 14 }
            ],
            red: [
                { x: -10, z: -14 },
                { x: -5, z: -14 },
                { x: 0, z: -14 },
                { x: 5, z: -14 },
                { x: 10, z: -14 }
            ]
        },

        patrolPoints: [
            { x: 0, z: 0 },
            { x: -8, z: 0 },
            { x: 8, z: 0 },
            { x: 0, z: -8 },
            { x: 0, z: 8 },
            { x: -12, z: -8 },
            { x: 12, z: -8 },
            { x: -12, z: 8 },
            { x: 12, z: 8 },
            { x: -6, z: -10 },
            { x: 6, z: -10 },
            { x: -6, z: 10 },
            { x: 6, z: 10 }
        ]
    },

    // ============ frost_fortress - 冰霜堡垒 ============
    frost_fortress: {
        id: 'frost_fortress',
        name: '冰霜堡垒',
        description: '复杂的多层结构，适合战术对抗',
        thumbnail: 'assets/maps/fortress_thumb.jpg',

        size: 30,
        corridorWidth: 3,
        blockSize: 5,

        colors: {
            sky: 0x6699cc,
            fog: 0x6699cc,
            floor: 0xd0d8e0,
            block: 0x8899aa,
            wall: 0x7788aa,
            crate: 0x556677
        },

        // 中心区域 + 四周掩体
        blocks: [
            // 中心十字结构
            { type: 'ice', offsetX: 0, offsetZ: 0, scale: 0.6 },
            // 四角大方块
            { type: 'ice', offsetX: -1.3, offsetZ: -1.3, scale: 0.8 },
            { type: 'ice', offsetX: 1.3, offsetZ: -1.3, scale: 0.8 },
            { type: 'ice', offsetX: -1.3, offsetZ: 1.3, scale: 0.8 },
            { type: 'ice', offsetX: 1.3, offsetZ: 1.3, scale: 0.8 },
            // 侧翼小方块
            { type: 'ice', offsetX: -1.5, offsetZ: 0, scale: 0.4 },
            { type: 'ice', offsetX: 1.5, offsetZ: 0, scale: 0.4 }
        ],

        crates: [
            { x: -13, z: 0 },
            { x: 13, z: 0 },
            { x: 0, z: -13 },
            { x: 0, z: 13 },
            { x: -8, z: -8 },
            { x: 8, z: -8 },
            { x: -8, z: 8 },
            { x: 8, z: 8 }
        ],

        spawnPoints: {
            blue: [
                { x: -10, z: 13 },
                { x: -5, z: 13 },
                { x: 0, z: 13 },
                { x: 5, z: 13 },
                { x: 10, z: 13 }
            ],
            red: [
                { x: -10, z: -13 },
                { x: -5, z: -13 },
                { x: 0, z: -13 },
                { x: 5, z: -13 },
                { x: 10, z: -13 }
            ]
        },

        patrolPoints: [
            { x: 0, z: 0 },
            { x: -6, z: 0 },
            { x: 6, z: 0 },
            { x: 0, z: -6 },
            { x: 0, z: 6 },
            { x: -10, z: -5 },
            { x: 10, z: -5 },
            { x: -10, z: 5 },
            { x: 10, z: 5 },
            { x: -4, z: -8 },
            { x: 4, z: -8 },
            { x: -4, z: 8 },
            { x: 4, z: 8 }
        ]
    },

    // ============ industrial_ruins - 工业废墟 ============
    industrial_ruins: {
        id: 'industrial_ruins',
        name: '工业废墟',
        description: '废弃的工业区，上下两层结构，复杂的建筑布局提供丰富战术选择',
        thumbnail: 'assets/maps/industrial_thumb.jpg',

        size: 52,
        corridorWidth: 4,
        blockSize: 6,

        colors: {
            sky: 0x4a4a4a,
            fog: 0x4a4a4a,
            floor: 0x3a3a2a,
            block: 0x5a4a3a,
            wall: 0x6a5a4a,
            crate: 0x3a2a1a,
            platform: 0x5a5a4a,
            cylinder: 0x8b4513,
            secondFloor: 0x4a4a3a,
            stairs: 0x5a5a4a
        },

        // 自定义工业灯光
        lighting: {
            ambientColor: 0x998866,
            ambientIntensity: 0.5,
            mainColor: 0xffddaa,
            mainIntensity: 0.7,
            mainPosition: { x: 10, y: 30, z: 10 },
            fogNear: 25,
            fogFar: 60,
            // 工业区点光源
            pointLights: [
                // 中央高台灯
                { x: 0, y: 6, z: 0, color: 0xffaa44, intensity: 1.5, distance: 20 },
                // 西北仓库区
                { x: -18, y: 5, z: -16, color: 0xffcc66, intensity: 1.2, distance: 15 },
                // 东北厂房区
                { x: 18, y: 5, z: -16, color: 0xffcc66, intensity: 1.2, distance: 15 },
                // 西南办公区
                { x: -18, y: 5, z: 16, color: 0xaaccff, intensity: 1.0, distance: 12 },
                // 东南储罐区
                { x: 18, y: 5, z: 16, color: 0xff8844, intensity: 1.5, distance: 15 },
                // 二层走廊灯
                { x: -10, y: 5, z: 0, color: 0xffaa55, intensity: 0.8, distance: 10 },
                { x: 10, y: 5, z: 0, color: 0xffaa55, intensity: 0.8, distance: 10 }
            ]
        },

        // 主要建筑方块
        blocks: [
            // 中央区域 - 废弃机械设备
            { type: 'stone', offsetX: 0, offsetZ: 0, scale: 0.5 },
            // 西北仓库区
            { type: 'stone', offsetX: -1.5, offsetZ: -1.4, scale: 0.7 },
            { type: 'stone', offsetX: -1.2, offsetZ: -1.7, scale: 0.35 },
            // 东北厂房区
            { type: 'stone', offsetX: 1.5, offsetZ: -1.4, scale: 0.65 },
            { type: 'stone', offsetX: 1.8, offsetZ: -1.2, scale: 0.3 },
            // 西南办公区
            { type: 'stone', offsetX: -1.4, offsetZ: 1.3, scale: 0.55 },
            // 东南储罐区
            { type: 'stone', offsetX: 1.4, offsetZ: 1.4, scale: 0.5 }
        ],

        // 房间结构
        rooms: [
            // 西北 - 仓库控制室
            {
                x: -20, z: -18, width: 8, height: 3.5, depth: 6,
                openings: [{ side: 'south', position: 0.5, width: 2 }]
            },
            // 东北 - 厂房机房
            {
                x: 20, z: -18, width: 8, height: 3.5, depth: 6,
                openings: [{ side: 'south', position: 0.5, width: 2 }]
            },
            // 西南 - 办公休息室
            {
                x: -20, z: 18, width: 8, height: 3.5, depth: 6,
                openings: [{ side: 'north', position: 0.5, width: 2 }]
            },
            // 东南 - 储罐监控室
            {
                x: 20, z: 18, width: 8, height: 3.5, depth: 6,
                openings: [{ side: 'north', position: 0.5, width: 2 }]
            },
            // 中央 - 主控制室（小型）
            {
                x: 0, z: -10, width: 5, height: 3, depth: 4,
                openings: [{ side: 'south', position: 0.5, width: 1.5 }]
            }
        ],

        // 二层平台结构
        secondFloors: [
            // 西侧走廊二层
            { x: -12, y: 3.5, z: 0, width: 6, depth: 20 },
            // 东侧走廊二层
            { x: 12, y: 3.5, z: 0, width: 6, depth: 20 },
            // 北侧连接平台
            { x: 0, y: 3.5, z: -8, width: 18, depth: 4 },
            // 南侧连接平台
            { x: 0, y: 3.5, z: 8, width: 18, depth: 4 }
        ],

        // 楼梯连接上下层
        stairs: [
            // 西侧楼梯（北）
            { x: -12, z: -12, width: 2.5, height: 3.5, depth: 4, steps: 10, rotation: 0 },
            // 西侧楼梯（南）
            { x: -12, z: 12, width: 2.5, height: 3.5, depth: 4, steps: 10, rotation: Math.PI },
            // 东侧楼梯（北）
            { x: 12, z: -12, width: 2.5, height: 3.5, depth: 4, steps: 10, rotation: 0 },
            // 东侧楼梯（南）
            { x: 12, z: 12, width: 2.5, height: 3.5, depth: 4, steps: 10, rotation: Math.PI }
        ],

        // 高台平台 - 制高点
        platforms: [
            // 中央瞭望台
            { x: 0, z: 0, width: 5, height: 2, depth: 5 },
            // 四角高台
            { x: -22, z: -22, width: 4, height: 1.8, depth: 4 },
            { x: 22, z: -22, width: 4, height: 1.8, depth: 4 },
            { x: -22, z: 22, width: 4, height: 1.8, depth: 4 },
            { x: 22, z: 22, width: 4, height: 1.8, depth: 4 }
        ],

        // 圆柱形掩体 - 油桶、储罐、管道
        cylinders: [
            // 储罐区大型储罐
            { x: 16, z: 14, radius: 2, height: 4 },
            { x: 20, z: 12, radius: 1.5, height: 3.5 },
            { x: 14, z: 18, radius: 1.5, height: 3 },
            // 储罐区油桶群
            { x: 22, z: 16, radius: 0.8, height: 1.5 },
            { x: 23, z: 14, radius: 0.7, height: 1.5 },
            { x: 21, z: 18, radius: 0.8, height: 1.5 },
            // 仓库区管道
            { x: -18, z: -12, radius: 0.5, height: 4 },
            { x: -16, z: -14, radius: 0.5, height: 4 },
            { x: -20, z: -10, radius: 0.6, height: 3.5 },
            // 厂房区烟囱/管道
            { x: 16, z: -14, radius: 0.8, height: 5 },
            { x: 18, z: -12, radius: 0.6, height: 4.5 },
            { x: 20, z: -16, radius: 0.7, height: 4 },
            // 散落油桶 - 中央区域
            { x: 4, z: -4, radius: 0.6, height: 1.2 },
            { x: -4, z: 4, radius: 0.6, height: 1.2 },
            { x: 6, z: 6, radius: 0.5, height: 1.0 },
            { x: -6, z: -6, radius: 0.5, height: 1.0 },
            // 通道油桶
            { x: 0, z: -16, radius: 0.7, height: 1.5 },
            { x: 0, z: 16, radius: 0.7, height: 1.5 },
            { x: -6, z: 0, radius: 0.6, height: 1.2 },
            { x: 6, z: 0, radius: 0.6, height: 1.2 }
        ],

        // L形墙体 - 复杂角落
        lShapes: [
            // 内圈角落掩体
            { x: -8, z: -6, armLength: 4, armWidth: 0.6, height: 2.5, rotation: 0 },
            { x: 8, z: -6, armLength: 4, armWidth: 0.6, height: 2.5, rotation: Math.PI / 2 },
            { x: -8, z: 6, armLength: 4, armWidth: 0.6, height: 2.5, rotation: -Math.PI / 2 },
            { x: 8, z: 6, armLength: 4, armWidth: 0.6, height: 2.5, rotation: Math.PI },
            // 外围转角
            { x: -16, z: 0, armLength: 3, armWidth: 0.5, height: 2, rotation: Math.PI / 4 },
            { x: 16, z: 0, armLength: 3, armWidth: 0.5, height: 2, rotation: -Math.PI / 4 },
            // 二层护栏支撑
            { x: -12, z: -5, armLength: 2.5, armWidth: 0.4, height: 1.5, rotation: 0 },
            { x: -12, z: 5, armLength: 2.5, armWidth: 0.4, height: 1.5, rotation: Math.PI },
            { x: 12, z: -5, armLength: 2.5, armWidth: 0.4, height: 1.5, rotation: Math.PI / 2 },
            { x: 12, z: 5, armLength: 2.5, armWidth: 0.4, height: 1.5, rotation: -Math.PI / 2 }
        ],

        // 木箱掩体
        crates: [
            // 中央区域
            { x: -3, z: -3 }, { x: 3, z: 3 }, { x: -3, z: 3 }, { x: 3, z: -3 },
            // 走廊节点
            { x: -20, z: 0 }, { x: 20, z: 0 }, { x: 0, z: -20 }, { x: 0, z: 20 },
            // 内圈
            { x: -10, z: -10 }, { x: 10, z: -10 }, { x: -10, z: 10 }, { x: 10, z: 10 },
            // 外围
            { x: -18, z: -8 }, { x: 18, z: -8 }, { x: -18, z: 8 }, { x: 18, z: 8 },
            // 二层掩体（放在二层平台上方）
            { x: -12, z: -3 }, { x: -12, z: 3 }, { x: 12, z: -3 }, { x: 12, z: 3 }
        ],

        spawnPoints: {
            blue: [
                { x: -18, z: 24 }, { x: -9, z: 24 }, { x: 0, z: 24 },
                { x: 9, z: 24 }, { x: 18, z: 24 }
            ],
            red: [
                { x: -18, z: -24 }, { x: -9, z: -24 }, { x: 0, z: -24 },
                { x: 9, z: -24 }, { x: 18, z: -24 }
            ]
        },

        patrolPoints: [
            // 中心区域
            { x: 0, z: 0 }, { x: -5, z: 0 }, { x: 5, z: 0 }, { x: 0, z: -5 }, { x: 0, z: 5 },
            // 内圈
            { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
            // 中圈
            { x: -14, z: -14 }, { x: 14, z: -14 }, { x: -14, z: 14 }, { x: 14, z: 14 },
            { x: -14, z: 0 }, { x: 14, z: 0 }, { x: 0, z: -14 }, { x: 0, z: 14 },
            // 外圈
            { x: -20, z: -20 }, { x: 20, z: -20 }, { x: -20, z: 20 }, { x: 20, z: 20 },
            { x: -20, z: 0 }, { x: 20, z: 0 },
            // 房间入口
            { x: -20, z: -14 }, { x: 20, z: -14 }, { x: -20, z: 14 }, { x: 20, z: 14 },
            // 二层巡逻点
            { x: -12, z: -6 }, { x: -12, z: 6 }, { x: 12, z: -6 }, { x: 12, z: 6 }
        ]
    },

    // ============ canyon_maze - 迷宫峡谷 ============
    canyon_maze: {
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
    },

    // ============ train_factory - 火车工厂 ============
    train_factory: {
        id: 'train_factory',
        name: '火车工厂',
        description: '废弃的工业工厂，火车道纵横交错，室内外复杂地形',
        thumbnail: 'assets/maps/factory_thumb.jpg',

        size: 112,  // 迷宫峡谷的2倍
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
        // 工厂是一个大型密闭房间
        factoryBuilding: {
            x: 0, z: 0,
            width: 50, depth: 35, height: 12,
            wallThickness: 1,
            // 门 (四个方向各一个)
            doors: [
                { side: 'north', position: 0.5, width: 4, height: 4 },
                { side: 'south', position: 0.5, width: 4, height: 4 },
                { side: 'east', position: 0.3, width: 3, height: 3.5 },
                { side: 'west', position: 0.3, width: 3, height: 3.5 }
            ],
            // 二层办公室
            secondFloor: {
                y: 6, // 二层高度
                // 办公室区域 (在工厂北侧两角)
                offices: [
                    { x: -18, z: -12, width: 10, depth: 6, height: 5 },
                    { x: 18, z: -12, width: 10, depth: 6, height: 5 }
                ],
                // 连接走廊 (环形走廊，完全连通)
                corridors: [
                    // 北侧走廊 (连接两个办公室)
                    { x: 0, z: -12, width: 26, depth: 4 },
                    // 左侧走廊 (从办公室到楼梯)
                    { x: -18, z: -3, width: 6, depth: 14 },
                    // 右侧走廊 (从办公室到楼梯)
                    { x: 18, z: -3, width: 6, depth: 14 },
                    // 南侧走廊 (连接左右楼梯，在玻璃窗后面)
                    { x: 0, z: 2, width: 30, depth: 4 }
                ],
                // 大玻璃窗 (正中央，面向一层大厅)
                glassWindows: [
                    { x: 0, z: -5, width: 20, height: 3.5 }
                ]
            },
            // 楼梯连接一二层
            stairs: [
                { x: -20, z: 8, rotation: Math.PI },
                { x: 20, z: 8, rotation: Math.PI }
            ]
        },

        // ========== 火车道系统 ==========
        trainTracks: [
            // 北侧火车道 (蓝队侧)
            { z: -42, length: 100 },
            { z: -48, length: 100 },
            // 南侧火车道 (红队侧)
            { z: 42, length: 100 },
            { z: 48, length: 100 }
        ],

        // ========== 火车车厢 ==========
        trains: [
            // 北侧火车1 (有梯子)
            { x: -25, z: -42, length: 12, hasLadder: true },
            { x: -13, z: -42, length: 10, hasLadder: false },
            // 北侧火车2
            { x: 20, z: -48, length: 15, hasLadder: true },
            // 南侧火车1 (有梯子)
            { x: -20, z: 42, length: 14, hasLadder: true },
            // 南侧火车2
            { x: 15, z: 48, length: 12, hasLadder: false },
            { x: 28, z: 48, length: 10, hasLadder: true }
        ],

        // ========== 外部掩体 ==========
        blocks: [
            // 西侧外部建筑
            { type: 'stone', offsetX: -1.8, offsetZ: -0.3, scale: 0.3 },
            { type: 'stone', offsetX: -1.8, offsetZ: 0.3, scale: 0.25 },
            // 东侧外部建筑
            { type: 'stone', offsetX: 1.8, offsetZ: -0.3, scale: 0.3 },
            { type: 'stone', offsetX: 1.8, offsetZ: 0.3, scale: 0.25 },
            // 角落建筑
            { type: 'stone', offsetX: -1.6, offsetZ: -1.5, scale: 0.35 },
            { type: 'stone', offsetX: 1.6, offsetZ: -1.5, scale: 0.35 },
            { type: 'stone', offsetX: -1.6, offsetZ: 1.5, scale: 0.35 },
            { type: 'stone', offsetX: 1.6, offsetZ: 1.5, scale: 0.35 }
        ],

        // 高台平台
        platforms: [
            // 工厂外侧观察台
            { x: -40, z: 0, width: 6, height: 2.5, depth: 10 },
            { x: 40, z: 0, width: 6, height: 2.5, depth: 10 },
            // 火车道旁平台
            { x: 0, z: -36, width: 8, height: 1.5, depth: 4 },
            { x: 0, z: 36, width: 8, height: 1.5, depth: 4 },
            // 角落高台
            { x: -45, z: -45, width: 5, height: 2, depth: 5 },
            { x: 45, z: -45, width: 5, height: 2, depth: 5 },
            { x: -45, z: 45, width: 5, height: 2, depth: 5 },
            { x: 45, z: 45, width: 5, height: 2, depth: 5 }
        ],

        // 圆柱 (油桶、烟囱)
        cylinders: [
            // 工厂外烟囱
            { x: -30, z: -5, radius: 2, height: 15 },
            { x: 30, z: -5, radius: 2, height: 15 },
            // 油桶群
            { x: -35, z: 15, radius: 1, height: 2 },
            { x: -33, z: 17, radius: 0.8, height: 1.8 },
            { x: -37, z: 16, radius: 0.9, height: 1.9 },
            { x: 35, z: 15, radius: 1, height: 2 },
            { x: 33, z: 17, radius: 0.8, height: 1.8 },
            { x: 37, z: 16, radius: 0.9, height: 1.9 },
            // 火车道旁油桶
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
            // 工厂入口掩体
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
    }
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
