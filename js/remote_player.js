// FrostBite Arena - 远程玩家渲染
class RemotePlayer {
    constructor(scene, playerId, playerName, team, position) {
        this.scene = scene;
        this.id = playerId;
        this.name = playerName;
        this.team = team;

        // 位置和朝向
        this.position = position ? position.clone() : new THREE.Vector3(0, 1, 0);
        this.targetPosition = this.position.clone();
        this.rotation = { yaw: 0, pitch: 0 };
        this.targetRotation = { yaw: 0, pitch: 0 };

        // 状态
        this.health = 100;
        this.isAlive = true;
        this.isCrouching = false;

        // 碰撞
        this.headRadius = 0.2;
        this.bodyRadius = 0.4;

        // 插值平滑
        this.lerpSpeed = 10;

        this.createModel();
    }

    createModel() {
        // 身体
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 12);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.team === 'blue' ? 0x4488ff : 0xff4444,
            roughness: 0.6
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // 头部
        const headGeometry = new THREE.SphereGeometry(0.2, 12, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffccaa,
            roughness: 0.8
        });
        this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
        this.headMesh.position.y = 0.9;
        this.mesh.add(this.headMesh);

        // 武器
        const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.6);
        const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gunMesh.position.set(0.35, 0.2, -0.3);
        this.mesh.add(this.gunMesh);

        // 名字标签
        this.createNameLabel();

        this.updateMeshPosition();
        this.scene.add(this.mesh);
    }

    createNameLabel() {
        // 创建Canvas绘制名字
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.roundRect(0, 0, 256, 64, 8);
        ctx.fill();

        // 文字
        ctx.fillStyle = this.team === 'blue' ? '#4488ff' : '#ff4444';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name.substring(0, 12), 128, 32);

        // 创建纹理
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // 创建Sprite - 启用深度测试，被墙遮挡
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });
        this.nameSprite = new THREE.Sprite(spriteMaterial);
        this.nameSprite.scale.set(2, 0.5, 1);
        this.nameSprite.position.y = 1.5;
        this.mesh.add(this.nameSprite);
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        // 平滑插值位置
        this.position.lerp(this.targetPosition, this.lerpSpeed * deltaTime);

        // 平滑插值旋转
        this.rotation.yaw += (this.targetRotation.yaw - this.rotation.yaw) * this.lerpSpeed * deltaTime;
        this.rotation.pitch += (this.targetRotation.pitch - this.rotation.pitch) * this.lerpSpeed * deltaTime;

        this.updateMeshPosition();
    }

    updateMeshPosition() {
        this.mesh.position.copy(this.position);
        this.mesh.position.y -= 0.3;
        this.mesh.rotation.y = this.rotation.yaw;

        // 模型可见性
        this.mesh.visible = this.isAlive;
    }

    // 更新远程状态
    updateState(state) {
        if (state.position) {
            this.targetPosition.set(state.position.x, state.position.y, state.position.z);
        }
        if (state.rotation) {
            this.targetRotation.yaw = state.rotation.yaw;
            this.targetRotation.pitch = state.rotation.pitch;
        }
        if (state.health !== undefined) {
            this.health = state.health;
        }
        if (state.isAlive !== undefined) {
            this.isAlive = state.isAlive;
            this.mesh.visible = this.isAlive;
        }
        if (state.isCrouching !== undefined) {
            this.isCrouching = state.isCrouching;
            // 蹲下时降低高度
            this.mesh.scale.y = this.isCrouching ? 0.7 : 1;
        }
    }

    // 显示射击效果
    showShoot(origin, direction) {
        const start = new THREE.Vector3(origin.x, origin.y, origin.z);
        const dir = new THREE.Vector3(direction.x, direction.y, direction.z);
        const end = start.clone().add(dir.multiplyScalar(50));

        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const color = this.team === 'blue' ? 0x00aaff : 0xff6600;
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
            material.dispose();
        }, 100);
    }

    takeDamage(amount, isHeadshot) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    die() {
        this.isAlive = false;
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = 0.3;
    }

    respawn(position) {
        this.isAlive = true;
        this.health = 100;
        this.position.copy(position);
        this.targetPosition.copy(position);
        this.mesh.rotation.x = 0;
        this.updateMeshPosition();
    }

    getHeadPosition() {
        return new THREE.Vector3(
            this.position.x,
            this.position.y + 0.6,
            this.position.z
        );
    }

    checkHit(origin, direction, maxDistance) {
        if (!this.isAlive) return null;

        const headPos = this.getHeadPosition();
        const headHit = this.rayIntersectsSphere(origin, direction, headPos, this.headRadius, maxDistance);
        if (headHit) {
            return { distance: headHit, isHeadshot: true };
        }

        const bodyHit = this.rayIntersectsSphere(origin, direction, this.position, this.bodyRadius, maxDistance);
        if (bodyHit) {
            return { distance: bodyHit, isHeadshot: false };
        }

        return null;
    }

    rayIntersectsSphere(origin, direction, center, radius, maxDistance) {
        const oc = origin.clone().sub(center);
        const a = direction.dot(direction);
        const b = 2.0 * oc.dot(direction);
        const c = oc.dot(oc) - radius * radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) return null;

        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (t > 0 && t < maxDistance) {
            return t;
        }
        return null;
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            // 清理几何体和材质
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
        }
    }
}
