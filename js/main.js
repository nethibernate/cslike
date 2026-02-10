// FrostBite Arena - 主入口
let game = null;
let selectedMapId = null; // 选择的地图
let gameMode = 'single'; // 'single', 'practice', 'multiplayer'
let blueBotCount = 5;
let redBotCount = 5;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeMapSelection();
});

function initializeMenu() {
    // 单人模式按钮 - 先选地图
    document.getElementById('btn-play').addEventListener('click', () => {
        gameMode = 'single';
        showMapSelectScreen();
    });

    // 练习模式按钮 - 先选地图
    document.getElementById('btn-practice').addEventListener('click', () => {
        gameMode = 'practice';
        showMapSelectScreen();
    });

    // 多人对战按钮
    document.getElementById('btn-multiplayer').addEventListener('click', () => {
        showScreen('name-input-screen');
    });

    // 设置按钮
    document.getElementById('btn-settings').addEventListener('click', () => {
        showScreen('settings-menu');
    });

    // 返回按钮
    document.getElementById('btn-back').addEventListener('click', () => {
        showScreen('main-menu');
        saveSettings();
    });

    // 地图选择返回
    document.getElementById('btn-back-from-map').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // 设置控件
    initializeSettings();

    // 初始化多人模式
    initializeMultiplayer();

    // 暂停菜单
    document.getElementById('btn-resume').addEventListener('click', () => {
        if (game) game.resume();
    });

    document.getElementById('btn-quit').addEventListener('click', () => {
        if (game) game.quit();
    });

    // 点击开始提示
    document.getElementById('click-to-start').addEventListener('click', () => {
        document.getElementById('click-to-start').classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
        audioManager.resume();
    });
}

// 初始化地图选择
function initializeMapSelection() {
    const mapListEl = document.getElementById('map-list');
    const maps = getMapList();

    // 生成左侧地图列表 (小缩略图 + 名称 + 尺寸标签)
    mapListEl.innerHTML = maps.map(map => {
        const sizeLabel = map.size >= 80 ? '超大' : map.size >= 50 ? '大' : map.size >= 30 ? '中' : '小';
        return `
            <div class="map-card" data-map-id="${map.id}">
                <div class="map-thumb-mini ${map.id}">🗺️</div>
                <div class="map-card-info">
                    <h4>${map.name}</h4>
                    <span class="map-card-size">${sizeLabel}地图 · ${map.size}×${map.size}</span>
                </div>
            </div>
        `;
    }).join('');

    // 点击地图卡片 -> 选中 + 更新预览
    mapListEl.querySelectorAll('.map-card').forEach(card => {
        card.addEventListener('click', () => {
            // 高亮选中
            mapListEl.querySelectorAll('.map-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            selectedMapId = card.dataset.mapId;
            const mapData = maps.find(m => m.id === selectedMapId);
            updateMapPreview(mapData);

            // 启用开始按钮
            document.getElementById('btn-start-map').disabled = false;
        });
    });

    // 开始游戏按钮
    document.getElementById('btn-start-map').addEventListener('click', () => {
        if (!selectedMapId) return;

        // 读取机器人数量
        blueBotCount = parseInt(document.getElementById('blue-bot-input').value) || 0;
        redBotCount = parseInt(document.getElementById('red-bot-input').value) || 0;

        if (gameMode === 'multiplayer') {
            showScreen('room-list-screen');
        } else {
            startGame(gameMode === 'practice');
        }
    });

    // 初始化 ± 按钮
    initializeBotCountControls();
}

// 更新地图预览面板（3D预览）
function updateMapPreview(mapData) {
    const previewEl = document.getElementById('map-preview');
    const sizeLabel = mapData.size >= 80 ? '超大' : mapData.size >= 50 ? '大' : mapData.size >= 30 ? '中' : '小';

    // 构建预览容器（3D canvas + 信息面板）
    previewEl.innerHTML = `
        <div class="map-preview-content">
            <div id="map-preview-canvas" class="map-preview-canvas"></div>
            <div class="map-preview-info">
                <h3>${mapData.name}</h3>
                <p>${mapData.description}</p>
                <div class="map-meta">
                    <span>📐 ${sizeLabel}地图 (${mapData.size}×${mapData.size})</span>
                </div>
            </div>
        </div>
    `;

    // 初始化或重用3D预览渲染器
    const canvasContainer = document.getElementById('map-preview-canvas');

    if (!mapPreviewRenderer) {
        mapPreviewRenderer = new MapPreviewRenderer();
        mapPreviewRenderer.init(canvasContainer);

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            if (mapPreviewRenderer) mapPreviewRenderer.resize();
        });
    } else {
        // 重新绑定到新容器
        if (mapPreviewRenderer.canvas && canvasContainer) {
            canvasContainer.appendChild(mapPreviewRenderer.canvas);
            mapPreviewRenderer.container = canvasContainer;
            mapPreviewRenderer.resize();
        }
    }

    // 加载地图3D预览
    mapPreviewRenderer.loadMap(mapData.id);
}

// 初始化机器人数量 ± 按钮
function initializeBotCountControls() {
    document.querySelectorAll('.bot-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const team = btn.dataset.team;
            const dir = parseInt(btn.dataset.dir);
            const inputId = team === 'blue' ? 'blue-bot-input' : 'red-bot-input';
            const input = document.getElementById(inputId);
            let val = parseInt(input.value) || 0;
            val = Math.max(0, Math.min(20, val + dir));
            input.value = val;
        });
    });

    // 限制手动输入范围
    ['blue-bot-input', 'red-bot-input'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 0;
            val = Math.max(0, Math.min(20, val));
            e.target.value = val;
        });
    });
}

// 显示地图选择界面
function showMapSelectScreen() {
    showScreen('map-select-screen');
}

// 显示指定屏幕
function showScreen(screenId) {
    const screens = [
        'main-menu', 'settings-menu', 'name-input-screen',
        'room-list-screen', 'create-room-screen', 'room-lobby-screen',
        'map-select-screen'
    ];
    screens.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// 初始化多人模式
function initializeMultiplayer() {
    // 名称输入界面
    document.getElementById('btn-confirm-name').addEventListener('click', async () => {
        const nameInput = document.getElementById('player-name-input');
        const name = nameInput.value.trim() || '玩家';

        try {
            await multiplayerManager.connect();
            await multiplayerManager.setName(name);
            document.getElementById('display-player-name').textContent = name;
            showScreen('room-list-screen');
            refreshRoomList();
        } catch (error) {
            alert('连接服务器失败: ' + error.message);
        }
    });

    document.getElementById('btn-back-from-name').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // 房间列表界面
    document.getElementById('btn-create-room').addEventListener('click', () => {
        showScreen('create-room-screen');
    });

    document.getElementById('btn-refresh-rooms').addEventListener('click', () => {
        refreshRoomList();
    });

    document.getElementById('btn-back-from-rooms').addEventListener('click', () => {
        multiplayerManager.disconnect();
        showScreen('main-menu');
    });

    // 创建房间界面
    document.getElementById('btn-confirm-create').addEventListener('click', async () => {
        const roomName = document.getElementById('room-name-input').value.trim() ||
            `${multiplayerManager.playerName}的房间`;

        try {
            const room = await multiplayerManager.createRoom(roomName);
            showScreen('room-lobby-screen');
            updateRoomLobby(room);
        } catch (error) {
            alert('创建房间失败: ' + error);
        }
    });

    document.getElementById('btn-back-from-create').addEventListener('click', () => {
        showScreen('room-list-screen');
    });

    // 房间大厅
    document.getElementById('btn-join-blue').addEventListener('click', async () => {
        try {
            const room = await multiplayerManager.changeTeam('blue');
            updateRoomLobby(room);
        } catch (e) { }
    });

    document.getElementById('btn-join-red').addEventListener('click', async () => {
        try {
            const room = await multiplayerManager.changeTeam('red');
            updateRoomLobby(room);
        } catch (e) { }
    });

    document.getElementById('btn-start-game').addEventListener('click', async () => {
        try {
            await multiplayerManager.startGame();
        } catch (error) {
            alert('开始游戏失败: ' + error);
        }
    });

    document.getElementById('btn-leave-room').addEventListener('click', async () => {
        await multiplayerManager.leaveRoom();
        showScreen('room-list-screen');
        refreshRoomList();
    });

    // 设置多人回调
    multiplayerManager.onRoomListUpdate = (rooms) => {
        renderRoomList(rooms);
    };

    multiplayerManager.onPlayerJoin = (player, room) => {
        updateRoomLobby(room);
    };

    multiplayerManager.onPlayerLeave = (playerId, room) => {
        if (room) updateRoomLobby(room);
    };

    multiplayerManager.onRoomUpdate = (room) => {
        updateRoomLobby(room);
    };

    multiplayerManager.onGameStart = async (room) => {
        await startMultiplayerGame(room);
    };
}

// 刷新房间列表
async function refreshRoomList() {
    const rooms = await multiplayerManager.getRooms();
    renderRoomList(rooms);
}

// 渲染房间列表
function renderRoomList(rooms) {
    const listEl = document.getElementById('room-list');

    if (!rooms || rooms.length === 0) {
        listEl.innerHTML = '<div class="room-list-empty">暂无房间，创建一个吧！</div>';
        return;
    }

    listEl.innerHTML = rooms.map(room => {
        const isPlaying = room.status === 'playing';
        const statusText = isPlaying ? '游戏中' : '等待中';
        const statusClass = isPlaying ? 'status-playing' : 'status-waiting';

        return `
        <div class="room-item ${isPlaying ? 'room-playing' : ''}" data-room-id="${room.id}" data-status="${room.status}">
            <span class="room-name">${escapeHtml(room.name)}</span>
            <div class="room-info">
                <span class="player-count">${room.playerCount}/2 玩家</span>
                <span class="room-status ${statusClass}">${statusText}</span>
            </div>
        </div>
    `}).join('');

    // 添加点击事件，只允许加入等待中的房间
    listEl.querySelectorAll('.room-item').forEach(item => {
        item.addEventListener('click', async () => {
            const roomId = item.dataset.roomId;
            const status = item.dataset.status;

            if (status === 'playing') {
                alert('该房间正在游戏中，无法加入');
                return;
            }

            try {
                const room = await multiplayerManager.joinRoom(roomId);
                showScreen('room-lobby-screen');
                updateRoomLobby(room);
            } catch (error) {
                alert('加入房间失败: ' + error);
            }
        });
    });
}

// 更新房间大厅
function updateRoomLobby(room) {
    document.getElementById('room-lobby-title').textContent = room.name;

    // 蓝队玩家
    const bluePlayersEl = document.getElementById('blue-team-players');
    bluePlayersEl.innerHTML = room.teams.blue.players.map(p =>
        `<div class="team-player ${p.id === multiplayerManager.playerId ? 'self' : ''}">${escapeHtml(p.name)}</div>`
    ).join('') || '<div class="team-player" style="opacity: 0.5;">等待玩家...</div>';

    // 红队玩家
    const redPlayersEl = document.getElementById('red-team-players');
    redPlayersEl.innerHTML = room.teams.red.players.map(p =>
        `<div class="team-player ${p.id === multiplayerManager.playerId ? 'self' : ''}">${escapeHtml(p.name)}</div>`
    ).join('') || '<div class="team-player" style="opacity: 0.5;">等待玩家...</div>';

    // 机器人数量
    document.getElementById('blue-bot-count').textContent = room.teams.blue.bots;
    document.getElementById('red-bot-count').textContent = room.teams.red.bots;

    // 开始按钮 (仅房主可见)
    const startBtn = document.getElementById('btn-start-game');
    const waitingMsg = document.getElementById('waiting-message');

    if (multiplayerManager.isHost) {
        startBtn.classList.remove('hidden');
        waitingMsg.textContent = '你是房主，可以开始游戏';
    } else {
        startBtn.classList.add('hidden');
        waitingMsg.textContent = '等待房主开始游戏...';
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 开始多人游戏
async function startMultiplayerGame(room) {
    game = new Game();

    try {
        // 设置地图（多人模式暫用默认地图）
        game.mapId = selectedMapId;

        // 先设置队伍，再初始化（影响出生点）
        game.playerTeam = multiplayerManager.team;
        game.playerName = multiplayerManager.playerName;

        await game.init();
        game.isMultiplayer = true;
        game.multiplayerRoom = room;

        // 确保玩家在正确的出生点（根据选择的队伍）
        game.player.team = game.playerTeam;
        game.player.respawn(game.map.getRandomSpawnPoint(game.playerTeam));

        game.start();
        game.spawnMultiplayerBots(room);

        // 设置同步回调
        setupMultiplayerSync();

        game.hud.showCenterMessage('多人对战开始!', 2000);
    } catch (error) {
        console.error('多人游戏启动失败:', error);
        alert('多人游戏启动失败: ' + error.message);
    }
}

// 设置多人同步
function setupMultiplayerSync() {
    // 每帧发送玩家状态
    game.onUpdate = () => {
        if (game.player && game.player.isAlive) {
            multiplayerManager.sendPlayerState({
                position: {
                    x: game.player.position.x,
                    y: game.player.position.y,
                    z: game.player.position.z
                },
                rotation: {
                    yaw: game.player.rotation.yaw,
                    pitch: game.player.rotation.pitch
                },
                health: game.player.health,
                isAlive: game.player.isAlive,
                isCrouching: game.player.input.crouch
            });
        }
    };

    // 接收远程玩家状态
    multiplayerManager.onRemotePlayerState = (data) => {
        game.updateRemotePlayer(data);
    };

    // 接收远程玩家射击
    multiplayerManager.onRemotePlayerShoot = (data) => {
        game.handleRemoteShoot(data);
    };

    // 玩家死亡处理
    multiplayerManager.onPlayerKilled = (data) => {
        game.handleRemoteKill(data);
    };

    // 玩家复活
    multiplayerManager.onRemotePlayerRespawn = (data) => {
        game.handleRemoteRespawn(data);
    };
}

function initializeSettings() {
    // 灵敏度
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivity-value');
    sensitivitySlider.value = CONFIG.settings.mouseSensitivity;
    sensitivityValue.textContent = CONFIG.settings.mouseSensitivity.toFixed(1);

    sensitivitySlider.addEventListener('input', (e) => {
        CONFIG.settings.mouseSensitivity = parseFloat(e.target.value);
        sensitivityValue.textContent = CONFIG.settings.mouseSensitivity.toFixed(1);
    });

    // 音量
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volume-value');
    volumeSlider.value = CONFIG.settings.volume;
    volumeValue.textContent = Math.round(CONFIG.settings.volume * 100) + '%';

    volumeSlider.addEventListener('input', (e) => {
        CONFIG.settings.volume = parseFloat(e.target.value);
        volumeValue.textContent = Math.round(CONFIG.settings.volume * 100) + '%';
        audioManager.setVolume(CONFIG.settings.volume);
    });

    // FPS显示
    const showFpsCheckbox = document.getElementById('show-fps');
    showFpsCheckbox.checked = CONFIG.settings.showFps;

    showFpsCheckbox.addEventListener('change', (e) => {
        CONFIG.settings.showFps = e.target.checked;
    });
}

function saveSettings() {
    // 可以存储到localStorage
}

async function startGame(practiceMode) {
    // 清理3D预览渲染器
    if (mapPreviewRenderer) {
        mapPreviewRenderer.destroy();
        mapPreviewRenderer = null;
    }

    game = new Game();

    // 设置选择的地图
    game.mapId = selectedMapId || 'fy_iceworld';

    try {
        await game.init();

        if (practiceMode) {
            game.startPracticeMode(blueBotCount, redBotCount);
        } else {
            game.start();
            game.spawnBots(blueBotCount, redBotCount);
        }
    } catch (error) {
        console.error('Failed to start game:', error);
        alert('游戏启动失败: ' + error.message);
    }
}

// 防止右键菜单
document.addEventListener('contextmenu', (e) => {
    if (game && game.isRunning) {
        e.preventDefault();
    }
});

// 防止按键默认行为
document.addEventListener('keydown', (e) => {
    if (game && game.isRunning) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    }
});
