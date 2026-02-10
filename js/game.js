// FrostBite Arena - 游戏主逻辑
class Game {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.player = null;
        this.map = null;
        this.hud = null;
        this.enemies = [];
        this.allies = [];
        this.bulletTracers = []; // 子弹弹道数组

        this.isRunning = false;
        this.isPaused = false;
        this.isPointerLocked = false;

        // 时间
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fpsCounter = 0;
        this.fpsTime = 0;
        this.currentFps = 60;

        // 回合
        this.roundTime = CONFIG.round.roundTime;
        this.scores = { blue: 0, red: 0 };
        this.roundPhase = 'active';

        // 统计
        this.kills = 0;
        this.deaths = 0;

        // 死亡相机系统
        this.deathCam = {
            active: false,
            killer: null,
            camera: null,
            respawnTime: 0,
            deathHandled: false
        };

        // 多人模式
        this.isMultiplayer = false;
        this.multiplayerRoom = null;
        this.playerTeam = 'blue';
        this.playerName = '';
        this.remotePlayers = new Map();
        this.onUpdate = null;

        // 地图
        this.mapId = 'fy_iceworld';
    }

    async init() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        await audioManager.init();

        // 创建地图 (使用选择的地图ID)
        this.map = new GameMap(this.scene, this.mapId);

        // 创建玩家
        this.player = new Player(this.scene);        // 玩家根据队伍选择出生点（多人模式下会在start后重新设置）
        const spawnTeam = this.playerTeam || 'blue';
        this.player.team = spawnTeam;
        this.player.respawn(this.map.getRandomSpawnPoint(spawnTeam));

        // 死亡观察相机
        this.deathCam.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );

        this.hud = new HUD();
        this.buyMenu = null; // 初始化在start中创建

        // 第一人称武器视图
        this.weaponViewModel = new WeaponViewModel();

        this.setupInput();
        window.addEventListener('resize', () => this.onResize());
    }

    setupInput() {
        const canvas = document.getElementById('game-canvas');

        canvas.addEventListener('click', () => {
            if (!this.isPointerLocked && this.isRunning && !this.deathCam.active) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === canvas;
            if (!this.isPointerLocked && this.isRunning && !this.isPaused && !this.deathCam.active) {
                this.pause();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked && !this.isPaused && this.player && this.player.isAlive && !this.deathCam.active) {
                this.player.handleMouseMove(e.movementX, e.movementY);
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.isPointerLocked || this.isPaused || this.deathCam.active) return;
            if (!this.player || !this.player.isAlive) return;
            if (e.button === 0) {
                // 如果持有投掷物，拉保险
                if (this.player.currentGrenade) {
                    if (this.player.pullGrenadePin()) {
                        this.hud.showCenterMessage('拉保险中...', 500);
                        audioManager.play('reload');  // 临时使用reload音效
                    }
                } else {
                    this.player.input.fire = true;
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0 && this.player) {
                // 如果投掷物已拉保险，松开时投掷
                if (this.player.currentGrenade && this.player.grenadePinPulled) {
                    this.handleGrenadeThrowing();
                }
                this.player.input.fire = false;
            }
        });

        // 右键切换瞄准镜（狙击枪功能）
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();  // 阻止右键菜单
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) {  // 右键
                if (!this.isPointerLocked || this.isPaused || this.deathCam.active) return;
                if (!this.player || !this.player.isAlive) return;

                if (this.player.toggleScope()) {
                    audioManager.play('click');  // 临时使用click音效
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;

            // 购买菜单优先处理（包括ESC和B键关闭）
            if (this.buyMenu && this.buyMenu.isOpen) {
                if (e.code === 'Escape' || e.code === 'KeyB') {
                    this.buyMenu.close();
                    return;
                }
                this.buyMenu.handleKeyPress(e.code);
                return;
            }

            if (e.code === 'Escape') {
                if (this.deathCam.active) return;
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
                return;
            }

            if (this.isPaused || this.deathCam.active) return;

            // B键打开购买菜单
            if (e.code === 'KeyB') {
                if (this.buyMenu && this.player && this.player.isAlive) {
                    // 确保购买菜单使用最新的玩家引用
                    this.buyMenu.updatePlayer(this.player);
                    this.buyMenu.open();
                }
                return;
            }

            if (!this.player || !this.player.isAlive) return;

            switch (e.code) {
                case 'KeyW': this.player.input.forward = true; break;
                case 'KeyS': this.player.input.backward = true; break;
                case 'KeyA': this.player.input.left = true; break;
                case 'KeyD': this.player.input.right = true; break;
                case 'Space': this.player.input.jump = true; break;
                case 'ShiftLeft':
                case 'ControlLeft':
                case 'KeyC': this.player.input.crouch = true; break;
                case 'KeyR': this.player.startReload(); break;
                case 'KeyQ':
                    this.player.switchWeapon();
                    this.updateWeaponViewModel();
                    break;
                case 'Digit1':
                    this.player.selectSlot('primary');
                    this.updateWeaponViewModel();
                    break;
                case 'Digit2':
                    this.player.selectSlot('sidearm');
                    this.updateWeaponViewModel();
                    break;
                // CS 1.6 风格投掷物切换
                case 'Digit4':
                    this.player.selectGrenade('he_grenade');
                    this.updateWeaponViewModel('he_grenade');
                    break;
                case 'Digit5':
                    this.player.selectGrenade('flashbang');
                    this.updateWeaponViewModel('flashbang');
                    break;
                case 'Digit6':
                    this.player.selectGrenade('smoke');
                    this.updateWeaponViewModel('smoke');
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!this.player) return;
            switch (e.code) {
                case 'KeyW': this.player.input.forward = false; break;
                case 'KeyS': this.player.input.backward = false; break;
                case 'KeyA': this.player.input.left = false; break;
                case 'KeyD': this.player.input.right = false; break;
                case 'Space': this.player.input.jump = false; break;
                case 'ShiftLeft':
                case 'ControlLeft':
                case 'KeyC': this.player.input.crouch = false; break;
            }
        });
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;

        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('click-to-start').classList.remove('hidden');

        // 创建购买菜单或更新玩家引用
        if (!this.buyMenu) {
            this.buyMenu = new BuyMenu(this.player, this.hud);
        } else {
            // 更新玩家引用（确保与当前玩家同步）
            this.buyMenu.updatePlayer(this.player);
        }

        this.hud.show();
        this.lastTime = performance.now();

        // 创建当前武器的视图模型
        if (this.weaponViewModel && this.player?.currentWeapon) {
            this.weaponViewModel.createWeaponModel(this.player.currentWeapon.data.id);
        }

        // 设置梯子检测回调
        if (this.player && this.map?.ladders) {
            this.player.ladderCallback = (position) => {
                for (const ladder of this.map.ladders) {
                    if (position.x >= ladder.min.x && position.x <= ladder.max.x &&
                        position.z >= ladder.min.z && position.z <= ladder.max.z &&
                        position.y >= ladder.min.y && position.y <= ladder.max.y + 1) {
                        return true;
                    }
                }
                return false;
            };
        }

        this.gameLoop();
    }

    startPracticeMode() {
        this.start();
        this.spawnBots(5);
        this.hud.showCenterMessage('5v5 练习模式', 2000);
    }

    spawnBots(count) {
        const strategies = ['aggressive', 'defensive', 'balanced', 'flanker', 'aggressive'];

        // 扩展的巡逻点 - 覆盖整个地图（包括边缘走廊）
        const patrolPoints = [
            // 中心区
            new THREE.Vector3(0, 1.8, 0),
            // 十字走廊
            new THREE.Vector3(-5, 1.8, 0),
            new THREE.Vector3(5, 1.8, 0),
            new THREE.Vector3(0, 1.8, -5),
            new THREE.Vector3(0, 1.8, 5),
            // 边缘走廊 - 地图四周
            new THREE.Vector3(-10, 1.8, 0),     // 最左
            new THREE.Vector3(10, 1.8, 0),      // 最右
            new THREE.Vector3(0, 1.8, -10),     // 最上
            new THREE.Vector3(0, 1.8, 10),      // 最下
            // 四个角落区域
            new THREE.Vector3(-10, 1.8, -10),
            new THREE.Vector3(10, 1.8, -10),
            new THREE.Vector3(-10, 1.8, 10),
            new THREE.Vector3(10, 1.8, 10),
            // 对角路径
            new THREE.Vector3(-6, 1.8, -6),
            new THREE.Vector3(6, 1.8, -6),
            new THREE.Vector3(-6, 1.8, 6),
            new THREE.Vector3(6, 1.8, 6)
        ];

        // 生成敌人
        for (let i = 0; i < count; i++) {
            const spawnPoint = this.map.getRandomSpawnPoint('red');
            const strategy = strategies[i % strategies.length];
            const enemy = new Bot(this.scene, spawnPoint, 'red', strategy, this.map);
            enemy.patrolPoints = patrolPoints;
            enemy.currentPatrolIndex = Math.floor(Math.random() * patrolPoints.length);
            this.enemies.push(enemy);
        }

        // 生成队友
        for (let i = 0; i < count; i++) {
            const spawnPoint = this.map.getRandomSpawnPoint('blue');
            const strategy = strategies[(i + 2) % strategies.length];
            const ally = new Bot(this.scene, spawnPoint, 'blue', strategy, this.map);
            ally.patrolPoints = patrolPoints;
            ally.currentPatrolIndex = Math.floor(Math.random() * patrolPoints.length);
            this.allies.push(ally);
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        const now = performance.now();
        this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        this.fpsCounter++;
        this.fpsTime += this.deltaTime;
        if (this.fpsTime >= 1) {
            this.currentFps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsTime = 0;
        }

        if (!this.isPaused) {
            this.update();
        }

        this.render();
    }

    update() {
        // 更新敌人
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                const targets = [this.player, ...this.allies].filter(t => t && t.isAlive);
                enemy.update(this.deltaTime, targets, this.enemies, (oldPos, newPos, radius) =>
                    this.map.checkCollision(oldPos, newPos, radius)
                );
            }
        });

        // 更新队友
        this.allies.forEach(ally => {
            if (ally.isAlive) {
                const targets = this.enemies.filter(e => e && e.isAlive);
                ally.update(this.deltaTime, targets, [...this.allies, this.player], (oldPos, newPos, radius) =>
                    this.map.checkCollision(oldPos, newPos, radius)
                );
            }
        });

        // 检查机器人击杀
        this.checkBotKills();

        // 更新子弹弹道
        this.updateBulletTracers();

        // 更新手雷物理
        this.updateGrenades();

        // 更新天气粒子
        if (this.map && this.map.updateWeather) {
            this.map.updateWeather(this.deltaTime);
        }

        // 死亡相机模式
        if (this.deathCam.active) {
            this.updateDeathCam();
            this.hud.update(this.player, this.roundTime, this.scores);
            this.hud.updateFPS(this.currentFps);
            return;
        }

        // 更新玩家
        if (this.player && this.player.isAlive) {
            this.player.update(this.deltaTime, (oldPos, newPos, radius) =>
                this.map.checkCollision(oldPos, newPos, radius)
            );

            // 处理射击（投掷物在 mouseup 事件中处理）
            if (this.player.input.fire && !this.player.currentGrenade) {
                if (this.player.currentWeapon?.data.automatic) {
                    this.handleShooting();
                } else {
                    this.handleShooting();
                    this.player.input.fire = false;
                }
            }
        }

        // 检查玩家死亡
        if (this.player && !this.player.isAlive && !this.deathCam.deathHandled) {
            this.onPlayerDeath();
        }

        // 更新远程玩家 (多人模式)
        if (this.isMultiplayer) {
            for (const [id, remotePlayer] of this.remotePlayers) {
                remotePlayer.update(this.deltaTime);
            }
        }

        // 更新HUD
        this.hud.update(this.player, this.roundTime, this.scores);
        this.hud.updateFPS(this.currentFps);

        // 更新第一人称武器视图
        if (this.weaponViewModel && this.player?.isAlive) {
            const isMoving = this.player.input.forward || this.player.input.backward ||
                this.player.input.left || this.player.input.right;
            const isReloading = this.player.currentWeapon?.isReloading || false;
            this.weaponViewModel.update(this.deltaTime, isMoving, isReloading);

            // 开镜时隐藏武器模型
            this.weaponViewModel.setVisible(!this.player.isScoped);
        }

        // 多人同步回调
        if (this.onUpdate) {
            this.onUpdate();
        }
    }

    checkBotKills() {
        // 检查敌人死亡（被队友击杀）
        this.enemies.forEach((enemy, index) => {
            if (!enemy.isAlive && !enemy.respawnScheduled) {
                enemy.respawnScheduled = true;
                this.scores.blue++;

                // 3秒后重生
                setTimeout(() => {
                    this.respawnBot(enemy, 'red', index);
                }, 3000);
            }
        });

        // 检查队友死亡
        this.allies.forEach((ally, index) => {
            if (!ally.isAlive && !ally.respawnScheduled) {
                ally.respawnScheduled = true;
                this.scores.red++;

                // 3秒后重生
                setTimeout(() => {
                    this.respawnBot(ally, 'blue', index);
                }, 3000);
            }
        });
    }

    respawnBot(oldBot, team, index) {
        const strategies = ['aggressive', 'defensive', 'balanced', 'flanker', 'aggressive'];
        const patrolPoints = [
            new THREE.Vector3(0, 1.8, 0),
            new THREE.Vector3(-5, 1.8, 0),
            new THREE.Vector3(5, 1.8, 0),
            new THREE.Vector3(0, 1.8, -5),
            new THREE.Vector3(0, 1.8, 5),
            new THREE.Vector3(-5, 1.8, -5),
            new THREE.Vector3(5, 1.8, -5),
            new THREE.Vector3(-5, 1.8, 5),
            new THREE.Vector3(5, 1.8, 5)
        ];

        // 移除旧模型
        if (oldBot.mesh) {
            this.scene.remove(oldBot.mesh);
        }

        // 创建新机器人
        const spawnPoint = this.map.getRandomSpawnPoint(team);
        const strategy = strategies[index % strategies.length];
        const newBot = new Bot(this.scene, spawnPoint, team, strategy, this.map);
        newBot.patrolPoints = patrolPoints;
        newBot.currentPatrolIndex = Math.floor(Math.random() * patrolPoints.length);

        // 替换数组中的机器人
        if (team === 'red') {
            const idx = this.enemies.indexOf(oldBot);
            if (idx > -1) {
                this.enemies[idx] = newBot;
            }
        } else {
            const idx = this.allies.indexOf(oldBot);
            if (idx > -1) {
                this.allies[idx] = newBot;
            }
        }
    }

    updateDeathCam() {
        this.deathCam.respawnTime -= this.deltaTime;

        const timeLeft = Math.ceil(this.deathCam.respawnTime);
        this.hud.showCenterMessage(`观察杀手... ${timeLeft}秒后复活`, 100);

        if (this.deathCam.killer && this.deathCam.killer.isAlive) {
            const killer = this.deathCam.killer;
            const offset = new THREE.Vector3(
                -killer.lookDirection.x * 5,
                3,
                -killer.lookDirection.z * 5
            );
            const targetPos = killer.position.clone().add(offset);
            this.deathCam.camera.position.lerp(targetPos, 0.05);
            this.deathCam.camera.lookAt(killer.position);
        } else {
            this.deathCam.camera.position.set(0, 15, 0);
            this.deathCam.camera.lookAt(0, 0, 0);
        }

        if (this.deathCam.respawnTime <= 0) {
            this.respawnPlayer();
        }
    }

    handleShooting() {
        if (!this.player || !this.player.isAlive) return;

        const result = this.player.shoot();
        if (!result) return;

        // 狙击枪射击后取消瞄准（CS 1.6 风格）
        if (this.player.currentWeapon?.data.hasScope && this.player.isScoped) {
            this.player.cancelScope();
        }

        // 触发武器开火动画
        if (this.weaponViewModel) {
            this.weaponViewModel.playFireAnimation();
        }

        const origin = this.player.camera.position.clone();

        for (let i = 0; i < result.pellets; i++) {
            const direction = this.player.getShootDirection();

            let closestTarget = null;
            let closestDist = this.player.currentWeapon.data.range;
            let isHeadshot = false;
            let hitPoint = null;

            // 检查敌人
            for (const enemy of this.enemies) {
                const hit = enemy.checkHit(origin, direction, closestDist);
                if (hit && hit.distance < closestDist) {
                    closestDist = hit.distance;
                    closestTarget = enemy;
                    isHeadshot = hit.isHeadshot;
                }
            }

            // 计算弹道终点
            if (closestTarget) {
                hitPoint = origin.clone().add(direction.clone().multiplyScalar(closestDist));
            } else {
                // 检查墙壁
                const wallHit = this.map.raycast(origin, direction, this.player.currentWeapon.data.range);
                if (wallHit) {
                    hitPoint = wallHit.point;
                } else {
                    hitPoint = origin.clone().add(direction.clone().multiplyScalar(this.player.currentWeapon.data.range));
                }
            }

            // 创建子弹弹道
            this.createBulletTracer(origin, hitPoint, 0xffff00);

            if (closestTarget) {
                const damage = isHeadshot ?
                    result.damage * result.headshot :
                    result.damage;

                const killed = closestTarget.takeDamage(damage, isHeadshot);

                this.hud.showHitMarker(isHeadshot);

                if (isHeadshot) {
                    audioManager.play('headshot');
                } else {
                    audioManager.play('hit');
                }

                if (killed) {
                    this.kills++;
                    this.player.kills++;
                    this.scores.blue++;

                    // 击杀奖励
                    this.player.money += 300;

                    // 如果购买菜单打开，更新金钱显示
                    if (this.buyMenu && this.buyMenu.isOpen) {
                        this.buyMenu.updateMoney();
                    }

                    this.hud.addKillFeedEntry(
                        '你',
                        '敌人',
                        this.player.currentWeapon.data.name,
                        isHeadshot
                    );
                    audioManager.play('headshot');
                }
            }
        }
    }

    // 处理投掷手雷
    handleGrenadeThrowing() {
        if (!this.player || !this.player.isAlive) return;

        const grenadeData = this.player.throwGrenade();
        if (!grenadeData) return;

        // 初始化手雷数组
        if (!this.activeGrenades) {
            this.activeGrenades = [];
        }

        // 创建手雷视觉对象
        const grenadeColors = {
            'he_grenade': 0x44aa44,
            'flashbang': 0xeeeeee,
            'smoke': 0x888888
        };

        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshStandardMaterial({
            color: grenadeColors[grenadeData.type] || 0x44aa44,
            emissive: grenadeColors[grenadeData.type] || 0x44aa44,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(grenadeData.position);
        this.scene.add(mesh);

        // 存储手雷数据
        this.activeGrenades.push({
            mesh: mesh,
            type: grenadeData.type,
            position: grenadeData.position.clone(),
            velocity: grenadeData.velocity.clone(),
            life: 2.5, // 2.5秒后爆炸
            bounces: 0
        });

        // 播放投掷音效
        audioManager.play('reload'); // 临时使用reload音效
        this.hud.showCenterMessage(`投掷 ${this.getGrenadeName(grenadeData.type)}`, 1000);
    }

    getGrenadeName(type) {
        const names = {
            'he_grenade': '手雷',
            'flashbang': '闪光弹',
            'smoke': '烟雾弹'
        };
        return names[type] || '投掷物';
    }

    // 更新手雷物理
    updateGrenades() {
        if (!this.activeGrenades) return;

        for (let i = this.activeGrenades.length - 1; i >= 0; i--) {
            const grenade = this.activeGrenades[i];

            // 应用重力
            grenade.velocity.y -= 15 * this.deltaTime;

            // 计算下一帧位置
            const movement = grenade.velocity.clone().multiplyScalar(this.deltaTime);
            const newPos = grenade.position.clone().add(movement);

            // 墙壁碰撞检测
            if (this.map && movement.length() > 0.001) {
                const direction = movement.clone().normalize();
                const distance = movement.length();
                const wallHit = this.map.raycast(grenade.position, direction, distance + 0.15);

                if (wallHit && wallHit.distance < distance + 0.1) {
                    // 计算反弹方向
                    const normal = wallHit.normal || new THREE.Vector3(0, 1, 0);

                    // 反射速度向量: v' = v - 2(v·n)n
                    const dot = grenade.velocity.dot(normal);
                    grenade.velocity.sub(normal.clone().multiplyScalar(2 * dot));

                    // 能量损失
                    grenade.velocity.multiplyScalar(0.5);

                    // 调整位置到碰撞点外
                    newPos.copy(wallHit.point).add(normal.clone().multiplyScalar(0.15));
                    grenade.bounces++;
                }
            }

            // 地面碰撞
            if (newPos.y < 0.1) {
                newPos.y = 0.1;
                grenade.velocity.y *= -0.4; // 弹跳
                grenade.velocity.x *= 0.7;
                grenade.velocity.z *= 0.7;
                grenade.bounces++;
            }

            grenade.position.copy(newPos);
            grenade.mesh.position.copy(newPos);

            // 减少生命时间
            grenade.life -= this.deltaTime;

            // 爆炸
            if (grenade.life <= 0) {
                this.explodeGrenade(grenade);
                this.scene.remove(grenade.mesh);
                grenade.mesh.geometry.dispose();
                grenade.mesh.material.dispose();
                this.activeGrenades.splice(i, 1);
            }
        }
    }

    // 手雷爆炸效果
    explodeGrenade(grenade) {
        switch (grenade.type) {
            case 'he_grenade':
                // 伤害周围敌人 - 大幅增强爆炸效果
                const damageRadius = 12;  // 爆炸半径从5增加到12
                const maxDamage = 150;    // 最大伤害从80增加到150

                this.enemies.forEach(enemy => {
                    if (!enemy.isAlive) return;
                    const dist = enemy.position.distanceTo(grenade.position);
                    if (dist < damageRadius) {
                        const damage = maxDamage * (1 - dist / damageRadius);
                        const killed = enemy.takeDamage(damage, false);
                        if (killed) {
                            this.kills++;
                            this.player.kills++;
                            this.player.money += 300;

                            // 如果购买菜单打开，更新金钱显示
                            if (this.buyMenu && this.buyMenu.isOpen) {
                                this.buyMenu.updateMoney();
                            }
                            this.scores.blue++;
                            this.hud.addKillFeedEntry('你', '敌人', '手雷', false);
                        }
                    }
                });

                // 视觉效果
                this.createExplosionEffect(grenade.position, 0xff4400);
                audioManager.play('headshot');
                break;

            case 'flashbang':
                // 闪光弹效果 - 简化版：显示提示
                this.hud.showCenterMessage('💥 闪光弹爆炸!', 500);
                this.createExplosionEffect(grenade.position, 0xffffff);
                break;

            case 'smoke':
                // 烟雾弹效果 - 简化版：显示提示
                this.hud.showCenterMessage('💨 烟雾弹释放!', 1000);
                this.createSmokeEffect(grenade.position);
                break;
        }
    }

    // 爆炸视觉效果
    createExplosionEffect(position, color) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(position);
        this.scene.add(explosion);

        // 动画扩散并消失
        let scale = 1;
        const animate = () => {
            scale += 0.3;
            explosion.scale.set(scale, scale, scale);
            material.opacity -= 0.05;

            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosion);
                geometry.dispose();
                material.dispose();
            }
        };
        animate();
    }

    // 烟雾效果
    createSmokeEffect(position) {
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6
        });
        const smoke = new THREE.Mesh(geometry, material);
        smoke.position.copy(position);
        smoke.position.y += 1;
        this.scene.add(smoke);

        // 5秒后消散
        let life = 5;
        const fadeOut = () => {
            life -= 0.016;
            if (life < 1) {
                material.opacity = life * 0.6;
            }

            if (life > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(smoke);
                geometry.dispose();
                material.dispose();
            }
        };
        setTimeout(fadeOut, 4000);
    }

    // 创建子弹弹道线
    createBulletTracer(start, end, color = 0xffff00) {
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // 存储弹道信息
        this.bulletTracers.push({
            line: line,
            life: 0.15 // 弹道存在时间（秒）
        });
    }

    // 更新弹道
    updateBulletTracers() {
        for (let i = this.bulletTracers.length - 1; i >= 0; i--) {
            const tracer = this.bulletTracers[i];
            tracer.life -= this.deltaTime;

            // 淡出效果
            if (tracer.line.material) {
                tracer.line.material.opacity = Math.max(0, tracer.life / 0.15 * 0.8);
            }

            // 移除过期弹道
            if (tracer.life <= 0) {
                this.scene.remove(tracer.line);
                tracer.line.geometry.dispose();
                tracer.line.material.dispose();
                this.bulletTracers.splice(i, 1);
            }
        }
    }

    onPlayerDeath() {
        this.deathCam.deathHandled = true;
        this.deaths++;
        this.scores.red++;

        // 玩家死亡时关闭购买菜单
        if (this.buyMenu && this.buyMenu.isOpen) {
            this.buyMenu.close();
        }

        let nearestEnemy = null;
        let nearestDist = Infinity;

        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                const dist = enemy.position.distanceTo(this.player.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }
        }

        this.deathCam.active = true;
        this.deathCam.killer = nearestEnemy;
        this.deathCam.respawnTime = 6;

        if (nearestEnemy) {
            const offset = new THREE.Vector3(
                -nearestEnemy.lookDirection.x * 5,
                3,
                -nearestEnemy.lookDirection.z * 5
            );
            this.deathCam.camera.position.copy(nearestEnemy.position).add(offset);
            this.deathCam.camera.lookAt(nearestEnemy.position);
        }

        this.player.input.forward = false;
        this.player.input.backward = false;
        this.player.input.left = false;
        this.player.input.right = false;
        this.player.input.jump = false;
        this.player.input.crouch = false;
        this.player.input.fire = false;

        this.hud.addKillFeedEntry('敌人', '你', 'Frostbite Rifle', false);
        audioManager.play('death');
    }

    respawnPlayer() {
        this.deathCam.active = false;
        this.deathCam.killer = null;
        this.deathCam.deathHandled = false;

        if (this.player) {
            this.player.respawn(this.map.getRandomSpawnPoint('blue'));
        }

        // 更新购买菜单的玩家引用
        if (this.buyMenu) {
            this.buyMenu.updatePlayer(this.player);
        }

        this.hud.showCenterMessage('复活!', 1000);
    }

    render() {
        let activeCamera = this.player ? this.player.camera : null;

        if (this.deathCam.active) {
            activeCamera = this.deathCam.camera;
        }

        if (activeCamera) {
            this.renderer.render(this.scene, activeCamera);

            // 渲染第一人称武器视图（叠加渲染）
            if (this.weaponViewModel && !this.deathCam.active && this.player?.isAlive) {
                this.renderer.autoClear = false;
                this.renderer.clearDepth();
                this.renderer.render(this.weaponViewModel.scene, this.weaponViewModel.camera);
                this.renderer.autoClear = true;
            }
        }
    }

    pause() {
        this.isPaused = true;
        document.getElementById('pause-menu').classList.remove('hidden');
        document.exitPointerLock();
    }

    resume() {
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
    }

    // 更新武器视图模型（切换武器时调用）
    updateWeaponViewModel(grenadeType = null) {
        if (!this.weaponViewModel) return;

        if (grenadeType) {
            // 投掷物模型
            this.weaponViewModel.createWeaponModel(grenadeType);
        } else if (this.player?.currentWeapon) {
            // 枪械模型
            this.weaponViewModel.createWeaponModel(this.player.currentWeapon.data.id);
        }
    }

    quit() {
        this.isRunning = false;
        this.isPaused = false;
        this.deathCam.active = false;

        this.enemies.forEach(e => { if (e.mesh) this.scene.remove(e.mesh); });
        this.enemies = [];
        this.allies.forEach(a => { if (a.mesh) this.scene.remove(a.mesh); });
        this.allies = [];

        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }

    onResize() {
        const aspect = window.innerWidth / window.innerHeight;

        if (this.player && this.player.camera) {
            this.player.camera.aspect = aspect;
            this.player.camera.updateProjectionMatrix();
        }

        if (this.deathCam.camera) {
            this.deathCam.camera.aspect = aspect;
            this.deathCam.camera.updateProjectionMatrix();
        }

        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // 更新武器视图相机
        if (this.weaponViewModel) {
            this.weaponViewModel.onResize();
        }
    }

    // ============ 多人模式方法 ============

    // 多人模式生成机器人
    spawnMultiplayerBots(room) {
        const strategies = ['aggressive', 'defensive', 'balanced', 'flanker'];

        const patrolPoints = [
            new THREE.Vector3(0, 1.8, 0),
            new THREE.Vector3(-5, 1.8, 0),
            new THREE.Vector3(5, 1.8, 0),
            new THREE.Vector3(0, 1.8, -5),
            new THREE.Vector3(0, 1.8, 5),
            new THREE.Vector3(-10, 1.8, 0),
            new THREE.Vector3(10, 1.8, 0),
            new THREE.Vector3(0, 1.8, -10),
            new THREE.Vector3(0, 1.8, 10),
            new THREE.Vector3(-6, 1.8, -6),
            new THREE.Vector3(6, 1.8, -6),
            new THREE.Vector3(-6, 1.8, 6),
            new THREE.Vector3(6, 1.8, 6)
        ];

        // 红队机器人 (敌人)
        const redBotCount = room.teams.red.bots || 4;
        for (let i = 0; i < redBotCount; i++) {
            const spawnPoint = this.map.getRandomSpawnPoint('red');
            const strategy = strategies[i % strategies.length];
            const bot = new Bot(this.scene, spawnPoint, 'red', strategy, this.map);
            bot.patrolPoints = patrolPoints;
            bot.currentPatrolIndex = Math.floor(Math.random() * patrolPoints.length);
            this.enemies.push(bot);
        }

        // 蓝队机器人 (队友)
        const blueBotCount = room.teams.blue.bots || 4;
        for (let i = 0; i < blueBotCount; i++) {
            const spawnPoint = this.map.getRandomSpawnPoint('blue');
            const strategy = strategies[(i + 2) % strategies.length];
            const bot = new Bot(this.scene, spawnPoint, 'blue', strategy, this.map);
            bot.patrolPoints = patrolPoints;
            bot.currentPatrolIndex = Math.floor(Math.random() * patrolPoints.length);
            this.allies.push(bot);
        }
    }

    // 更新远程玩家
    updateRemotePlayer(data) {
        let remotePlayer = this.remotePlayers.get(data.playerId);

        if (!remotePlayer) {
            // 创建新的远程玩家
            const position = new THREE.Vector3(
                data.position?.x || 0,
                data.position?.y || 1,
                data.position?.z || 0
            );

            // 判断远程玩家是敌人还是队友
            const team = data.team || (this.playerTeam === 'blue' ? 'red' : 'blue');
            remotePlayer = new RemotePlayer(
                this.scene,
                data.playerId,
                data.playerName || '玩家',
                team,
                position
            );
            this.remotePlayers.set(data.playerId, remotePlayer);
        }

        remotePlayer.updateState(data);
    }

    // 处理远程射击
    handleRemoteShoot(data) {
        const remotePlayer = this.remotePlayers.get(data.playerId);
        if (remotePlayer && data.origin && data.direction) {
            remotePlayer.showShoot(data.origin, data.direction);
        }
    }

    // 处理远程击杀
    handleRemoteKill(data) {
        // 显示击杀信息
        this.hud.addKillFeedEntry(
            data.killerName || '敌人',
            data.victimName || '玩家',
            'Frostbite Rifle',
            false
        );

        // 处理分数
        // 假设killerId团队与victimId团队不同
        if (data.victimId === multiplayerManager.playerId) {
            // 本地玩家被杀
            this.scores.red++;
        } else {
            // 远程玩家被杀
            const remotePlayer = this.remotePlayers.get(data.victimId);
            if (remotePlayer) {
                remotePlayer.die();
            }
        }
    }

    // 处理远程复活
    handleRemoteRespawn(data) {
        const remotePlayer = this.remotePlayers.get(data.playerId);
        if (remotePlayer && data.position) {
            remotePlayer.respawn(new THREE.Vector3(
                data.position.x,
                data.position.y,
                data.position.z
            ));
        }
    }
}

