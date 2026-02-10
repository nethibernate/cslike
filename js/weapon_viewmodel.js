// FrostBite Arena - 第一人称武器视图
class WeaponViewModel {
    constructor() {
        // 武器视图场景（独立渲染，不会被墙壁遮挡）
        this.scene = new THREE.Scene();

        // 武器视图相机（独立相机，固定 FOV）
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
        this.camera.position.set(0, 0, 0);

        // 当前武器模型
        this.weaponGroup = null;
        this.currentWeaponType = null;

        // 动画状态
        this.animations = {
            idle: { active: true },
            fire: { active: false, time: 0, duration: 0.1 },
            reload: { active: false, time: 0, duration: 2.0 },
            switchWeapon: { active: false, time: 0, duration: 0.3 }
        };

        // 武器晃动（走路/跑步）
        this.sway = {
            time: 0,
            intensity: 0,
            basePosition: new THREE.Vector3(0.3, -0.25, -0.5),
            baseRotation: new THREE.Euler(0, 0, 0)
        };

        // 后坐力动画
        this.recoil = {
            current: new THREE.Vector3(0, 0, 0),
            recovery: 8
        };

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 添加方向光
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(1, 2, 1);
        this.scene.add(dirLight);
    }

    // 创建武器模型
    createWeaponModel(weaponType) {
        // 移除旧武器
        if (this.weaponGroup) {
            this.scene.remove(this.weaponGroup);
        }

        this.currentWeaponType = weaponType;
        this.weaponGroup = new THREE.Group();

        // 重置基础位置
        this.sway.basePosition.set(0.3, -0.25, -0.5);

        // 根据武器类型创建不同模型
        switch (weaponType) {
            case 'frostbite_rifle':
                this.createRifleModel();
                break;
            case 'hailstorm_smg':
                this.createSMGModel();
                break;
            case 'glacier_shotgun':
                this.createShotgunModel();
                break;
            case 'blizzard_sniper':
                this.createSniperModel();
                break;
            case 'mk9_pistol':
                this.createPistolModel();
                break;
            // 投掷物
            case 'he_grenade':
                this.createHEGrenadeModel();
                break;
            case 'flashbang':
                this.createFlashbangModel();
                break;
            case 'smoke':
                this.createSmokeGrenadeModel();
                break;
            default:
                this.createRifleModel();
        }

        // 设置武器位置
        this.weaponGroup.position.copy(this.sway.basePosition);
        this.scene.add(this.weaponGroup);

        // 触发切换动画
        this.playAnimation('switchWeapon');
    }

    // AK-47 风格步枪模型
    createRifleModel() {
        const materials = {
            metal: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 }),
            wood: new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.1, roughness: 0.8 }),
            grip: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.3, roughness: 0.7 })
        };

        // 机匣 (Receiver)
        const receiver = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.06, 0.25),
            materials.metal
        );
        receiver.position.set(0, 0, -0.05);
        this.weaponGroup.add(receiver);

        // 木质护木 (Handguard)
        const handguard = new THREE.Mesh(
            new THREE.BoxGeometry(0.045, 0.05, 0.2),
            materials.wood
        );
        handguard.position.set(0, -0.01, -0.25);
        this.weaponGroup.add(handguard);

        // 枪管
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.015, 0.35, 12),
            materials.metal
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.015, -0.5);
        this.weaponGroup.add(barrel);

        // 消焰器
        const muzzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.015, 0.06, 12),
            materials.metal
        );
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, 0.015, -0.7);
        this.weaponGroup.add(muzzle);

        // 弧形弹匣 (AK特征)
        const magazine = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.15, 0.05),
            materials.metal
        );
        magazine.rotation.x = -0.2;
        magazine.position.set(0, -0.1, -0.05);
        this.weaponGroup.add(magazine);

        // 木质握把
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.1, 0.03),
            materials.wood
        );
        grip.rotation.x = -0.4;
        grip.position.set(0, -0.07, 0.08);
        this.weaponGroup.add(grip);

        // 木质枪托
        const stock = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.06, 0.18),
            materials.wood
        );
        stock.position.set(0, -0.01, 0.2);
        this.weaponGroup.add(stock);

        // 准星
        const frontSight = new THREE.Mesh(
            new THREE.BoxGeometry(0.01, 0.03, 0.01),
            materials.metal
        );
        frontSight.position.set(0, 0.045, -0.55);
        this.weaponGroup.add(frontSight);

        this.createArms();
    }

    // 冲锋枪模型
    createSMGModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.7, roughness: 0.4 }),
            grip: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.7 })
        };

        // 枪身（更紧凑）
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.07, 0.35),
            materials.body
        );
        body.position.set(0, 0, -0.05);
        this.weaponGroup.add(body);

        // 枪管
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.015, 0.2, 8),
            materials.body
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.01, -0.32);
        this.weaponGroup.add(barrel);

        // 弹匣
        const magazine = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.15, 0.04),
            materials.grip
        );
        magazine.position.set(0, -0.11, -0.05);
        this.weaponGroup.add(magazine);

        // 握把
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.08, 0.035),
            materials.grip
        );
        grip.rotation.x = -0.2;
        grip.position.set(0, -0.06, 0.08);
        this.weaponGroup.add(grip);

        this.createArms();
    }

    // 霰弹枪模型
    createShotgunModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, metalness: 0.4, roughness: 0.6 }),
            barrel: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 })
        };

        // 枪身（木质）
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.06, 0.4),
            materials.body
        );
        body.position.set(0, 0, 0);
        this.weaponGroup.add(body);

        // 枪管（双管）
        const barrel1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8),
            materials.barrel
        );
        barrel1.rotation.x = Math.PI / 2;
        barrel1.position.set(-0.015, 0.02, -0.4);
        this.weaponGroup.add(barrel1);

        const barrel2 = barrel1.clone();
        barrel2.position.set(0.015, 0.02, -0.4);
        this.weaponGroup.add(barrel2);

        // 握把
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.1, 0.04),
            materials.body
        );
        grip.rotation.x = -0.4;
        grip.position.set(0, -0.06, 0.15);
        this.weaponGroup.add(grip);

        this.createArms();
    }

    // 狙击枪模型
    createSniperModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x1a2a1a, metalness: 0.6, roughness: 0.4 }),
            barrel: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.9, roughness: 0.2 }),
            scope: new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 })
        };

        // 枪身
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.08, 0.6),
            materials.body
        );
        body.position.set(0, 0, -0.1);
        this.weaponGroup.add(body);

        // 长枪管
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.022, 0.5, 8),
            materials.barrel
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.6);
        this.weaponGroup.add(barrel);

        // 瞄准镜
        const scope = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.2, 12),
            materials.scope
        );
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.07, -0.1);
        this.weaponGroup.add(scope);

        // 弹匣
        const magazine = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.1, 0.08),
            materials.body
        );
        magazine.position.set(0, -0.09, 0);
        this.weaponGroup.add(magazine);

        // 握把
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.1, 0.04),
            materials.body
        );
        grip.rotation.x = -0.3;
        grip.position.set(0, -0.08, 0.2);
        this.weaponGroup.add(grip);

        this.createArms();
    }

    // 手枪模型
    createPistolModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.3 }),
            grip: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.8 })
        };

        // 枪身（紧凑）
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.05, 0.15),
            materials.body
        );
        body.position.set(0, 0, -0.05);
        this.weaponGroup.add(body);

        // 枪管
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.01, 0.08, 8),
            materials.body
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.01, -0.16);
        this.weaponGroup.add(barrel);

        // 握把
        const grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.08, 0.03),
            materials.grip
        );
        grip.rotation.x = -0.3;
        grip.position.set(0, -0.05, 0.02);
        this.weaponGroup.add(grip);

        // 调整手枪位置（更靠近中心）
        this.sway.basePosition.set(0.2, -0.2, -0.35);

        this.createArms();
    }

    // HE手雷模型 (圆形手雷)
    createHEGrenadeModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x2d4a2d, metalness: 0.4, roughness: 0.6 }),
            metal: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8, roughness: 0.3 }),
            lever: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.7, roughness: 0.4 })
        };

        // 手雷主体 (椭圆形)
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 16, 12),
            materials.body
        );
        body.scale.set(0.8, 1, 0.8);
        body.position.set(0, 0, -0.05);
        this.weaponGroup.add(body);

        // 顶部金属头
        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.025, 0.03, 12),
            materials.metal
        );
        top.position.set(0, 0.045, -0.05);
        this.weaponGroup.add(top);

        // 保险杆
        const lever = new THREE.Mesh(
            new THREE.BoxGeometry(0.008, 0.06, 0.015),
            materials.lever
        );
        lever.position.set(0.02, 0.02, -0.05);
        lever.rotation.z = 0.2;
        this.weaponGroup.add(lever);

        // 拉环
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.012, 0.003, 8, 16),
            materials.metal
        );
        ring.position.set(0, 0.06, -0.05);
        ring.rotation.x = Math.PI / 2;
        this.weaponGroup.add(ring);

        // 调整位置
        this.sway.basePosition.set(0.15, -0.15, -0.3);
        this.createGrenadeArm();
    }

    // 闪光弹模型 (圆柱形)
    createFlashbangModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x4a4a5a, metalness: 0.6, roughness: 0.4 }),
            stripe: new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.5, roughness: 0.5 }),
            metal: new THREE.MeshStandardMaterial({ color: 0x5a5a5a, metalness: 0.8, roughness: 0.3 })
        };

        // 主体 (圆柱形)
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16),
            materials.body
        );
        body.position.set(0, 0, -0.05);
        this.weaponGroup.add(body);

        // 条纹装饰
        const stripe1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.031, 0.031, 0.015, 16),
            materials.stripe
        );
        stripe1.position.set(0, 0.02, -0.05);
        this.weaponGroup.add(stripe1);

        const stripe2 = stripe1.clone();
        stripe2.position.set(0, -0.02, -0.05);
        this.weaponGroup.add(stripe2);

        // 顶部机关
        const top = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.02, 0.02, 12),
            materials.metal
        );
        top.position.set(0, 0.05, -0.05);
        this.weaponGroup.add(top);

        // 保险杆
        const lever = new THREE.Mesh(
            new THREE.BoxGeometry(0.006, 0.05, 0.012),
            materials.metal
        );
        lever.position.set(0.018, 0.025, -0.05);
        lever.rotation.z = 0.15;
        this.weaponGroup.add(lever);

        // 调整位置
        this.sway.basePosition.set(0.15, -0.15, -0.3);
        this.createGrenadeArm();
    }

    // 烟雾弹模型 (较长的圆柱形)
    createSmokeGrenadeModel() {
        const materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x5a6a5a, metalness: 0.3, roughness: 0.7 }),
            cap: new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.5, roughness: 0.5 }),
            metal: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.7, roughness: 0.4 })
        };

        // 主体 (较长圆柱形)
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.1, 16),
            materials.body
        );
        body.position.set(0, 0, -0.05);
        this.weaponGroup.add(body);

        // 顶盖
        const topCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.026, 0.026, 0.015, 16),
            materials.cap
        );
        topCap.position.set(0, 0.055, -0.05);
        this.weaponGroup.add(topCap);

        // 底盖
        const bottomCap = topCap.clone();
        bottomCap.position.set(0, -0.055, -0.05);
        this.weaponGroup.add(bottomCap);

        // 拉环支架
        const mount = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.015, 0.008),
            materials.metal
        );
        mount.position.set(0, 0.065, -0.05);
        this.weaponGroup.add(mount);

        // 拉环
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.01, 0.002, 8, 16),
            materials.metal
        );
        ring.position.set(0, 0.075, -0.05);
        ring.rotation.x = Math.PI / 2;
        this.weaponGroup.add(ring);

        // 调整位置
        this.sway.basePosition.set(0.15, -0.15, -0.3);
        this.createGrenadeArm();
    }

    // 创建投掷物手臂 (单手持握)
    createGrenadeArm() {
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a574,
            metalness: 0.1,
            roughness: 0.8
        });
        const sleeveMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            metalness: 0.2,
            roughness: 0.7
        });

        // 右手 (握住手雷)
        const rightHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.04, 0.07),
            skinMaterial
        );
        rightHand.position.set(0, -0.03, 0);
        this.weaponGroup.add(rightHand);

        // 右前臂
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.055, 0.15),
            sleeveMaterial
        );
        rightArm.position.set(0.06, -0.05, 0.1);
        rightArm.rotation.y = 0.2;
        this.weaponGroup.add(rightArm);
    }

    // 创建手臂
    createArms() {
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4a574,
            metalness: 0.1,
            roughness: 0.8
        });
        const sleeveMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            metalness: 0.2,
            roughness: 0.7
        });

        // 右手
        const rightHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.04, 0.08),
            skinMaterial
        );
        rightHand.position.set(0, -0.04, 0.05);
        this.weaponGroup.add(rightHand);

        // 右前臂
        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.06, 0.15),
            sleeveMaterial
        );
        rightArm.position.set(0.08, -0.06, 0.15);
        rightArm.rotation.y = 0.3;
        this.weaponGroup.add(rightArm);

        // 左手（扶枪）
        const leftHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.035, 0.07),
            skinMaterial
        );
        leftHand.position.set(0, -0.02, -0.2);
        this.weaponGroup.add(leftHand);

        // 左前臂
        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.05, 0.12),
            sleeveMaterial
        );
        leftArm.position.set(-0.1, -0.04, -0.15);
        leftArm.rotation.y = -0.4;
        this.weaponGroup.add(leftArm);
    }

    // 播放动画
    playAnimation(type) {
        if (this.animations[type]) {
            this.animations[type].active = true;
            this.animations[type].time = 0;
        }
    }

    // 开火动画
    playFireAnimation() {
        this.playAnimation('fire');
        this.recoil.current.set(0, 0.02, 0.05);
    }

    // 换弹动画
    playReloadAnimation(duration) {
        this.animations.reload.duration = duration || 2.0;
        this.playAnimation('reload');
    }

    // 更新
    update(deltaTime, playerMoving, isReloading) {
        if (!this.weaponGroup) return;

        // 更新武器晃动
        if (playerMoving) {
            this.sway.intensity = Math.min(this.sway.intensity + deltaTime * 3, 1);
        } else {
            this.sway.intensity = Math.max(this.sway.intensity - deltaTime * 5, 0);
        }

        this.sway.time += deltaTime * 8;

        const swayX = Math.sin(this.sway.time) * 0.01 * this.sway.intensity;
        const swayY = Math.sin(this.sway.time * 2) * 0.005 * this.sway.intensity;

        // 基础位置
        let targetPos = this.sway.basePosition.clone();
        targetPos.x += swayX;
        targetPos.y += swayY;

        // 后坐力恢复
        this.recoil.current.lerp(new THREE.Vector3(0, 0, 0), this.recoil.recovery * deltaTime);
        targetPos.add(this.recoil.current);

        // 开火动画
        if (this.animations.fire.active) {
            this.animations.fire.time += deltaTime;
            const t = this.animations.fire.time / this.animations.fire.duration;
            if (t >= 1) {
                this.animations.fire.active = false;
            }
        }

        // 换弹动画
        if (this.animations.reload.active || isReloading) {
            this.animations.reload.active = true;
            this.animations.reload.time += deltaTime;
            const t = this.animations.reload.time / this.animations.reload.duration;

            if (t < 0.3) {
                // 武器下移
                const phase = t / 0.3;
                targetPos.y -= 0.15 * phase;
                this.weaponGroup.rotation.x = -0.5 * phase;
            } else if (t < 0.7) {
                // 保持换弹姿势
                targetPos.y -= 0.15;
                this.weaponGroup.rotation.x = -0.5;
            } else if (t < 1) {
                // 武器上移
                const phase = (t - 0.7) / 0.3;
                targetPos.y -= 0.15 * (1 - phase);
                this.weaponGroup.rotation.x = -0.5 * (1 - phase);
            } else {
                this.animations.reload.active = false;
                this.animations.reload.time = 0;
                this.weaponGroup.rotation.x = 0;
            }
        }

        // 切换武器动画
        if (this.animations.switchWeapon.active) {
            this.animations.switchWeapon.time += deltaTime;
            const t = this.animations.switchWeapon.time / this.animations.switchWeapon.duration;

            if (t < 0.5) {
                // 武器从下方升起
                const phase = t / 0.5;
                targetPos.y -= 0.3 * (1 - phase);
            } else if (t >= 1) {
                this.animations.switchWeapon.active = false;
            }
        }

        // 应用位置
        this.weaponGroup.position.lerp(targetPos, 10 * deltaTime);
    }

    // 窗口大小改变
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    // 隐藏武器（开镜时）
    setVisible(visible) {
        if (this.weaponGroup) {
            this.weaponGroup.visible = visible;
        }
    }
}
