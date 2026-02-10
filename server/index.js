// FrostBite Arena - 多人对战服务器
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 提供静态文件
app.use(express.static(path.join(__dirname, '..')));

// 房间存储
const rooms = new Map();
// 玩家存储
const players = new Map();

// 房间类
class GameRoom {
    constructor(id, name, hostId, hostName) {
        this.id = id;
        this.name = name;
        this.hostId = hostId;
        this.players = new Map();
        this.status = 'waiting'; // waiting, playing
        this.teams = {
            blue: { players: [], bots: 4 },
            red: { players: [], bots: 4 }
        };
        this.createdAt = Date.now();

        // 添加房主
        this.addPlayer(hostId, hostName, 'blue');
    }

    addPlayer(playerId, playerName, team) {
        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            team: team,
            ready: false
        });
        this.teams[team].players.push(playerId);
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            const teamPlayers = this.teams[player.team].players;
            const index = teamPlayers.indexOf(playerId);
            if (index > -1) {
                teamPlayers.splice(index, 1);
            }
            this.players.delete(playerId);
        }
    }

    changeTeam(playerId, newTeam) {
        const player = this.players.get(playerId);
        if (!player) return false;

        const oldTeam = player.team;
        if (oldTeam === newTeam) return false;

        // 从旧队伍移除
        const oldTeamPlayers = this.teams[oldTeam].players;
        const index = oldTeamPlayers.indexOf(playerId);
        if (index > -1) {
            oldTeamPlayers.splice(index, 1);
        }

        // 添加到新队伍
        this.teams[newTeam].players.push(playerId);
        player.team = newTeam;

        return true;
    }

    getPlayerCount() {
        return this.players.size;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            hostId: this.hostId,
            playerCount: this.getPlayerCount(),
            status: this.status,
            teams: {
                blue: {
                    players: this.teams.blue.players.map(id => {
                        const p = this.players.get(id);
                        return p ? { id: p.id, name: p.name } : null;
                    }).filter(p => p),
                    bots: this.teams.blue.bots
                },
                red: {
                    players: this.teams.red.players.map(id => {
                        const p = this.players.get(id);
                        return p ? { id: p.id, name: p.name } : null;
                    }).filter(p => p),
                    bots: this.teams.red.bots
                }
            }
        };
    }
}

// Socket.IO 连接处理
io.on('connection', (socket) => {
    console.log(`玩家连接: ${socket.id}`);

    let currentPlayer = null;
    let currentRoom = null;

    // 设置玩家名称
    socket.on('setName', (name, callback) => {
        currentPlayer = {
            id: socket.id,
            name: name.substring(0, 20) || '玩家',
            roomId: null
        };
        players.set(socket.id, currentPlayer);
        callback({ success: true, playerId: socket.id });
        console.log(`玩家 ${name} 已注册`);
    });

    // 获取房间列表
    socket.on('getRooms', (callback) => {
        const roomList = [];
        for (const [id, room] of rooms) {
            // 显示所有房间，包括正在游戏中的
            roomList.push(room.toJSON());
        }
        callback(roomList);
    });

    // 创建房间
    socket.on('createRoom', (roomName, callback) => {
        if (!currentPlayer) {
            callback({ success: false, error: '请先设置名称' });
            return;
        }

        const roomId = uuidv4().substring(0, 8);
        const room = new GameRoom(roomId, roomName || `${currentPlayer.name}的房间`, socket.id, currentPlayer.name);
        rooms.set(roomId, room);

        currentRoom = room;
        currentPlayer.roomId = roomId;
        socket.join(roomId);

        callback({ success: true, room: room.toJSON() });
        console.log(`房间创建: ${roomId} - ${roomName}`);

        // 广播房间列表更新
        io.emit('roomListUpdated');
    });

    // 加入房间
    socket.on('joinRoom', (roomId, callback) => {
        if (!currentPlayer) {
            callback({ success: false, error: '请先设置名称' });
            return;
        }

        const room = rooms.get(roomId);
        if (!room) {
            callback({ success: false, error: '房间不存在' });
            return;
        }

        if (room.status !== 'waiting') {
            callback({ success: false, error: '游戏已开始' });
            return;
        }

        if (room.getPlayerCount() >= 2) {
            callback({ success: false, error: '房间已满' });
            return;
        }

        // 自动分配到人少的队伍
        const team = room.teams.blue.players.length <= room.teams.red.players.length ? 'blue' : 'red';
        room.addPlayer(socket.id, currentPlayer.name, team);

        currentRoom = room;
        currentPlayer.roomId = roomId;
        socket.join(roomId);

        callback({ success: true, room: room.toJSON() });

        // 通知房间内其他玩家
        socket.to(roomId).emit('playerJoined', {
            player: { id: socket.id, name: currentPlayer.name, team: team },
            room: room.toJSON()
        });

        io.emit('roomListUpdated');
        console.log(`${currentPlayer.name} 加入房间 ${roomId}`);
    });

    // 切换队伍
    socket.on('changeTeam', (team, callback) => {
        if (!currentRoom) {
            callback({ success: false, error: '未在房间中' });
            return;
        }

        if (currentRoom.changeTeam(socket.id, team)) {
            callback({ success: true, room: currentRoom.toJSON() });
            io.to(currentRoom.id).emit('roomUpdated', currentRoom.toJSON());
        } else {
            callback({ success: false, error: '无法切换队伍' });
        }
    });

    // 开始游戏
    socket.on('startGame', (callback) => {
        if (!currentRoom) {
            callback({ success: false, error: '未在房间中' });
            return;
        }

        if (currentRoom.hostId !== socket.id) {
            callback({ success: false, error: '只有房主可以开始游戏' });
            return;
        }

        currentRoom.status = 'playing';
        callback({ success: true });

        io.to(currentRoom.id).emit('gameStarted', {
            room: currentRoom.toJSON()
        });

        io.emit('roomListUpdated');
        console.log(`游戏开始: ${currentRoom.id}`);
    });

    // 离开房间
    socket.on('leaveRoom', (callback) => {
        if (currentRoom) {
            leaveRoom();
            callback({ success: true });
        } else {
            callback({ success: false });
        }
    });

    // 玩家状态同步 (位置、朝向)
    socket.on('playerState', (state) => {
        if (currentRoom && currentRoom.status === 'playing') {
            // 获取玩家的队伍信息
            const playerInfo = currentRoom.players.get(socket.id);
            const playerTeam = playerInfo ? playerInfo.team : 'blue';

            socket.to(currentRoom.id).emit('remotePlayerState', {
                playerId: socket.id,
                playerName: currentPlayer?.name,
                team: playerTeam,
                ...state
            });
        }
    });

    // 射击事件
    socket.on('playerShoot', (data) => {
        if (currentRoom && currentRoom.status === 'playing') {
            socket.to(currentRoom.id).emit('remotePlayerShoot', {
                playerId: socket.id,
                ...data
            });
        }
    });

    // 玩家被击中
    socket.on('playerHit', (data) => {
        if (currentRoom && currentRoom.status === 'playing') {
            io.to(currentRoom.id).emit('playerDamaged', {
                targetId: data.targetId,
                damage: data.damage,
                attackerId: socket.id,
                isHeadshot: data.isHeadshot
            });
        }
    });

    // 玩家死亡
    socket.on('playerDeath', (data) => {
        if (currentRoom && currentRoom.status === 'playing') {
            io.to(currentRoom.id).emit('playerKilled', {
                victimId: socket.id,
                victimName: currentPlayer?.name,
                killerId: data.killerId,
                killerName: data.killerName
            });
        }
    });

    // 玩家复活
    socket.on('playerRespawn', (data) => {
        if (currentRoom && currentRoom.status === 'playing') {
            socket.to(currentRoom.id).emit('remotePlayerRespawn', {
                playerId: socket.id,
                position: data.position
            });
        }
    });

    // 离开房间函数
    function leaveRoom() {
        if (!currentRoom) return;

        const roomId = currentRoom.id;
        const wasHost = currentRoom.hostId === socket.id;

        currentRoom.removePlayer(socket.id);
        socket.leave(roomId);

        if (currentRoom.getPlayerCount() === 0) {
            // 房间空了，删除
            rooms.delete(roomId);
            console.log(`房间删除: ${roomId}`);
        } else if (wasHost) {
            // 转移房主
            const newHostId = currentRoom.players.keys().next().value;
            currentRoom.hostId = newHostId;
            io.to(roomId).emit('hostChanged', { newHostId });
        }

        socket.to(roomId).emit('playerLeft', {
            playerId: socket.id,
            room: currentRoom.getPlayerCount() > 0 ? currentRoom.toJSON() : null
        });

        if (currentPlayer) {
            currentPlayer.roomId = null;
        }
        currentRoom = null;

        io.emit('roomListUpdated');
    }

    // 断开连接
    socket.on('disconnect', () => {
        console.log(`玩家断开: ${socket.id}`);
        leaveRoom();
        players.delete(socket.id);
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`FrostBite Arena 服务器运行在端口 ${PORT}`);
    console.log(`打开 http://localhost:${PORT} 开始游戏`);
});
