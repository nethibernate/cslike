// FrostBite Arena - 工业废墟地图配置
const MAP_INDUSTRIAL_RUINS = {
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
};
