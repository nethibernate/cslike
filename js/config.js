// FrostBite Arena - 游戏配置
const CONFIG = {
    // 玩家设置
    player: {
        height: 1.8,
        eyeHeight: 1.6,
        radius: 0.4,
        walkSpeed: 5,
        runSpeed: 8,
        crouchSpeed: 2.5,
        jumpForce: 8,
        gravity: 20,
        maxHealth: 100,
        maxArmor: 100,
        armorAbsorption: 0.5 // 护甲吸收50%伤害
    },

    // 视角设置
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        sensitivity: 0.002,
        minPitch: -Math.PI / 2 + 0.1,
        maxPitch: Math.PI / 2 - 0.1
    },

    // 回合设置
    round: {
        freezeTime: 3,
        roundTime: 90,
        roundEndDelay: 3,
        roundsToWin: 7,
        respawnDelay: 0 // 练习模式立即重生
    },

    // 用户设置（可修改）
    settings: {
        mouseSensitivity: 1.0,
        volume: 0.7,
        showFps: true,
        invertY: false
    },

    // 地图设置
    map: {
        size: 40,
        wallHeight: 4,
        iceColor: 0x88ccee,
        wallColor: 0x4466aa,
        floorColor: 0xaaddff,
        fogColor: 0x1a2a4a,
        fogDensity: 0.02
    },

    // 调试
    debug: false
};

// 保存/加载设置
function saveSettings() {
    localStorage.setItem('frostbite_settings', JSON.stringify(CONFIG.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('frostbite_settings');
    if (saved) {
        try {
            Object.assign(CONFIG.settings, JSON.parse(saved));
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }
}

// 页面加载时读取设置
loadSettings();
