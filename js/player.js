// FrostBite Arena - 玩家控制器
class Player {
    constructor(scene) {
        this.scene = scene;

        // 位置和朝向
        this.position = new THREE.Vector3(0, CONFIG.player.height, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = { yaw: 0, pitch: 0 };

        // 状态
        this.health = CONFIG.player.maxHealth;
        this.armor = 0;
        this.isAlive = true;
        this.isGrounded = true;
        this.isCrouching = false;
        this.isMoving = false;

        // 武器
        this.weapons = {
            primary: null,
            sidearm: null
        };
        this.currentSlot = 'primary';
        this.currentWeapon = null;

        // 输入状态
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            fire: false,
            reload: false,
            switchWeapon: false
        };

        // 相机
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        this.camera.position.copy(this.position);

        // 后坐力恢复
        this.recoilOffset = { x: 0, y: 0 };
        this.recoilRecoverySpeed = 5;

        // 瞄准镜状态（狙击枪功能）
        this.isScoped = false;
        this.scopeLevel = 0;  // 0=无瞄准, 1=一倍镜, 2=二倍镜
        this.defaultFov = CONFIG.camera.fov;

        // 统计
        this.kills = 0;
        this.deaths = 0;

        // 金钱系统
        this.money = 800;  // 初始资金
        this.hasHelmet = false;  // 头盔

        // 投掷物背包
        this.grenades = {
            he_grenade: 0,
            flashbang: 0,
            smoke: 0
        };
        this.currentGrenade = null;  // 当前选中的投掷物
        this.grenadePinPulled = false;  // 是否已拉保险（CS 1.6 风格）

        // 初始化武器
        this.equipWeapon('frostbite_rifle', 'primary');
        this.equipWeapon('mk9_pistol', 'sidearm');
        this.selectSlot('primary');
    }

    equipWeapon(type, slot) {
        const weapon = createWeapon(type);
        if (weapon) {
            this.weapons[slot] = weapon;
            if (this.currentSlot === slot) {
                this.currentWeapon = weapon;
            }
        }
    }

    selectSlot(slot) {
        if (this.weapons[slot]) {
            // 取消当前换弹
            if (this.currentWeapon) {
                this.currentWeapon.cancelReload();
            }
            // 取消投掷物拉保险状态（不消耗投掷物）
            this.grenadePinPulled = false;
            // 取消瞄准状态
            this.cancelScope();
            this.currentSlot = slot;
            this.currentWeapon = this.weapons[slot];
            this.currentGrenade = null; // 切换到枪械时取消手雷选择
        }
    }

    switchWeapon() {
        const newSlot = this.currentSlot === 'primary' ? 'sidearm' : 'primary';
        this.selectSlot(newSlot);
    }

    // 切换瞄准镜（右键点击，CS 1.6 风格双重缩放）
    toggleScope() {
        if (!this.currentWeapon || !this.currentWeapon.data.hasScope) {
            return false;
        }

        const zoomLevels = this.currentWeapon.data.scopeZoomLevels || [4];

        // 循环切换缩放级别: 无 -> 一倍镜 -> 二倍镜 -> 无
        this.scopeLevel = (this.scopeLevel + 1) % (zoomLevels.length + 1);

        if (this.scopeLevel === 0) {
            // 取消瞄准
            this.isScoped = false;
            this.camera.fov = this.defaultFov;
        } else {
            // 应用缩放
            this.isScoped = true;
            const zoomFactor = zoomLevels[this.scopeLevel - 1];
            this.camera.fov = this.defaultFov / zoomFactor;
        }

        this.camera.updateProjectionMatrix();
        return true;
    }

    // 取消瞄准状态
    cancelScope() {
        if (this.isScoped) {
            this.isScoped = false;
            this.scopeLevel = 0;
            this.camera.fov = this.defaultFov;
            this.camera.updateProjectionMatrix();
        }
    }

    // CS 1.6 风格投掷物切换
    selectGrenade(grenadeType) {
        // 检查是否有该投掷物
        if (!this.grenades || this.grenades[grenadeType] <= 0) {
            return false;
        }

        // 切换到投掷物模式
        this.currentGrenade = grenadeType;
        this.currentSlot = 'grenade';
        this.grenadePinPulled = false;  // 重置拉保险状态

        // 取消当前武器换弹
        if (this.currentWeapon) {
            this.currentWeapon.cancelReload();
        }

        return true;
    }

    // 拉保险（按下左键时调用）
    pullGrenadePin() {
        if (!this.currentGrenade || !this.grenades || this.grenades[this.currentGrenade] <= 0) {
            return false;
        }

        if (this.grenadePinPulled) {
            return false;  // 已经拉过保险了
        }

        this.grenadePinPulled = true;
        return true;
    }

    // 取消投掷（切换武器时调用，不消耗投掷物）
    cancelGrenade() {
        this.grenadePinPulled = false;
    }

    // 投掷手雷（松开左键时调用，只有拉过保险才能投掷）
    throwGrenade() {
        // 必须已拉保险才能投掷
        if (!this.grenadePinPulled) {
            return null;
        }

        if (!this.currentGrenade || !this.grenades || this.grenades[this.currentGrenade] <= 0) {
            return null;
        }

        const grenadeType = this.currentGrenade;
        this.grenades[grenadeType]--;
        this.grenadePinPulled = false;  // 重置拉保险状态

        // 获取投掷方向和位置
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const result = {
            type: grenadeType,
            position: this.camera.position.clone(),
            direction: direction,
            velocity: direction.clone().multiplyScalar(20) // 投掷速度
        };

        // 如果没有该类型手雷了，切换回主武器
        if (this.grenades[grenadeType] <= 0) {
            this.currentGrenade = null;
            this.selectSlot('primary');
        }

        return result;
    }

    // 获取当前手雷名称（用于HUD显示）
    getCurrentGrenadeName() {
        const names = {
            'he_grenade': '手雷',
            'flashbang': '闪光弹',
            'smoke': '烟雾弹'
        };
        return this.currentGrenade ? names[this.currentGrenade] : null;
    }

    update(deltaTime, collisionCallback) {
        if (!this.isAlive) return;

        // 更新武器
        if (this.currentWeapon) {
            this.currentWeapon.updateSpread(deltaTime);
            if (this.currentWeapon.isReloading) {
                this.currentWeapon.updateReload(deltaTime);
            }
        }

        // 处理移动
        this.updateMovement(deltaTime, collisionCallback);

        // 恢复后坐力
        this.recoverRecoil(deltaTime);

        // 更新相机
        this.updateCamera();
    }

    updateMovement(deltaTime, collisionCallback) {
        // 计算移动方向
        const moveDir = new THREE.Vector3();

        if (this.input.forward) moveDir.z -= 1;
        if (this.input.backward) moveDir.z += 1;
        if (this.input.left) moveDir.x -= 1;
        if (this.input.right) moveDir.x += 1;

        this.isMoving = moveDir.lengthSq() > 0;

        if (this.isMoving) {
            moveDir.normalize();

            // 应用旋转
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.yaw);

            // 计算速度
            let speed = this.isCrouching ? CONFIG.player.crouchSpeed : CONFIG.player.walkSpeed;

            // 应用移动
            this.velocity.x = moveDir.x * speed;
            this.velocity.z = moveDir.z * speed;
        } else {
            // 快速停止（counter-strafe feel）
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;

            if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.1) this.velocity.z = 0;
        }

        // 梯子攀爬检测
        this.isOnLadder = false;
        if (this.ladderCallback) {
            const ladderResult = this.ladderCallback(this.position);
            if (ladderResult) {
                this.isOnLadder = true;
                // 在梯子上时，W/S控制上下移动
                if (this.input.forward) {
                    this.velocity.y = CONFIG.player.walkSpeed * 0.8;
                } else if (this.input.backward) {
                    this.velocity.y = -CONFIG.player.walkSpeed * 0.6;
                } else {
                    this.velocity.y = 0; // 在梯子上静止时不下落
                }
                // 减少水平移动速度
                this.velocity.x *= 0.3;
                this.velocity.z *= 0.3;
            }
        }

        // 跳跃
        if (this.input.jump && this.isGrounded) {
            this.velocity.y = CONFIG.player.jumpForce;
            this.isGrounded = false;
        }

        // 重力 - 在梯子上时不应用
        if (!this.isOnLadder) {
            this.velocity.y -= CONFIG.player.gravity * deltaTime;
        }

        // 限制最大下落速度
        if (this.velocity.y < -30) {
            this.velocity.y = -30;
        }

        // 蹲下
        if (this.input.crouch) {
            this.isCrouching = true;
        } else {
            this.isCrouching = false;
        }

        // 应用速度
        const newPosition = this.position.clone();
        newPosition.x += this.velocity.x * deltaTime;
        newPosition.y += this.velocity.y * deltaTime;
        newPosition.z += this.velocity.z * deltaTime;

        // 碰撞检测
        if (collisionCallback) {
            const result = collisionCallback(this.position, newPosition, CONFIG.player.radius);
            newPosition.copy(result.position);

            // 检测是否着地（在平台或地面上）- 在梯子上时不检测
            if (!this.isOnLadder) {
                if (result.hitFloor) {
                    this.isGrounded = true;
                    this.velocity.y = 0;
                } else {
                    // 不在任何表面上，处于空中
                    this.isGrounded = false;
                }
            }

            if (result.hitCeiling) {
                this.velocity.y = 0;
            }
        }

        // 基础地面检测（作为最后保障）
        const groundHeight = this.isCrouching ? CONFIG.player.height * 0.6 : CONFIG.player.height;
        if (newPosition.y < groundHeight) {
            newPosition.y = groundHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        this.position.copy(newPosition);
    }

    updateCamera() {
        // 设置相机位置
        const eyeOffset = this.isCrouching ? CONFIG.player.eyeHeight * 0.6 : CONFIG.player.eyeHeight;
        this.camera.position.set(
            this.position.x,
            this.position.y - CONFIG.player.height + eyeOffset,
            this.position.z
        );

        // 计算相机旋转（包含后坐力）
        const euler = new THREE.Euler(
            this.rotation.pitch + this.recoilOffset.y,
            this.rotation.yaw + this.recoilOffset.x,
            0,
            'YXZ'
        );
        this.camera.quaternion.setFromEuler(euler);
    }

    handleMouseMove(movementX, movementY) {
        if (!this.isAlive) return;

        const sensitivity = CONFIG.camera.sensitivity * CONFIG.settings.mouseSensitivity;

        this.rotation.yaw -= movementX * sensitivity;
        this.rotation.pitch -= movementY * sensitivity * (CONFIG.settings.invertY ? -1 : 1);

        // 限制俯仰角
        this.rotation.pitch = Math.max(
            CONFIG.camera.minPitch,
            Math.min(CONFIG.camera.maxPitch, this.rotation.pitch)
        );
    }

    shoot() {
        if (!this.isAlive || !this.currentWeapon) return null;

        const now = performance.now();
        const result = this.currentWeapon.shoot(now);

        if (result) {
            // 应用后坐力
            this.recoilOffset.x += (Math.random() - 0.5) * result.recoil.x;
            this.recoilOffset.y += result.recoil.y;

            // 播放音效
            const weaponId = this.currentWeapon.data.id;
            if (weaponId.includes('rifle')) audioManager.play('shoot_rifle');
            else if (weaponId.includes('smg')) audioManager.play('shoot_smg');
            else if (weaponId.includes('shotgun')) audioManager.play('shoot_shotgun');
            else if (weaponId.includes('sniper')) audioManager.play('shoot_sniper');
            else audioManager.play('shoot_pistol');

            return result;
        } else if (this.currentWeapon.currentMag <= 0) {
            // 没子弹了
            audioManager.play('empty');
            // 自动换弹
            this.startReload();
        }

        return null;
    }

    startReload() {
        if (!this.currentWeapon) return;

        if (this.currentWeapon.startReload()) {
            audioManager.play('reload');
        }
    }

    recoverRecoil(deltaTime) {
        this.recoilOffset.x *= Math.pow(0.1, deltaTime * this.recoilRecoverySpeed);
        this.recoilOffset.y *= Math.pow(0.1, deltaTime * this.recoilRecoverySpeed);

        if (Math.abs(this.recoilOffset.x) < 0.0001) this.recoilOffset.x = 0;
        if (Math.abs(this.recoilOffset.y) < 0.0001) this.recoilOffset.y = 0;
    }

    takeDamage(amount, isHeadshot = false) {
        if (!this.isAlive) return;

        // 护甲吸收
        let actualDamage = amount;
        if (this.armor > 0) {
            const armorDamage = amount * CONFIG.player.armorAbsorption;
            const armorReduction = Math.min(armorDamage, this.armor);
            this.armor -= armorReduction;
            actualDamage = amount - armorReduction;
        }

        this.health -= actualDamage;
        audioManager.play('hurt');

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.deaths++;

        // 取消开镜状态
        this.cancelScope();

        // 取消换弹状态
        if (this.currentWeapon) {
            this.currentWeapon.isReloading = false;
            this.currentWeapon.reloadProgress = 0;
        }

        audioManager.play('death');
    }

    respawn(position) {
        this.position.copy(position);
        this.velocity.set(0, 0, 0);
        this.health = CONFIG.player.maxHealth;
        this.armor = 0;
        this.isAlive = true;
        this.isGrounded = true;
        this.isCrouching = false;
        this.isMoving = false;

        // 重置朝向和后坐力 - 修复复活后抖动问题
        this.rotation.yaw = 0;
        this.rotation.pitch = 0;
        this.recoilOffset.x = 0;
        this.recoilOffset.y = 0;

        // 重置输入状态
        this.input.forward = false;
        this.input.backward = false;
        this.input.left = false;
        this.input.right = false;
        this.input.jump = false;
        this.input.crouch = false;
        this.input.fire = false;

        // 重置武器
        if (this.weapons.primary) this.weapons.primary.refillAmmo();
        if (this.weapons.sidearm) this.weapons.sidearm.refillAmmo();
        this.selectSlot('primary');

        // 立即更新相机位置
        this.updateCamera();
    }

    addArmor(amount) {
        this.armor = Math.min(this.armor + amount, CONFIG.player.maxArmor);
        audioManager.play('pickup');
    }

    getAccuracy() {
        if (!this.currentWeapon) return 1;

        // 移动和跳跃降低精准度
        let accuracy = 1;

        if (this.isMoving) accuracy *= 0.7;
        if (!this.isGrounded) accuracy *= 0.3;
        if (this.isCrouching) accuracy *= 1.2;

        // 当前散布
        const spreadRatio = this.currentWeapon.currentSpread / this.currentWeapon.data.maxSpread;
        accuracy *= (1 - spreadRatio * 0.5);

        return Math.max(0.1, Math.min(1, accuracy));
    }

    getShootDirection() {
        // 获取射击方向（考虑散布）
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);

        if (this.currentWeapon) {
            const spread = this.currentWeapon.currentSpread * (this.isMoving ? 1.5 : 1);
            dir.x += (Math.random() - 0.5) * spread;
            dir.y += (Math.random() - 0.5) * spread;
        }

        return dir.normalize();
    }
}
