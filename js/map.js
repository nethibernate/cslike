// FrostBite Arena - 配置驱动的地图系统
class GameMap {
    constructor(scene, mapId = 'fy_iceworld') {
        this.scene = scene;
        this.mapId = mapId;
        this.config = getMapConfig(mapId);
        this.walls = [];
        this.spawnPoints = {
            blue: [],
            red: []
        };
        this.weaponSpawns = [];
        this.meshes = []; // 用于清理

        this.createMap();
    }

    createMap() {
        const config = this.config;
        const halfSize = config.size / 2;
        const blockOffset = (config.blockSize + config.corridorWidth) / 2;

        // 创建材质
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.floor,
            roughness: 0.5,
            metalness: 0.0
        });

        const blockMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.block,
            roughness: 0.3,
            metalness: 0.1
        });

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.wall,
            roughness: 0.4,
            metalness: 0.2,
            transparent: true,
            opacity: 0.7
        });

        const crateMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.crate,
            roughness: 0.8,
            metalness: 0.0
        });

        // 额外材质（用于新物体类型）
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.platform || config.colors.block,
            roughness: 0.4,
            metalness: 0.3
        });

        const cylinderMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.cylinder || 0x884422,
            roughness: 0.6,
            metalness: 0.4
        });

        const rampMaterial = new THREE.MeshStandardMaterial({
            color: config.colors.ramp || config.colors.floor,
            roughness: 0.5,
            metalness: 0.1
        });

        // 地板
        const floorGeometry = new THREE.PlaneGeometry(config.size, config.size);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);

        // 外墙
        this.createWall(-halfSize, 0, 0, 0.3, 4, config.size, wallMaterial);
        this.createWall(halfSize, 0, 0, 0.3, 4, config.size, wallMaterial);
        this.createWall(0, 0, -halfSize, config.size, 4, 0.3, wallMaterial);
        this.createWall(0, 0, halfSize, config.size, 4, 0.3, wallMaterial);

        // 方块
        const blockHeight = 3.5;
        config.blocks.forEach(block => {
            const scale = block.scale || 1;
            const w = config.blockSize * scale;
            const x = block.offsetX * blockOffset;
            const z = block.offsetZ * blockOffset;
            this.createBlock(x, 0, z, w, blockHeight, w, blockMaterial);
        });

        // 木箱
        const crateSize = 1.5;
        config.crates.forEach(crate => {
            this.createCrate(crate.x, 0, crate.z, crateSize, crateMaterial);
        });

        // 高台平台
        if (config.platforms) {
            config.platforms.forEach(p => {
                this.createPlatform(p.x, 0, p.z, p.width, p.height, p.depth, platformMaterial);
            });
        }

        // 斜坡
        if (config.ramps) {
            config.ramps.forEach(r => {
                this.createRamp(r.x, 0, r.z, r.width, r.height, r.length, r.rotation || 0, rampMaterial);
            });
        }

        // 圆柱形掩体
        if (config.cylinders) {
            config.cylinders.forEach(c => {
                this.createCylinder(c.x, 0, c.z, c.radius, c.height, cylinderMaterial);
            });
        }

        // L形墙体
        if (config.lShapes) {
            config.lShapes.forEach(l => {
                this.createLShape(l.x, 0, l.z, l.armLength, l.armWidth, l.height, l.rotation || 0, blockMaterial);
            });
        }

        // 房间结构
        if (config.rooms) {
            config.rooms.forEach(r => {
                this.createRoom(r.x, r.y || 0, r.z, r.width, r.height, r.depth, r.wallThickness || 0.5,
                    r.openings || [], blockMaterial, r.roofed);
            });
        }

        // 二层平台
        if (config.secondFloors) {
            const secondFloorMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.secondFloor || config.colors.platform || 0x5a5a5a,
                roughness: 0.5,
                metalness: 0.3
            });
            config.secondFloors.forEach(sf => {
                this.createSecondFloor(sf.x, sf.y, sf.z, sf.width, sf.depth, sf.thickness || 0.3, secondFloorMaterial);
            });
        }

        // 楼梯
        if (config.stairs) {
            const stairMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.stairs || config.colors.platform || 0x6a6a6a,
                roughness: 0.6,
                metalness: 0.2
            });
            config.stairs.forEach(s => {
                this.createStairs(s.x, s.y || 0, s.z, s.width, s.height, s.depth, s.steps || 8, s.rotation || 0, stairMaterial);
            });
        }

        // 天气系统
        if (config.weather) {
            this.createWeatherSystem(config.weather);
        }

        // 工厂主体建筑
        if (config.factoryBuilding) {
            const factoryMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.factory || 0x4a4a4a,
                roughness: 0.6,
                metalness: 0.3
            });
            const glassMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.glass || 0x88aacc,
                roughness: 0.1,
                metalness: 0.5,
                transparent: true,
                opacity: 0.4
            });
            this.createFactoryBuilding(config.factoryBuilding, factoryMaterial, glassMaterial);
        }

        // 火车道
        if (config.trainTracks) {
            const railMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.rail || 0x3a3a3a,
                roughness: 0.4,
                metalness: 0.7
            });
            config.trainTracks.forEach(track => {
                this.createTrainTrack(track, railMaterial);
            });
        }

        // 火车车厢
        if (config.trains) {
            const trainMaterial = new THREE.MeshStandardMaterial({
                color: config.colors.train || 0x2a2a3a,
                roughness: 0.5,
                metalness: 0.6
            });
            config.trains.forEach(train => {
                this.createTrain(train, trainMaterial);
            });
        }

        // 灯光
        this.createLighting(config.colors.sky, config.colors.fog);

        // 出生点
        const playerHeight = CONFIG?.player?.height || 1.8;
        this.spawnPoints.blue = config.spawnPoints.blue.map(p =>
            new THREE.Vector3(p.x, playerHeight, p.z)
        );
        this.spawnPoints.red = config.spawnPoints.red.map(p =>
            new THREE.Vector3(p.x, playerHeight, p.z)
        );

        // 武器刷新点 (十字走廊)
        this.weaponSpawns = [
            { position: new THREE.Vector3(0, 0.3, 0), weapon: 'blizzard_sniper' },
            { position: new THREE.Vector3(-3, 0.3, 0), weapon: 'frostbite_rifle' },
            { position: new THREE.Vector3(3, 0.3, 0), weapon: 'frostbite_rifle' },
            { position: new THREE.Vector3(0, 0.3, -3), weapon: 'hailstorm_smg' },
            { position: new THREE.Vector3(0, 0.3, 3), weapon: 'hailstorm_smg' }
        ];

        this.createWeaponSpawnMarkers();
    }

    createWall(x, y, z, width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y + height / 2, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        this.meshes.push(wall);

        this.walls.push({
            min: new THREE.Vector3(x - width / 2, y, z - depth / 2),
            max: new THREE.Vector3(x + width / 2, y + height, z + depth / 2)
        });
    }

    createBlock(x, y, z, width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y + height / 2, z);
        block.castShadow = true;
        block.receiveShadow = true;
        this.scene.add(block);
        this.meshes.push(block);

        this.walls.push({
            min: new THREE.Vector3(x - width / 2, y, z - depth / 2),
            max: new THREE.Vector3(x + width / 2, y + height, z + depth / 2)
        });
    }

    createCrate(x, y, z, size, material) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const crate = new THREE.Mesh(geometry, material);
        crate.position.set(x, y + size / 2, z);
        crate.castShadow = true;
        crate.receiveShadow = true;
        this.scene.add(crate);
        this.meshes.push(crate);

        this.walls.push({
            min: new THREE.Vector3(x - size / 2, y, z - size / 2),
            max: new THREE.Vector3(x + size / 2, y + size, z + size / 2)
        });
    }

    // 高台平台 - 可站立的制高点
    createPlatform(x, y, z, width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const platform = new THREE.Mesh(geometry, material);
        platform.position.set(x, y + height / 2, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        this.scene.add(platform);
        this.meshes.push(platform);

        this.walls.push({
            min: new THREE.Vector3(x - width / 2, y, z - depth / 2),
            max: new THREE.Vector3(x + width / 2, y + height, z + depth / 2)
        });
    }

    // 斜坡 - 连接不同高度区域
    createRamp(x, y, z, width, height, length, rotation, material) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(length, 0);
        shape.lineTo(length, height);
        shape.lineTo(0, 0);

        const extrudeSettings = { depth: width, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        geometry.rotateY(rotation);
        geometry.translate(-length / 2, 0, -width / 2);

        const ramp = new THREE.Mesh(geometry, material);
        ramp.position.set(x, y, z);
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        this.scene.add(ramp);
        this.meshes.push(ramp);

        // 简化碰撞盒（使用包围盒）
        this.walls.push({
            min: new THREE.Vector3(x - length / 2, y, z - width / 2),
            max: new THREE.Vector3(x + length / 2, y + height, z + width / 2)
        });
    }

    // 圆柱形掩体（油桶/柱子）
    createCylinder(x, y, z, radius, height, material, segments = 16) {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(x, y + height / 2, z);
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;
        this.scene.add(cylinder);
        this.meshes.push(cylinder);

        // 圆柱碰撞使用方形近似
        this.walls.push({
            min: new THREE.Vector3(x - radius, y, z - radius),
            max: new THREE.Vector3(x + radius, y + height, z + radius)
        });
    }

    // L形墙体 - 创造复杂角落
    createLShape(x, y, z, armLength, armWidth, height, rotation, material) {
        const group = new THREE.Group();

        // 两个垂直的长方体组成 L 形
        const geo1 = new THREE.BoxGeometry(armLength, height, armWidth);
        const arm1 = new THREE.Mesh(geo1, material);
        arm1.position.set(armLength / 2 - armWidth / 2, height / 2, 0);
        arm1.castShadow = true;
        arm1.receiveShadow = true;
        group.add(arm1);

        const geo2 = new THREE.BoxGeometry(armWidth, height, armLength);
        const arm2 = new THREE.Mesh(geo2, material);
        arm2.position.set(0, height / 2, armLength / 2 - armWidth / 2);
        arm2.castShadow = true;
        arm2.receiveShadow = true;
        group.add(arm2);

        group.position.set(x, y, z);
        group.rotation.y = rotation;
        this.scene.add(group);
        this.meshes.push(group);

        // L形碰撞（两个独立碰撞盒）
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // Arm1 碰撞盒
        const a1cx = armLength / 2 - armWidth / 2;
        const a1x = x + a1cx * cos;
        const a1z = z + a1cx * sin;
        this.walls.push({
            min: new THREE.Vector3(a1x - armLength / 2, y, a1z - armWidth / 2),
            max: new THREE.Vector3(a1x + armLength / 2, y + height, a1z + armWidth / 2)
        });

        // Arm2 碰撞盒
        const a2cz = armLength / 2 - armWidth / 2;
        const a2x = x - a2cz * sin;
        const a2z = z + a2cz * cos;
        this.walls.push({
            min: new THREE.Vector3(a2x - armWidth / 2, y, a2z - armLength / 2),
            max: new THREE.Vector3(a2x + armWidth / 2, y + height, a2z + armLength / 2)
        });
    }

    // 房间结构 - 带墙壁的封闭空间
    // openings: [{side: 'north'|'south'|'east'|'west', position: 0-1, width: number}]
    createRoom(x, y, z, width, height, depth, wallThickness, openings, material, roofed = false) {
        const group = new THREE.Group();
        const halfWidth = width / 2;
        const halfDepth = depth / 2;

        // 创建四面墙，根据openings留出门口
        const walls = [
            { side: 'north', pos: [0, height / 2, -halfDepth + wallThickness / 2], size: [width, height, wallThickness] },
            { side: 'south', pos: [0, height / 2, halfDepth - wallThickness / 2], size: [width, height, wallThickness] },
            { side: 'west', pos: [-halfWidth + wallThickness / 2, height / 2, 0], size: [wallThickness, height, depth] },
            { side: 'east', pos: [halfWidth - wallThickness / 2, height / 2, 0], size: [wallThickness, height, depth] }
        ];

        walls.forEach(wall => {
            const opening = openings.find(o => o.side === wall.side);
            if (opening) {
                // 创建带开口的墙（分成两段）
                const isHorizontal = wall.side === 'north' || wall.side === 'south';
                const totalLength = isHorizontal ? width : depth;
                const openingWidth = opening.width || 2;
                const openingPos = (opening.position || 0.5) * totalLength - totalLength / 2;

                // 左/后段墙
                const leftLength = openingPos - openingWidth / 2 + totalLength / 2;
                if (leftLength > 0.1) {
                    const leftPos = isHorizontal
                        ? [openingPos - openingWidth / 2 - leftLength / 2, wall.pos[1], wall.pos[2]]
                        : [wall.pos[0], wall.pos[1], openingPos - openingWidth / 2 - leftLength / 2];
                    const leftSize = isHorizontal
                        ? [leftLength, wall.size[1], wall.size[2]]
                        : [wall.size[0], wall.size[1], leftLength];
                    this.createRoomWall(group, leftPos, leftSize, material, x, y, z);
                }

                // 右/前段墙
                const rightLength = totalLength / 2 - (openingPos + openingWidth / 2);
                if (rightLength > 0.1) {
                    const rightPos = isHorizontal
                        ? [openingPos + openingWidth / 2 + rightLength / 2, wall.pos[1], wall.pos[2]]
                        : [wall.pos[0], wall.pos[1], openingPos + openingWidth / 2 + rightLength / 2];
                    const rightSize = isHorizontal
                        ? [rightLength, wall.size[1], wall.size[2]]
                        : [wall.size[0], wall.size[1], rightLength];
                    this.createRoomWall(group, rightPos, rightSize, material, x, y, z);
                }
            } else {
                // 完整墙壁
                this.createRoomWall(group, wall.pos, wall.size, material, x, y, z);
            }
        });

        // 屋顶（可选）
        if (roofed) {
            const roofGeo = new THREE.BoxGeometry(width, wallThickness, depth);
            const roof = new THREE.Mesh(roofGeo, material);
            roof.position.set(0, height + wallThickness / 2, 0);
            roof.castShadow = true;
            roof.receiveShadow = true;
            group.add(roof);
        }

        group.position.set(x, y, z);
        this.scene.add(group);
        this.meshes.push(group);
    }

    createRoomWall(group, localPos, size, material, roomX, roomY, roomZ) {
        const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(localPos[0], localPos[1], localPos[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // 添加碰撞盒（世界坐标）
        const worldX = roomX + localPos[0];
        const worldZ = roomZ + localPos[2];
        this.walls.push({
            min: new THREE.Vector3(worldX - size[0] / 2, roomY, worldZ - size[2] / 2),
            max: new THREE.Vector3(worldX + size[0] / 2, roomY + size[1], worldZ + size[2] / 2)
        });
    }

    // 二层平台 - 可站立的高架平台
    createSecondFloor(x, y, z, width, depth, thickness, material) {
        const geometry = new THREE.BoxGeometry(width, thickness, depth);
        const floor = new THREE.Mesh(geometry, material);
        floor.position.set(x, y + thickness / 2, z);
        floor.castShadow = true;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.meshes.push(floor);

        // 二层平台碰撞（薄层）
        this.walls.push({
            min: new THREE.Vector3(x - width / 2, y, z - depth / 2),
            max: new THREE.Vector3(x + width / 2, y + thickness, z + depth / 2)
        });
    }

    // 楼梯 - 连接不同高度
    createStairs(x, y, z, width, height, depth, steps, rotation, material) {
        const group = new THREE.Group();
        const stepHeight = height / steps;
        const stepDepth = depth / steps;

        for (let i = 0; i < steps; i++) {
            const stepGeo = new THREE.BoxGeometry(width, stepHeight, stepDepth);
            const step = new THREE.Mesh(stepGeo, material);
            step.position.set(0, stepHeight * (i + 0.5), -depth / 2 + stepDepth * (i + 0.5));
            step.castShadow = true;
            step.receiveShadow = true;
            group.add(step);
        }

        group.position.set(x, y, z);
        group.rotation.y = rotation;
        this.scene.add(group);
        this.meshes.push(group);

        // 楼梯碰撞（简化为斜面包围盒）
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // 为每个阶梯添加碰撞
        for (let i = 0; i < steps; i++) {
            const localZ = -depth / 2 + stepDepth * (i + 0.5);
            const localY = stepHeight * (i + 0.5);

            // 旋转后的世界坐标
            const worldX = x + localZ * sin;
            const worldZ = z + localZ * cos;

            this.walls.push({
                min: new THREE.Vector3(worldX - width / 2, y + localY - stepHeight / 2, worldZ - stepDepth / 2),
                max: new THREE.Vector3(worldX + width / 2, y + localY + stepHeight / 2, worldZ + stepDepth / 2)
            });
        }
    }

    // ========== 工厂建筑 ==========
    createFactoryBuilding(cfg, material, glassMaterial) {
        const { x, z, width, depth, height, wallThickness, doors, secondFloor, stairs } = cfg;
        const halfWidth = width / 2;
        const halfDepth = depth / 2;

        // 创建四面墙壁（带门洞）
        const wallConfigs = [
            { side: 'north', pos: [0, height / 2, -halfDepth + wallThickness / 2], size: [width, height, wallThickness] },
            { side: 'south', pos: [0, height / 2, halfDepth - wallThickness / 2], size: [width, height, wallThickness] },
            { side: 'west', pos: [-halfWidth + wallThickness / 2, height / 2, 0], size: [wallThickness, height, depth - wallThickness * 2] },
            { side: 'east', pos: [halfWidth - wallThickness / 2, height / 2, 0], size: [wallThickness, height, depth - wallThickness * 2] }
        ];

        wallConfigs.forEach(wall => {
            const door = doors?.find(d => d.side === wall.side);
            if (door) {
                // 创建带门洞的墙
                this.createWallWithDoor(x, z, wall, door, material);
            } else {
                // 完整墙壁
                const geo = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]);
                const mesh = new THREE.Mesh(geo, material);
                mesh.position.set(x + wall.pos[0], wall.pos[1], z + wall.pos[2]);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.scene.add(mesh);
                this.meshes.push(mesh);

                this.walls.push({
                    min: new THREE.Vector3(x + wall.pos[0] - wall.size[0] / 2, 0, z + wall.pos[2] - wall.size[2] / 2),
                    max: new THREE.Vector3(x + wall.pos[0] + wall.size[0] / 2, wall.size[1], z + wall.pos[2] + wall.size[2] / 2)
                });
            }
        });

        // 屋顶
        const roofGeo = new THREE.BoxGeometry(width, wallThickness, depth);
        const roof = new THREE.Mesh(roofGeo, material);
        roof.position.set(x, height + wallThickness / 2, z);
        roof.castShadow = true;
        roof.receiveShadow = true;
        this.scene.add(roof);
        this.meshes.push(roof);

        this.walls.push({
            min: new THREE.Vector3(x - halfWidth, height, z - halfDepth),
            max: new THREE.Vector3(x + halfWidth, height + wallThickness, z + halfDepth)
        });

        // 二层结构
        if (secondFloor) {
            const sfY = secondFloor.y;

            // 办公室
            secondFloor.offices?.forEach(office => {
                // 办公室地板
                this.createSecondFloor(
                    x + office.x, sfY, z + office.z,
                    office.width, office.depth, 0.3, material
                );

                // 办公室围墙（矮墙 + 玻璃）
                const officeWallHeight = office.height || 4;
                const glassHeight = 2.5;
                const solidWallHeight = officeWallHeight - glassHeight;

                // 南侧（面向大厅）- 实体矮墙 + 玻璃
                const southWallZ = office.z + office.depth / 2;
                // 矮墙
                this.createBlock(
                    x + office.x, sfY, z + southWallZ - 0.15,
                    office.width, solidWallHeight, 0.3, material
                );
                // 玻璃窗
                const glassGeo = new THREE.BoxGeometry(office.width - 1, glassHeight, 0.1);
                const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
                glassMesh.position.set(x + office.x, sfY + solidWallHeight + glassHeight / 2, z + southWallZ);
                this.scene.add(glassMesh);
                this.meshes.push(glassMesh);
            });

            // 连接走廊
            secondFloor.corridors?.forEach(corridor => {
                this.createSecondFloor(
                    x + corridor.x, sfY, z + corridor.z,
                    corridor.width, corridor.depth, 0.3, material
                );
            });
        }

        // 工厂内楼梯 (台阶高度设计为可自动踏上)
        if (stairs) {
            const stairMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a5a5a,
                roughness: 0.6,
                metalness: 0.3
            });
            const stairHeight = secondFloor?.y || 6;
            // 增加台阶数使每步高度 < 0.5m
            const stairSteps = Math.ceil(stairHeight / 0.35);
            const stairDepth = stairSteps * 0.5; // 每步深度 0.5m
            stairs.forEach(stair => {
                this.createStairs(
                    x + stair.x, 0, z + stair.z,
                    2.5, stairHeight, stairDepth, stairSteps, stair.rotation || 0, stairMaterial
                );
            });
        }
    }

    // 创建带门洞的墙
    createWallWithDoor(factoryX, factoryZ, wall, door, material) {
        const isHorizontal = wall.side === 'north' || wall.side === 'south';
        const totalLength = isHorizontal ? wall.size[0] : wall.size[2];
        const doorWidth = door.width || 4;
        const doorHeight = door.height || 4;
        const doorPos = (door.position || 0.5) * totalLength - totalLength / 2;

        // 门左侧墙
        const leftLength = (totalLength / 2) + doorPos - doorWidth / 2;
        if (leftLength > 0.5) {
            const leftPos = doorPos - doorWidth / 2 - leftLength / 2;
            if (isHorizontal) {
                this.createBlock(
                    factoryX + leftPos, 0, factoryZ + wall.pos[2],
                    leftLength, wall.size[1], wall.size[2], material
                );
            } else {
                this.createBlock(
                    factoryX + wall.pos[0], 0, factoryZ + leftPos,
                    wall.size[0], wall.size[1], leftLength, material
                );
            }
        }

        // 门右侧墙
        const rightLength = (totalLength / 2) - doorPos - doorWidth / 2;
        if (rightLength > 0.5) {
            const rightPos = doorPos + doorWidth / 2 + rightLength / 2;
            if (isHorizontal) {
                this.createBlock(
                    factoryX + rightPos, 0, factoryZ + wall.pos[2],
                    rightLength, wall.size[1], wall.size[2], material
                );
            } else {
                this.createBlock(
                    factoryX + wall.pos[0], 0, factoryZ + rightPos,
                    wall.size[0], wall.size[1], rightLength, material
                );
            }
        }

        // 门上方墙
        const aboveHeight = wall.size[1] - doorHeight;
        if (aboveHeight > 0.5) {
            if (isHorizontal) {
                this.createBlock(
                    factoryX + doorPos, doorHeight, factoryZ + wall.pos[2],
                    doorWidth, aboveHeight, wall.size[2], material
                );
            } else {
                this.createBlock(
                    factoryX + wall.pos[0], doorHeight, factoryZ + doorPos,
                    wall.size[0], aboveHeight, doorWidth, material
                );
            }
        }
    }

    // ========== 火车道 ==========
    createTrainTrack(track, material) {
        const { z, length } = track;
        const halfLength = length / 2;

        // 两条铁轨
        const railWidth = 0.15;
        const railHeight = 0.2;
        const trackGauge = 1.8; // 轨距

        [-trackGauge / 2, trackGauge / 2].forEach(offsetX => {
            const railGeo = new THREE.BoxGeometry(length, railHeight, railWidth);
            const rail = new THREE.Mesh(railGeo, material);
            rail.position.set(0, railHeight / 2, z + offsetX);
            this.scene.add(rail);
            this.meshes.push(rail);
        });

        // 枕木
        const tieWidth = 2.5;
        const tieDepth = 0.3;
        const tieHeight = 0.1;
        const tieSpacing = 2;
        const tieMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3a2a,
            roughness: 0.8,
            metalness: 0.1
        });

        for (let x = -halfLength + 1; x < halfLength; x += tieSpacing) {
            const tieGeo = new THREE.BoxGeometry(tieDepth, tieHeight, tieWidth);
            const tie = new THREE.Mesh(tieGeo, tieMaterial);
            tie.position.set(x, tieHeight / 2, z);
            this.scene.add(tie);
            this.meshes.push(tie);
        }
    }

    // ========== 火车车厢 ==========
    createTrain(train, material) {
        const { x, z, length, hasLadder } = train;
        const width = 3;
        const height = 3.5;
        const group = new THREE.Group();

        // 车厢主体
        const bodyGeo = new THREE.BoxGeometry(length, height, width);
        const body = new THREE.Mesh(bodyGeo, material);
        body.position.set(0, height / 2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // 车顶（略宽）
        const roofGeo = new THREE.BoxGeometry(length, 0.3, width + 0.4);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a4a,
            roughness: 0.5,
            metalness: 0.5
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, height + 0.15, 0);
        group.add(roof);

        // 车轮
        const wheelRadius = 0.4;
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        const wheelPositions = [
            [-length / 2 + 1, wheelRadius, -width / 2 - 0.1],
            [-length / 2 + 1, wheelRadius, width / 2 + 0.1],
            [length / 2 - 1, wheelRadius, -width / 2 - 0.1],
            [length / 2 - 1, wheelRadius, width / 2 + 0.1]
        ];
        wheelPositions.forEach(pos => {
            const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.2, 16);
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos[0], pos[1], pos[2]);
            group.add(wheel);
        });

        group.position.set(x, 0, z);
        this.scene.add(group);
        this.meshes.push(group);

        // 碰撞盒
        this.walls.push({
            min: new THREE.Vector3(x - length / 2, 0, z - width / 2),
            max: new THREE.Vector3(x + length / 2, height, z + width / 2)
        });

        // 可攀爬梯子 (贴着车厢末端侧面)
        if (hasLadder) {
            // 梯子贴着车厢末端侧面，玩家从侧面攀爬
            const ladderX = x + length / 2;  // 车厢末端
            const ladderZ = z;  // 车厢中心位置
            this.createTrainLadder(ladderX, 0, ladderZ, height + 0.5, width);
        }
    }

    // ========== 火车专用梯子 ==========
    createTrainLadder(x, y, z, height, trainWidth) {
        const group = new THREE.Group();
        const ladderMat = new THREE.MeshStandardMaterial({
            color: 0x885533,
            roughness: 0.6,
            metalness: 0.4
        });

        // 梯子尺寸
        const railWidth = 0.1;
        const railSpacing = 0.6;
        const rungSpacing = 0.35;
        const rungRadius = 0.04;

        // 两侧扶手 (垂直)
        [-railSpacing / 2, railSpacing / 2].forEach(offsetX => {
            const railGeo = new THREE.BoxGeometry(railWidth, height, railWidth);
            const rail = new THREE.Mesh(railGeo, ladderMat);
            rail.position.set(offsetX, height / 2, 0);
            rail.castShadow = true;
            group.add(rail);
        });

        // 横档
        const rungCount = Math.floor(height / rungSpacing);
        for (let i = 1; i <= rungCount; i++) {
            const rungGeo = new THREE.CylinderGeometry(rungRadius, rungRadius, railSpacing, 8);
            const rung = new THREE.Mesh(rungGeo, ladderMat);
            rung.rotation.z = Math.PI / 2;
            rung.position.set(0, i * rungSpacing, 0);
            rung.castShadow = true;
            group.add(rung);
        }

        // 梯子位置：贴着车厢末端外侧
        group.position.set(x + 0.2, y, z);
        this.scene.add(group);
        this.meshes.push(group);

        // 梯子攀爬检测区域 (较大范围，便于检测)
        if (!this.ladders) this.ladders = [];
        this.ladders.push({
            min: new THREE.Vector3(x - 0.5, y, z - 1.2),
            max: new THREE.Vector3(x + 1.5, y + height + 1.5, z + 1.2),
            topY: y + height
        });
    }

    // ========== 通用梯子 ==========
    createLadder(x, y, z, height) {
        const group = new THREE.Group();
        const ladderMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.4,
            metalness: 0.7
        });

        const railWidth = 0.08;
        const railSpacing = 0.5;
        const rungSpacing = 0.4;

        // 两侧扶手
        [-railSpacing / 2, railSpacing / 2].forEach(offsetZ => {
            const railGeo = new THREE.BoxGeometry(railWidth, height, railWidth);
            const rail = new THREE.Mesh(railGeo, ladderMat);
            rail.position.set(0, height / 2, offsetZ);
            group.add(rail);
        });

        // 横档
        const rungCount = Math.floor(height / rungSpacing);
        for (let i = 1; i <= rungCount; i++) {
            const rungGeo = new THREE.CylinderGeometry(0.03, 0.03, railSpacing, 8);
            const rung = new THREE.Mesh(rungGeo, ladderMat);
            rung.rotation.x = Math.PI / 2;
            rung.position.set(0, i * rungSpacing, 0);
            group.add(rung);
        }

        group.position.set(x, y, z);
        this.scene.add(group);
        this.meshes.push(group);

        // 梯子碰撞区域
        if (!this.ladders) this.ladders = [];
        this.ladders.push({
            min: new THREE.Vector3(x - 0.8, y, z - 0.8),
            max: new THREE.Vector3(x + 0.8, y + height + 1, z + 0.8),
            topY: y + height
        });
    }

    // 天气粒子系统
    createWeatherSystem(type) {
        if (!type || type === 'none') return;

        this.weatherType = type;

        const particleCount = type === 'snow' ? 3000 : 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        const mapSize = this.config.size;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * mapSize * 1.5;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * mapSize * 1.5;

            if (type === 'snow') {
                velocities[i * 3] = (Math.random() - 0.5) * 0.5;
                velocities[i * 3 + 1] = -1 - Math.random() * 1;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
            } else { // rain
                velocities[i * 3] = (Math.random() - 0.5) * 0.2;
                velocities[i * 3 + 1] = -8 - Math.random() * 4;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.weatherVelocities = velocities;

        const particleColor = type === 'snow' ? 0xffffff : 0x8888aa;
        const particleSize = type === 'snow' ? 0.15 : 0.05;

        const material = new THREE.PointsMaterial({
            color: particleColor,
            size: particleSize,
            transparent: true,
            opacity: type === 'snow' ? 0.8 : 0.4,
            depthWrite: false
        });

        this.weatherParticles = new THREE.Points(geometry, material);
        this.scene.add(this.weatherParticles);
        this.meshes.push(this.weatherParticles);
    }

    // 更新天气粒子
    updateWeather(deltaTime) {
        if (!this.weatherParticles) return;

        const positions = this.weatherParticles.geometry.attributes.position.array;
        const velocities = this.weatherVelocities;
        const mapSize = this.config.size;

        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3] += velocities[i * 3] * deltaTime;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime;

            // 重置落到地面以下的粒子
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3] = (Math.random() - 0.5) * mapSize * 1.5;
                positions[i * 3 + 1] = 25 + Math.random() * 5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * mapSize * 1.5;
            }
        }

        this.weatherParticles.geometry.attributes.position.needsUpdate = true;
    }

    createLighting(skyColor, fogColor) {
        const config = this.config;
        const lighting = config.lighting || {};

        // 环境光
        const ambientColor = lighting.ambientColor || 0xcccccc;
        const ambientIntensity = lighting.ambientIntensity || 0.8;
        const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
        this.scene.add(ambient);
        this.meshes.push(ambient);

        // 主方向光
        const mainColor = lighting.mainColor || 0xffffff;
        const mainIntensity = lighting.mainIntensity || 1.0;
        const mainLight = new THREE.DirectionalLight(mainColor, mainIntensity);
        mainLight.position.set(
            lighting.mainPosition?.x || 5,
            lighting.mainPosition?.y || 25,
            lighting.mainPosition?.z || 5
        );
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 1;
        mainLight.shadow.camera.far = 60;
        const shadowSize = config.size ? config.size / 2 : 20;
        mainLight.shadow.camera.left = -shadowSize;
        mainLight.shadow.camera.right = shadowSize;
        mainLight.shadow.camera.top = shadowSize;
        mainLight.shadow.camera.bottom = -shadowSize;
        this.scene.add(mainLight);
        this.meshes.push(mainLight);

        // 点光源（工业灯光等）
        if (lighting.pointLights) {
            lighting.pointLights.forEach(pl => {
                const pointLight = new THREE.PointLight(
                    pl.color || 0xffaa55,
                    pl.intensity || 1.0,
                    pl.distance || 15,
                    pl.decay || 2
                );
                pointLight.position.set(pl.x, pl.y, pl.z);
                pointLight.castShadow = pl.castShadow || false;
                this.scene.add(pointLight);
                this.meshes.push(pointLight);

                // 可选：添加灯光可视化（小球体）
                if (pl.visible !== false) {
                    const bulbGeo = new THREE.SphereGeometry(0.2, 8, 8);
                    const bulbMat = new THREE.MeshBasicMaterial({ color: pl.color || 0xffaa55 });
                    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
                    bulb.position.copy(pointLight.position);
                    this.scene.add(bulb);
                    this.meshes.push(bulb);
                }
            });
        }

        // 雾气（可自定义范围）
        const fogNear = lighting.fogNear || 40;
        const fogFar = lighting.fogFar || 80;
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    }

    createWeaponSpawnMarkers() {
        const markerGeometry = new THREE.RingGeometry(0.3, 0.5, 16);

        this.weaponSpawns.forEach(spawn => {
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: 0xffcc00,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.rotation.x = -Math.PI / 2;
            marker.position.copy(spawn.position);
            marker.position.y = 0.02;
            this.scene.add(marker);
            this.meshes.push(marker);
        });
    }

    // 碰撞检测 - 改进版：支持站立在平台/楼梯上
    checkCollision(oldPos, newPos, radius) {
        const result = {
            position: newPos.clone(),
            hitFloor: false,
            hitCeiling: false,
            hitWall: false,
            groundHeight: 0  // 当前位置下方的地面高度
        };

        const playerHeight = CONFIG?.player?.height || 1.8;
        const feetY = newPos.y - playerHeight;  // 玩家脚底位置
        const stepHeight = 0.5;  // 可以自动爬上的最大高度

        // 第一步：找到玩家脚下可以站立的最高表面
        let highestFloor = 0;  // 基础地面高度

        for (const wall of this.walls) {
            // 检查玩家是否在此物体的XZ范围内
            const inXRange = newPos.x + radius > wall.min.x && newPos.x - radius < wall.max.x;
            const inZRange = newPos.z + radius > wall.min.z && newPos.z - radius < wall.max.z;

            if (inXRange && inZRange) {
                const surfaceTop = wall.max.y;

                // 玩家脚底在物体顶面附近或上方，可以站在上面
                // 条件：脚底高于物体顶面-stepHeight 且 脚底不高于物体顶面+stepHeight
                if (feetY >= surfaceTop - stepHeight && feetY <= surfaceTop + stepHeight) {
                    if (surfaceTop > highestFloor) {
                        highestFloor = surfaceTop;
                    }
                }
                // 玩家已经站在更高位置，下方有平台可以落下
                else if (feetY > surfaceTop + stepHeight && surfaceTop > highestFloor) {
                    // 记录下方平台高度，用于下落检测
                    if (surfaceTop > highestFloor) {
                        highestFloor = surfaceTop;
                    }
                }
            }
        }

        result.groundHeight = highestFloor;

        // 第二步：处理墙壁碰撞（水平方向）
        for (const wall of this.walls) {
            // 检查是否与墙壁水平碰撞
            const surfaceTop = wall.max.y;

            // 如果玩家脚底高于物体顶面，不检测水平碰撞（可以走在上面）
            if (feetY >= surfaceTop - 0.05) {
                continue;
            }

            // 如果玩家头部低于物体底部，也不碰撞
            if (newPos.y < wall.min.y) {
                continue;
            }

            // 计算水平距离
            const closestX = Math.max(wall.min.x, Math.min(newPos.x, wall.max.x));
            const closestZ = Math.max(wall.min.z, Math.min(newPos.z, wall.max.z));

            const dx = newPos.x - closestX;
            const dz = newPos.z - closestZ;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);

            if (horizontalDist < radius && horizontalDist > 0) {
                // 水平推开
                const pushX = dx / horizontalDist;
                const pushZ = dz / horizontalDist;
                const pushDist = radius - horizontalDist + 0.01;

                result.position.x += pushX * pushDist;
                result.position.z += pushZ * pushDist;
                result.hitWall = true;
            } else if (horizontalDist === 0) {
                // 完全在物体内部，根据最近边推出
                const distToMinX = Math.abs(newPos.x - wall.min.x);
                const distToMaxX = Math.abs(newPos.x - wall.max.x);
                const distToMinZ = Math.abs(newPos.z - wall.min.z);
                const distToMaxZ = Math.abs(newPos.z - wall.max.z);

                const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

                if (minDist === distToMinX) {
                    result.position.x = wall.min.x - radius - 0.01;
                } else if (minDist === distToMaxX) {
                    result.position.x = wall.max.x + radius + 0.01;
                } else if (minDist === distToMinZ) {
                    result.position.z = wall.min.z - radius - 0.01;
                } else {
                    result.position.z = wall.max.z + radius + 0.01;
                }
                result.hitWall = true;
            }
        }

        // 第三步：检测地面/平台着地
        const newFeetY = result.position.y - playerHeight;
        const targetGroundY = result.groundHeight + playerHeight;

        // 如果正在下落且脚底低于或接近地面/平台
        if (newFeetY <= result.groundHeight + 0.1) {
            result.position.y = targetGroundY;
            result.hitFloor = true;
        }

        // 第四步：检测头顶碰撞
        for (const wall of this.walls) {
            const inXRange = result.position.x + radius * 0.5 > wall.min.x &&
                result.position.x - radius * 0.5 < wall.max.x;
            const inZRange = result.position.z + radius * 0.5 > wall.min.z &&
                result.position.z - radius * 0.5 < wall.max.z;

            if (inXRange && inZRange) {
                // 头部撞到物体底面
                if (result.position.y > wall.min.y - 0.1 && result.position.y < wall.min.y + 0.5 &&
                    oldPos.y < wall.min.y) {
                    result.position.y = wall.min.y - 0.1;
                    result.hitCeiling = true;
                }
            }
        }

        // 地图边界
        const bound = (this.config.size / 2) - 0.5;
        result.position.x = Math.max(-bound, Math.min(bound, result.position.x));
        result.position.z = Math.max(-bound, Math.min(bound, result.position.z));

        return result;
    }

    // 射线与墙壁碰撞
    raycast(origin, direction, maxDistance) {
        let closestHit = null;
        let closestDist = maxDistance;

        for (const wall of this.walls) {
            const hit = this.rayAABBIntersection(origin, direction, wall.min, wall.max, closestDist);
            if (hit !== null && hit < closestDist) {
                closestDist = hit;
                closestHit = {
                    distance: hit,
                    point: origin.clone().add(direction.clone().multiplyScalar(hit))
                };
            }
        }

        return closestHit;
    }

    rayAABBIntersection(origin, direction, min, max, maxDist) {
        let tmin = 0;
        let tmax = maxDist;

        for (let i = 0; i < 3; i++) {
            const axis = ['x', 'y', 'z'][i];
            if (Math.abs(direction[axis]) < 0.0001) {
                if (origin[axis] < min[axis] || origin[axis] > max[axis]) {
                    return null;
                }
            } else {
                const t1 = (min[axis] - origin[axis]) / direction[axis];
                const t2 = (max[axis] - origin[axis]) / direction[axis];

                const tNear = Math.min(t1, t2);
                const tFar = Math.max(t1, t2);

                tmin = Math.max(tmin, tNear);
                tmax = Math.min(tmax, tFar);

                if (tmin > tmax) return null;
            }
        }

        return tmin > 0 ? tmin : null;
    }

    getRandomSpawnPoint(team) {
        const points = this.spawnPoints[team] || this.spawnPoints.blue;
        return points[Math.floor(Math.random() * points.length)].clone();
    }

    getPatrolPoints() {
        const playerHeight = CONFIG?.player?.height || 1.8;
        return this.config.patrolPoints.map(p =>
            new THREE.Vector3(p.x, playerHeight, p.z)
        );
    }

    // 清理地图资源
    dispose() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
        });
        this.meshes = [];
        this.walls = [];
    }
}
