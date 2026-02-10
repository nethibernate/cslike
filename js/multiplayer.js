// FrostBite Arena - 多人游戏客户端
class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.playerName = '';
        this.currentRoom = null;
        this.isHost = false;
        this.team = 'blue';

        // 回调函数
        this.onRoomListUpdate = null;
        this.onRoomUpdate = null;
        this.onPlayerJoin = null;
        this.onPlayerLeave = null;
        this.onGameStart = null;
        this.onRemotePlayerState = null;
        this.onRemotePlayerShoot = null;
        this.onPlayerDamaged = null;
        this.onPlayerKilled = null;
        this.onRemotePlayerRespawn = null;
    }

    // 连接服务器
    connect(serverUrl = null) {
        return new Promise((resolve, reject) => {
            try {
                // 如果没有指定服务器，使用当前页面的服务器
                const url = serverUrl || window.location.origin;
                this.socket = io(url);

                this.socket.on('connect', () => {
                    console.log('连接到服务器');
                    this.connected = true;
                    this.playerId = this.socket.id;
                    resolve(true);
                });

                this.socket.on('disconnect', () => {
                    console.log('与服务器断开连接');
                    this.connected = false;
                    this.currentRoom = null;
                });

                this.socket.on('connect_error', (error) => {
                    console.error('连接失败:', error);
                    reject(error);
                });

                // 设置事件监听
                this.setupEventListeners();

            } catch (error) {
                reject(error);
            }
        });
    }

    setupEventListeners() {
        // 房间列表更新
        this.socket.on('roomListUpdated', () => {
            if (this.onRoomListUpdate) {
                this.getRooms().then(rooms => this.onRoomListUpdate(rooms));
            }
        });

        // 玩家加入
        this.socket.on('playerJoined', (data) => {
            this.currentRoom = data.room;
            if (this.onPlayerJoin) this.onPlayerJoin(data.player, data.room);
        });

        // 玩家离开
        this.socket.on('playerLeft', (data) => {
            if (data.room) this.currentRoom = data.room;
            if (this.onPlayerLeave) this.onPlayerLeave(data.playerId, data.room);
        });

        // 房间更新
        this.socket.on('roomUpdated', (room) => {
            this.currentRoom = room;
            if (this.onRoomUpdate) this.onRoomUpdate(room);
        });

        // 房主变更
        this.socket.on('hostChanged', (data) => {
            this.isHost = data.newHostId === this.playerId;
            if (this.currentRoom) {
                this.currentRoom.hostId = data.newHostId;
            }
        });

        // 游戏开始
        this.socket.on('gameStarted', (data) => {
            this.currentRoom = data.room;
            if (this.onGameStart) this.onGameStart(data.room);
        });

        // 远程玩家状态
        this.socket.on('remotePlayerState', (data) => {
            if (this.onRemotePlayerState) this.onRemotePlayerState(data);
        });

        // 远程玩家射击
        this.socket.on('remotePlayerShoot', (data) => {
            if (this.onRemotePlayerShoot) this.onRemotePlayerShoot(data);
        });

        // 玩家受伤
        this.socket.on('playerDamaged', (data) => {
            if (this.onPlayerDamaged) this.onPlayerDamaged(data);
        });

        // 玩家死亡
        this.socket.on('playerKilled', (data) => {
            if (this.onPlayerKilled) this.onPlayerKilled(data);
        });

        // 远程玩家复活
        this.socket.on('remotePlayerRespawn', (data) => {
            if (this.onRemotePlayerRespawn) this.onRemotePlayerRespawn(data);
        });
    }

    // 设置玩家名称
    setName(name) {
        return new Promise((resolve, reject) => {
            this.socket.emit('setName', name, (response) => {
                if (response.success) {
                    this.playerName = name;
                    this.playerId = response.playerId;
                    resolve(response);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    // 获取房间列表
    getRooms() {
        return new Promise((resolve) => {
            this.socket.emit('getRooms', (rooms) => {
                resolve(rooms);
            });
        });
    }

    // 创建房间
    createRoom(roomName) {
        return new Promise((resolve, reject) => {
            this.socket.emit('createRoom', roomName, (response) => {
                if (response.success) {
                    this.currentRoom = response.room;
                    this.isHost = true;
                    this.team = 'blue';
                    resolve(response.room);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    // 加入房间
    joinRoom(roomId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('joinRoom', roomId, (response) => {
                if (response.success) {
                    this.currentRoom = response.room;
                    this.isHost = false;
                    // 找到自己的队伍
                    if (response.room.teams.blue.players.some(p => p.id === this.playerId)) {
                        this.team = 'blue';
                    } else {
                        this.team = 'red';
                    }
                    resolve(response.room);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    // 切换队伍
    changeTeam(team) {
        return new Promise((resolve, reject) => {
            this.socket.emit('changeTeam', team, (response) => {
                if (response.success) {
                    this.team = team;
                    this.currentRoom = response.room;
                    resolve(response.room);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    // 开始游戏
    startGame() {
        return new Promise((resolve, reject) => {
            this.socket.emit('startGame', (response) => {
                if (response.success) {
                    resolve(true);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    // 离开房间
    leaveRoom() {
        return new Promise((resolve) => {
            this.socket.emit('leaveRoom', (response) => {
                this.currentRoom = null;
                this.isHost = false;
                resolve(response.success);
            });
        });
    }

    // 发送玩家状态
    sendPlayerState(state) {
        if (this.socket && this.connected) {
            this.socket.emit('playerState', state);
        }
    }

    // 发送射击事件
    sendShoot(data) {
        if (this.socket && this.connected) {
            this.socket.emit('playerShoot', data);
        }
    }

    // 发送击中事件
    sendHit(targetId, damage, isHeadshot) {
        if (this.socket && this.connected) {
            this.socket.emit('playerHit', { targetId, damage, isHeadshot });
        }
    }

    // 发送死亡事件
    sendDeath(killerId, killerName) {
        if (this.socket && this.connected) {
            this.socket.emit('playerDeath', { killerId, killerName });
        }
    }

    // 发送复活事件
    sendRespawn(position) {
        if (this.socket && this.connected) {
            this.socket.emit('playerRespawn', { position });
        }
    }

    // 断开连接
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }
}

// 全局实例
const multiplayerManager = new MultiplayerManager();
