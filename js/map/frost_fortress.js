// FrostBite Arena - 冰霜堡垒地图配置
const MAP_FROST_FORTRESS = {
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

    blocks: [
        { type: 'ice', offsetX: 0, offsetZ: 0, scale: 0.6 },
        { type: 'ice', offsetX: -1.3, offsetZ: -1.3, scale: 0.8 },
        { type: 'ice', offsetX: 1.3, offsetZ: -1.3, scale: 0.8 },
        { type: 'ice', offsetX: -1.3, offsetZ: 1.3, scale: 0.8 },
        { type: 'ice', offsetX: 1.3, offsetZ: 1.3, scale: 0.8 },
        { type: 'ice', offsetX: -1.5, offsetZ: 0, scale: 0.4 },
        { type: 'ice', offsetX: 1.5, offsetZ: 0, scale: 0.4 }
    ],

    crates: [
        { x: -13, z: 0 }, { x: 13, z: 0 },
        { x: 0, z: -13 }, { x: 0, z: 13 },
        { x: -8, z: -8 }, { x: 8, z: -8 },
        { x: -8, z: 8 }, { x: 8, z: 8 }
    ],

    spawnPoints: {
        blue: [
            { x: -10, z: 13 }, { x: -5, z: 13 }, { x: 0, z: 13 },
            { x: 5, z: 13 }, { x: 10, z: 13 }
        ],
        red: [
            { x: -10, z: -13 }, { x: -5, z: -13 }, { x: 0, z: -13 },
            { x: 5, z: -13 }, { x: 10, z: -13 }
        ]
    },

    patrolPoints: [
        { x: 0, z: 0 }, { x: -6, z: 0 }, { x: 6, z: 0 },
        { x: 0, z: -6 }, { x: 0, z: 6 },
        { x: -10, z: -5 }, { x: 10, z: -5 },
        { x: -10, z: 5 }, { x: 10, z: 5 },
        { x: -4, z: -8 }, { x: 4, z: -8 },
        { x: -4, z: 8 }, { x: 4, z: 8 }
    ]
};
