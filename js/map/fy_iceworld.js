// FrostBite Arena - 冰雪世界地图配置
const MAP_FY_ICEWORLD = {
    id: 'fy_iceworld',
    name: '冰雪世界',
    description: '经典的冰雪竞技场，四角冰块布局',
    thumbnail: 'assets/maps/iceworld_thumb.jpg',

    size: 28,
    corridorWidth: 4,
    blockSize: 8,

    colors: {
        sky: 0x88bbee,
        fog: 0x88bbee,
        floor: 0xe8e8e0,
        block: 0xc8c8b0,
        wall: 0xaabbcc,
        crate: 0x8b6914
    },

    blocks: [
        { type: 'ice', offsetX: -1, offsetZ: -1 },
        { type: 'ice', offsetX: 1, offsetZ: -1 },
        { type: 'ice', offsetX: -1, offsetZ: 1 },
        { type: 'ice', offsetX: 1, offsetZ: 1 }
    ],

    crates: [
        { x: -12, z: -12 },
        { x: 12, z: -12 },
        { x: -12, z: 12 },
        { x: 12, z: 12 },
        { x: -12, z: 0 },
        { x: 12, z: 0 }
    ],

    spawnPoints: {
        blue: [
            { x: -8, z: 12 }, { x: -4, z: 12 }, { x: 0, z: 12 },
            { x: 4, z: 12 }, { x: 8, z: 12 }
        ],
        red: [
            { x: -8, z: -12 }, { x: -4, z: -12 }, { x: 0, z: -12 },
            { x: 4, z: -12 }, { x: 8, z: -12 }
        ]
    },

    patrolPoints: [
        { x: 0, z: 0 }, { x: -5, z: 0 }, { x: 5, z: 0 },
        { x: 0, z: -5 }, { x: 0, z: 5 },
        { x: -10, z: 0 }, { x: 10, z: 0 },
        { x: 0, z: -10 }, { x: 0, z: 10 },
        { x: -10, z: -10 }, { x: 10, z: -10 },
        { x: -10, z: 10 }, { x: 10, z: 10 },
        { x: -6, z: -6 }, { x: 6, z: -6 },
        { x: -6, z: 6 }, { x: 6, z: 6 }
    ]
};
