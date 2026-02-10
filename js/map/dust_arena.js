// FrostBite Arena - 沙漠竞技场地图配置
const MAP_DUST_ARENA = {
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

    blocks: [
        { type: 'stone', offsetX: -1.2, offsetZ: -0.8 },
        { type: 'stone', offsetX: 1.2, offsetZ: -0.8 },
        { type: 'stone', offsetX: -1.2, offsetZ: 0.8 },
        { type: 'stone', offsetX: 1.2, offsetZ: 0.8 },
        { type: 'stone', offsetX: 0, offsetZ: 0, scale: 0.5 }
    ],

    crates: [
        { x: -14, z: -14 }, { x: 14, z: -14 },
        { x: -14, z: 14 }, { x: 14, z: 14 },
        { x: 0, z: -10 }, { x: 0, z: 10 },
        { x: -7, z: 0 }, { x: 7, z: 0 }
    ],

    spawnPoints: {
        blue: [
            { x: -10, z: 14 }, { x: -5, z: 14 }, { x: 0, z: 14 },
            { x: 5, z: 14 }, { x: 10, z: 14 }
        ],
        red: [
            { x: -10, z: -14 }, { x: -5, z: -14 }, { x: 0, z: -14 },
            { x: 5, z: -14 }, { x: 10, z: -14 }
        ]
    },

    patrolPoints: [
        { x: 0, z: 0 }, { x: -8, z: 0 }, { x: 8, z: 0 },
        { x: 0, z: -8 }, { x: 0, z: 8 },
        { x: -12, z: -8 }, { x: 12, z: -8 },
        { x: -12, z: 8 }, { x: 12, z: 8 },
        { x: -6, z: -10 }, { x: 6, z: -10 },
        { x: -6, z: 10 }, { x: 6, z: 10 }
    ]
};
