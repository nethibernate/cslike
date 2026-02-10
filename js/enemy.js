// FrostBite Arena - 智能AI机器人系统
// 优先搜索并击杀敌人

class Bot {
    constructor(scene, position, team = 'red', strategy = 'balanced', gameMap = null) {
        this.scene = scene;
        this.team = team;
        this.gameMap = gameMap;
        this.id = Math.random().toString(36).substr(2, 9);
        this.strategy = strategy;

        // 位置和朝向
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.lookDirection = new THREE.Vector3(0, 0, team === 'red' ? 1 : -1);

        // 状态
        this.health = 100;
        this.armor = 0;
        this.isAlive = true;
        this.isMoving = false;

        // AI状态 - 更激进的行为
        this.state = 'hunt'; // hunt, engage, attack, flee
        this.target = null;
        this.lastKnownEnemyPos = null;
        this.stateTimer = 0;
        this.huntTimer = 0;

        // 巡逻
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;

        // 应用策略参数
        this.applyStrategy();

        // 武器
        this.weapon = createWeapon('frostbite_rifle');
        this.lastFireTime = 0;

        // 移动参数
        this.baseSpeed = 4.5;
        this.turnSpeed = 8;

        // 碰撞
        this.headRadius = 0.2;
        this.bodyRadius = 0.4;

        // 记忆系统 - 记住敌人位置
        this.enemyMemory = new Map();
        this.memoryDuration = 5; // 5秒记忆

        this.createModel();
    }

    applyStrategy() {
        switch (this.strategy) {
            case 'aggressive':
                // 激进型：高精准，快反应，不逃跑
                this.aimAccuracy = 0.85 + Math.random() * 0.1;
                this.reactionTime = 0.1 + Math.random() * 0.1;
                this.fleeThreshold = 0; // 永不逃跑
                this.preferredRange = 12;
                this.baseSpeed = 5;
                break;
            case 'defensive':
                // 防守型：远程精准
                this.aimAccuracy = 0.75 + Math.random() * 0.15;
                this.reactionTime = 0.2 + Math.random() * 0.2;
                this.fleeThreshold = 40;
                this.preferredRange = 20;
                break;
            case 'flanker':
                // 侧翼型：快速接近
                this.aimAccuracy = 0.8 + Math.random() * 0.1;
                this.reactionTime = 0.15 + Math.random() * 0.15;
                this.fleeThreshold = 25;
                this.preferredRange = 8;
                this.baseSpeed = 5.5;
                break;
            case 'balanced':
            default:
                // 均衡型
                this.aimAccuracy = 0.75 + Math.random() * 0.15;
                this.reactionTime = 0.15 + Math.random() * 0.2;
                this.fleeThreshold = 25;
                this.preferredRange = 15;
                break;
        }
        this.reactionTimer = 0;
    }

    createModel() {
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.team === 'red' ? 0xff4444 : 0x4488ff,
            roughness: 0.7
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

        const headGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffccaa,
            roughness: 0.8
        });
        this.headMesh = new THREE.Mesh(headGeometry, headMaterial);
        this.headMesh.position.y = 0.9;
        this.mesh.add(this.headMesh);

        const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gunMesh.position.set(0.3, 0.2, -0.3);
        this.mesh.add(this.gunMesh);

        if (this.team === 'blue') {
            const markerGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.y = 1.3;
            marker.rotation.x = Math.PI;
            this.mesh.add(marker);
        }

        this.updateMeshPosition();
        this.scene.add(this.mesh);
    }

    updateMeshPosition() {
        this.mesh.position.copy(this.position);
        this.mesh.position.y -= 0.3;

        if (this.lookDirection.lengthSq() > 0) {
            const angle = Math.atan2(this.lookDirection.x, this.lookDirection.z);
            this.mesh.rotation.y = angle;
        }
    }

    update(deltaTime, targets, allies, collisionCallback) {
        if (!this.isAlive) return;

        // 更新武器
        if (this.weapon) {
            this.weapon.updateSpread(deltaTime);
            if (this.weapon.isReloading) {
                this.weapon.updateReload(deltaTime);
            }
        }

        // 清理过期的敌人记忆
        this.cleanMemory(deltaTime);

        // AI决策
        this.updateAI(deltaTime, targets, allies);

        // 移动
        this.updateMovement(deltaTime, collisionCallback);

        // 更新模型
        this.updateMeshPosition();
    }

    cleanMemory(deltaTime) {
        for (const [id, data] of this.enemyMemory) {
            data.age += deltaTime;
            if (data.age > this.memoryDuration) {
                this.enemyMemory.delete(id);
            }
        }
    }

    findBestTarget(targets) {
        let bestTarget = null;
        let bestScore = -Infinity;

        for (const target of targets) {
            if (!target || !target.isAlive) continue;
            if (target.team === this.team) continue;

            const canSee = this.canSeeTarget(target);
            const dist = this.position.distanceTo(target.position);

            // 计算目标优先级分数
            let score = 0;

            if (canSee) {
                score += 100; // 可见的目标优先
                score -= dist; // 近的更优先

                // 低血量目标优先
                if (target.health && target.health < 50) {
                    score += 30;
                }

                // 记住这个敌人位置
                this.enemyMemory.set(target.id || 'player', {
                    position: target.position.clone(),
                    age: 0
                });
            } else {
                // 即使看不到，如果我们记得这个敌人，也给它一定分数
                const memory = this.enemyMemory.get(target.id || 'player');
                if (memory) {
                    score += 20 - memory.age * 2;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestTarget = { target, canSee, score };
            }
        }

        return bestTarget;
    }

    updateAI(deltaTime, targets, allies) {
        this.stateTimer += deltaTime;
        this.huntTimer += deltaTime;

        // 找最佳目标
        const bestTarget = this.findBestTarget(targets);

        switch (this.state) {
            case 'hunt':
                // 主动搜索敌人
                this.updateHunt(deltaTime, bestTarget);
                break;

            case 'engage':
                // 接近并准备攻击
                this.updateEngage(deltaTime, bestTarget);
                break;

            case 'attack':
                // 攻击目标
                this.updateAttack(deltaTime, bestTarget);
                break;

            case 'flee':
                // 逃跑（只有低血量时）
                this.updateFlee(deltaTime, bestTarget);
                break;
        }
    }

    updateHunt(deltaTime, bestTarget) {
        if (bestTarget && bestTarget.canSee) {
            // 发现可见目标！切换到接近模式
            this.target = bestTarget.target;
            this.reactionTimer = this.reactionTime;
            this.state = 'engage';
            this.stateTimer = 0;
            return;
        }

        // 检查是否有记忆中的敌人位置
        if (this.enemyMemory.size > 0) {
            // 移动到最近的记忆位置
            let nearestMem = null;
            let nearestDist = Infinity;

            for (const [id, data] of this.enemyMemory) {
                const dist = this.position.distanceTo(data.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestMem = data;
                }
            }

            if (nearestMem && nearestDist > 2) {
                this.moveTowards(nearestMem.position, deltaTime);
                return;
            }
        }

        // 没有记忆，主动巡逻搜索
        this.updatePatrol(deltaTime);
    }

    updateEngage(deltaTime, bestTarget) {
        if (!this.target || !this.target.isAlive) {
            this.state = 'hunt';
            this.target = null;
            return;
        }

        if (bestTarget && bestTarget.canSee && bestTarget.target === this.target) {
            // 目标可见
            this.lastKnownEnemyPos = this.target.position.clone();
            this.reactionTimer -= deltaTime;

            const dist = this.position.distanceTo(this.target.position);

            if (this.reactionTimer <= 0) {
                // 反应完成，开始攻击
                if (dist < 35) {
                    this.state = 'attack';
                    this.stateTimer = 0;
                }
            }

            // 接近到理想距离
            if (dist > this.preferredRange + 5) {
                this.moveTowards(this.target.position, deltaTime);
            } else if (dist < this.preferredRange - 5 && this.strategy === 'defensive') {
                // 防守型保持距离
                const awayDir = this.position.clone().sub(this.target.position).normalize();
                const retreatPos = this.position.clone().add(awayDir.multiplyScalar(5));
                this.moveTowards(retreatPos, deltaTime);
            }

            this.lookAt(this.target.position);
        } else {
            // 目标不可见了，尝试追踪
            if (this.lastKnownEnemyPos) {
                const dist = this.position.distanceTo(this.lastKnownEnemyPos);
                if (dist < 2) {
                    // 到达最后位置，搜索
                    this.lastKnownEnemyPos = null;
                    this.state = 'hunt';
                } else {
                    this.moveTowards(this.lastKnownEnemyPos, deltaTime);
                }
            } else {
                this.state = 'hunt';
            }
        }
    }

    updateAttack(deltaTime, bestTarget) {
        if (!this.target || !this.target.isAlive) {
            this.state = 'hunt';
            this.target = null;
            return;
        }

        if (bestTarget && bestTarget.canSee && bestTarget.target === this.target) {
            this.lastKnownEnemyPos = this.target.position.clone();
            this.lookAt(this.target.position);

            const dist = this.position.distanceTo(this.target.position);

            // 边移动边射击
            if (this.strategy === 'aggressive') {
                if (dist > 8) {
                    this.moveTowards(this.target.position, deltaTime);
                }
            } else if (this.strategy === 'flanker') {
                // 侧翼移动
                const perpDir = new THREE.Vector3(
                    -this.lookDirection.z,
                    0,
                    this.lookDirection.x
                ).normalize();
                const strafePos = this.position.clone().add(perpDir.multiplyScalar(3));
                this.moveTowards(strafePos, deltaTime);
            }

            // 持续射击
            this.tryShoot(this.target);

            // 检查是否需要逃跑
            if (this.health < this.fleeThreshold && this.fleeThreshold > 0) {
                this.state = 'flee';
                this.stateTimer = 0;
            }
        } else {
            // 目标消失，尝试追踪
            this.state = 'engage';
        }
    }

    updateFlee(deltaTime, bestTarget) {
        if (this.target && this.target.isAlive) {
            const awayDir = this.position.clone().sub(this.target.position).normalize();
            const fleeTarget = this.position.clone().add(awayDir.multiplyScalar(15));
            this.moveTowards(fleeTarget, deltaTime);
        }

        // 逃跑3秒后重新战斗
        if (this.stateTimer > 3) {
            this.state = 'hunt';
            this.stateTimer = 0;
        }
    }

    updatePatrol(deltaTime) {
        // 检测是否卡住（位置长时间没变化）
        if (!this.lastPatrolPos) {
            this.lastPatrolPos = this.position.clone();
            this.stuckTimer = 0;
        }

        const moved = this.position.distanceTo(this.lastPatrolPos);
        if (moved < 0.1) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
            this.lastPatrolPos.copy(this.position);
        }

        // 卡住超过1秒，换一个方向/目标
        if (this.stuckTimer > 1) {
            this.stuckTimer = 0;
            // 选择一个新的随机巡逻点
            if (this.patrolPoints.length > 0) {
                this.currentPatrolIndex = Math.floor(Math.random() * this.patrolPoints.length);
            }
            // 随机转向尝试脱离
            const randomAngle = (Math.random() - 0.5) * Math.PI;
            const newDir = new THREE.Vector3(
                Math.cos(randomAngle),
                0,
                Math.sin(randomAngle)
            );
            this.lookDirection.copy(newDir);
        }

        if (this.patrolPoints.length === 0) {
            // 随机移动搜索
            if (this.huntTimer > 1.5) {
                const randomDir = new THREE.Vector3(
                    Math.random() - 0.5,
                    0,
                    Math.random() - 0.5
                ).normalize();
                this.lookDirection.lerp(randomDir, 0.3);
                this.lookDirection.normalize();
                this.huntTimer = 0;
            }

            // 向前移动
            this.velocity.x = this.lookDirection.x * this.baseSpeed * 0.7;
            this.velocity.z = this.lookDirection.z * this.baseSpeed * 0.7;
            this.isMoving = true;
            return;
        }

        const target = this.patrolPoints[this.currentPatrolIndex];
        const dist = this.position.distanceTo(target);

        if (dist < 2.5) {
            // 到达目标点，选择下一个
            // 倾向于选择不同方向的点，实现多路径巡逻
            this.selectNextPatrolPoint();
        } else {
            this.moveTowardsWithAvoidance(target, deltaTime);
        }
    }

    // 选择下一个巡逻点 - 更智能的路径选择
    selectNextPatrolPoint() {
        if (this.patrolPoints.length <= 1) return;

        const currentDir = this.lookDirection.clone();
        let bestIndex = -1;
        let bestScore = -Infinity;

        // 记录最近访问的点（避免来回走）
        if (!this.recentPoints) this.recentPoints = [];
        this.recentPoints.push(this.currentPatrolIndex);
        if (this.recentPoints.length > 5) {
            this.recentPoints.shift();
        }

        // 评估所有巡逻点
        for (let i = 0; i < this.patrolPoints.length; i++) {
            if (i === this.currentPatrolIndex) continue;

            const point = this.patrolPoints[i];
            const toPoint = point.clone().sub(this.position);
            toPoint.y = 0;
            const dist = toPoint.length();

            if (dist < 3) continue; // 太近的点跳过

            toPoint.normalize();

            // 计算分数
            let score = 0;

            // 距离评分：倾向于中等距离
            if (dist > 8 && dist < 20) {
                score += 25;
            } else if (dist > 5 && dist < 30) {
                score += 15;
            } else if (dist > 3) {
                score += 5;
            }

            // 惩罚最近访问过的点
            if (this.recentPoints.includes(i)) {
                score -= 30;
            }

            // 方向评分：优先侧方和前斜方向
            const dotProduct = currentDir.dot(toPoint);
            if (dotProduct > 0.3 && dotProduct < 0.8) {
                // 斜前方最佳
                score += 20;
            } else if (dotProduct > -0.2 && dotProduct <= 0.3) {
                // 侧方次佳
                score += 15;
            } else if (dotProduct > 0.8) {
                // 正前方
                score += 10;
            } else if (dotProduct < -0.5) {
                // 反方向惩罚
                score -= 15;
            }

            // 如果有最后已知的敌人位置，倾向于接近那个方向
            if (this.lastKnownEnemyPos) {
                const toEnemy = this.lastKnownEnemyPos.clone().sub(this.position).normalize();
                const pointTowardEnemy = toPoint.dot(toEnemy);
                if (pointTowardEnemy > 0.5) {
                    score += 15;
                }
            }

            // 随机性（保持一定不可预测性）
            score += Math.random() * 12;

            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }

        if (bestIndex >= 0) {
            this.currentPatrolIndex = bestIndex;
        } else {
            // 没有好的选择，完全随机
            this.currentPatrolIndex = Math.floor(Math.random() * this.patrolPoints.length);
        }
    }

    // 带避障的移动
    moveTowardsWithAvoidance(target, deltaTime) {
        const dir = target.clone().sub(this.position);
        dir.y = 0;

        if (dir.lengthSq() > 0.01) {
            dir.normalize();

            // 检测前方是否有墙（简单的射线检测）
            if (this.gameMap) {
                const eyePos = this.getHeadPosition();
                const checkResult = this.gameMap.raycast(eyePos, dir, 2);

                if (checkResult) {
                    // 前方有墙，尝试侧移
                    // 随机选择左或右
                    const sideDir = new THREE.Vector3();
                    if (Math.random() > 0.5) {
                        sideDir.set(-dir.z, 0, dir.x); // 左转90度
                    } else {
                        sideDir.set(dir.z, 0, -dir.x); // 右转90度
                    }
                    sideDir.normalize();

                    // 混合方向：侧向 + 少量前进
                    dir.lerp(sideDir, 0.7);
                    dir.normalize();
                }
            }

            // 快速转向
            this.lookDirection.lerp(dir, this.turnSpeed * deltaTime);
            this.lookDirection.normalize();

            this.velocity.x = this.lookDirection.x * this.baseSpeed;
            this.velocity.z = this.lookDirection.z * this.baseSpeed;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    moveTowards(target, deltaTime) {
        const dir = target.clone().sub(this.position);
        dir.y = 0;

        if (dir.lengthSq() > 0.01) {
            dir.normalize();

            // 快速转向
            this.lookDirection.lerp(dir, this.turnSpeed * deltaTime);
            this.lookDirection.normalize();

            this.velocity.x = this.lookDirection.x * this.baseSpeed;
            this.velocity.z = this.lookDirection.z * this.baseSpeed;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    lookAt(target) {
        const dir = target.clone().sub(this.position);
        dir.y = 0;
        if (dir.lengthSq() > 0) {
            this.lookDirection.copy(dir.normalize());
        }
    }

    updateMovement(deltaTime, collisionCallback) {
        if (!this.isMoving) {
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }

        const newPosition = this.position.clone();
        newPosition.x += this.velocity.x * deltaTime;
        newPosition.z += this.velocity.z * deltaTime;

        if (collisionCallback) {
            const result = collisionCallback(this.position, newPosition, this.bodyRadius);
            newPosition.copy(result.position);
        }

        newPosition.y = 1.0;
        this.position.copy(newPosition);
    }

    canSeeTarget(target) {
        if (!target) return false;
        if (target.isAlive === false) return false;

        const myEyePos = this.getHeadPosition();

        // 获取目标位置，考虑蹲下状态
        let targetPos;
        if (target.position) {
            targetPos = target.position.clone();
            // 如果目标正在蹲下，降低检测高度
            if (target.isCrouching) {
                targetPos.y += 0.3;  // 蹲下时目标更矮
            } else {
                targetPos.y += 0.9;  // 正常站立时的身体中心
            }
        } else {
            return false;
        }

        const dist = myEyePos.distanceTo(targetPos);
        if (dist > 45) return false;
        if (dist < 0.5) return true;

        // 更宽的视野 - 150度
        const toTarget = targetPos.clone().sub(myEyePos).normalize();
        const forward = this.lookDirection.clone();
        forward.y = 0;
        forward.normalize();

        const toTargetFlat = new THREE.Vector3(toTarget.x, 0, toTarget.z).normalize();
        const dot = forward.dot(toTargetFlat);

        // cos(75°) ≈ 0.26
        if (dot < 0.25) return false;

        // 墙壁遮挡检查 - 使用多点检测提高精度
        if (this.gameMap && this.gameMap.raycast) {
            // 检测点1：目标身体中心
            const direction1 = toTarget;
            const wallHit1 = this.gameMap.raycast(myEyePos, direction1, dist);
            if (wallHit1 && wallHit1.distance < dist - 0.5) {
                // 检测点2：目标头部
                const headPos = target.position.clone();
                headPos.y += target.isCrouching ? 0.8 : 1.6;
                const toHead = headPos.clone().sub(myEyePos).normalize();
                const headDist = myEyePos.distanceTo(headPos);
                const wallHit2 = this.gameMap.raycast(myEyePos, toHead, headDist);

                if (wallHit2 && wallHit2.distance < headDist - 0.5) {
                    // 检测点3：目标脚部（只有当前两个点都被遮挡时才检查）
                    const feetPos = target.position.clone();
                    feetPos.y += 0.3;
                    const toFeet = feetPos.clone().sub(myEyePos).normalize();
                    const feetDist = myEyePos.distanceTo(feetPos);
                    const wallHit3 = this.gameMap.raycast(myEyePos, toFeet, feetDist);

                    if (wallHit3 && wallHit3.distance < feetDist - 0.5) {
                        return false;  // 三个点都被遮挡，确定看不到
                    }
                }
            }
        }

        return true;
    }

    tryShoot(target) {
        if (!this.weapon || this.weapon.isReloading) return;

        const now = performance.now();
        if (!this.weapon.canShoot(now)) return;

        if (this.weapon.currentMag <= 0) {
            this.weapon.startReload();
            return;
        }

        this.weapon.shoot(now);
        audioManager.play('shoot_rifle');

        // 计算弹道 - 从枪口到目标或最大距离
        const origin = this.getHeadPosition();
        origin.y -= 0.3; // 枪口位置略低
        const direction = target.position.clone().sub(origin).normalize();

        // 添加一些散布
        const spread = (1 - this.aimAccuracy) * 0.1;
        direction.x += (Math.random() - 0.5) * spread;
        direction.y += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();

        const dist = this.position.distanceTo(target.position);
        const endPoint = origin.clone().add(direction.clone().multiplyScalar(dist + 5));

        // 创建弹道线
        this.createTracer(origin, endPoint);

        // 命中计算
        let hitChance = this.aimAccuracy;
        hitChance *= Math.max(0.5, 1 - dist / 80);
        if (this.isMoving) hitChance *= 0.85;

        if (Math.random() < hitChance) {
            const isHeadshot = Math.random() < 0.15;
            const damage = isHeadshot ?
                this.weapon.data.damage * this.weapon.data.headshotMultiplier :
                this.weapon.data.damage;

            if (target.takeDamage) {
                target.takeDamage(damage, isHeadshot);
            }
        }
    }

    // 创建弹道线
    createTracer(start, end) {
        const points = [start.clone(), end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const color = this.team === 'red' ? 0xff6600 : 0x00aaff; // 红队橙色，蓝队蓝色
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // 0.1秒后移除
        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
            material.dispose();
        }, 100);
    }

    takeDamage(amount, isHeadshot = false) {
        if (!this.isAlive) return false;

        let actualDamage = amount;
        if (this.armor > 0) {
            const armorDamage = amount * 0.5;
            const armorReduction = Math.min(armorDamage, this.armor);
            this.armor -= armorReduction;
            actualDamage = amount - armorReduction;
        }

        this.health -= actualDamage;

        // 受到攻击立即进入战斗状态
        if (this.state === 'hunt') {
            this.state = 'engage';
        }

        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    die() {
        this.isAlive = false;

        if (this.mesh) {
            this.mesh.rotation.x = -Math.PI / 2;
            this.mesh.position.y = 0.3;
        }

        setTimeout(() => {
            if (this.mesh && this.scene) {
                this.scene.remove(this.mesh);
            }
        }, 3000);
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
}

const Enemy = Bot;
