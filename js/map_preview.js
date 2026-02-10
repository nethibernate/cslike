// FrostBite Arena - 地图3D预览渲染器
class MapPreviewRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.container = null;
        this.animationId = null;
        this.pivotGroup = null;
        this.rotationSpeed = 0.3;
    }

    // 初始化渲染器（绑定到容器DOM）
    init(container) {
        this.container = container;

        // 创建Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        container.appendChild(this.canvas);

        // Three.js 渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.resize();
    }

    resize() {
        if (!this.container || !this.renderer) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.renderer.setSize(w, h);

        if (this.camera) {
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
        }
    }

    // 加载并预览指定地图
    loadMap(mapId) {
        // 停止旧动画
        this.stopAnimation();

        // 清理旧场景
        if (this.scene) {
            this.disposeScene();
        }

        const config = getMapConfig(mapId);
        if (!config) return;

        // 新建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(config.colors.sky);

        // 创建旋转父组件 - 所有地图元素放在里面
        this.pivotGroup = new THREE.Group();
        this.scene.add(this.pivotGroup);

        // 设置相机（透视，从上方斜视）
        const size = config.size;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, size * 5);

        // 相机位置：从斜上方看
        const camDist = size * 0.85;
        this.camera.position.set(camDist * 0.5, camDist * 0.7, camDist * 0.5);
        this.camera.lookAt(0, 0, 0);

        // 灯光
        this.setupLighting(config);

        // 构建简化地图几何体
        this.buildMapGeometry(config);

        // 开始旋转动画
        this.startAnimation();
    }

    setupLighting(config) {
        // 环境光
        const ambientColor = config.lighting?.ambientColor || 0x8ecae6;
        const ambientIntensity = config.lighting?.ambientIntensity || 0.7;
        const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
        this.scene.add(ambient);

        // 主平行光
        const mainColor = config.lighting?.mainColor || 0xffffff;
        const mainIntensity = config.lighting?.mainIntensity || 1.0;
        const dirLight = new THREE.DirectionalLight(mainColor, mainIntensity);
        const size = config.size;
        dirLight.position.set(size * 0.5, size * 0.8, size * 0.3);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(512, 512);
        dirLight.shadow.camera.left = -size;
        dirLight.shadow.camera.right = size;
        dirLight.shadow.camera.top = size;
        dirLight.shadow.camera.bottom = -size;
        this.scene.add(dirLight);
    }

    buildMapGeometry(config) {
        const halfSize = config.size / 2;
        const blockOffset = (config.blockSize + (config.corridorWidth || 4)) / 2;

        // 材质（简化版，不需要太复杂）
        const floorMat = new THREE.MeshStandardMaterial({
            color: config.colors.floor, roughness: 0.6, metalness: 0
        });
        const blockMat = new THREE.MeshStandardMaterial({
            color: config.colors.block, roughness: 0.4, metalness: 0.1
        });
        const wallMat = new THREE.MeshStandardMaterial({
            color: config.colors.wall, roughness: 0.5, metalness: 0.2,
            transparent: true, opacity: 0.5
        });
        const crateMat = new THREE.MeshStandardMaterial({
            color: config.colors.crate, roughness: 0.8
        });
        const platformMat = new THREE.MeshStandardMaterial({
            color: config.colors.platform || config.colors.block, roughness: 0.4, metalness: 0.3
        });
        const cylinderMat = new THREE.MeshStandardMaterial({
            color: config.colors.cylinder || 0x884422, roughness: 0.6, metalness: 0.4
        });

        // 地板
        const floorGeo = new THREE.PlaneGeometry(config.size, config.size);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.pivotGroup.add(floor);

        // 外墙
        this.addBox(0, 2, -halfSize, config.size, 4, 0.3, wallMat);
        this.addBox(0, 2, halfSize, config.size, 4, 0.3, wallMat);
        this.addBox(-halfSize, 2, 0, 0.3, 4, config.size, wallMat);
        this.addBox(halfSize, 2, 0, 0.3, 4, config.size, wallMat);

        // 方块
        const blockHeight = 3.5;
        if (config.blocks) {
            config.blocks.forEach(block => {
                const scale = block.scale || 1;
                const w = config.blockSize * scale;
                const x = block.offsetX * blockOffset;
                const z = block.offsetZ * blockOffset;
                this.addBox(x, blockHeight / 2, z, w, blockHeight, w, blockMat);
            });
        }

        // 木箱
        if (config.crates) {
            config.crates.forEach(c => {
                this.addBox(c.x, 0.75, c.z, 1.5, 1.5, 1.5, crateMat);
            });
        }

        // 高台平台
        if (config.platforms) {
            config.platforms.forEach(p => {
                this.addBox(p.x, p.height / 2, p.z, p.width, p.height, p.depth, platformMat);
            });
        }

        // 圆柱
        if (config.cylinders) {
            config.cylinders.forEach(c => {
                const geo = new THREE.CylinderGeometry(c.radius, c.radius, c.height, 12);
                const mesh = new THREE.Mesh(geo, cylinderMat);
                mesh.position.set(c.x, c.height / 2, c.z);
                mesh.castShadow = true;
                this.pivotGroup.add(mesh);
            });
        }

        // L形墙
        if (config.lShapes) {
            config.lShapes.forEach(l => {
                const group = new THREE.Group();
                group.position.set(l.x, 0, l.z);
                group.rotation.y = l.rotation || 0;

                const mat = blockMat;
                // 水平臂
                const arm1Geo = new THREE.BoxGeometry(l.armLength, l.height, l.armWidth);
                const arm1 = new THREE.Mesh(arm1Geo, mat);
                arm1.position.set(l.armLength / 2, l.height / 2, 0);
                arm1.castShadow = true;
                group.add(arm1);

                // 垂直臂
                const arm2Geo = new THREE.BoxGeometry(l.armWidth, l.height, l.armLength);
                const arm2 = new THREE.Mesh(arm2Geo, mat);
                arm2.position.set(0, l.height / 2, l.armLength / 2);
                arm2.castShadow = true;
                group.add(arm2);

                this.pivotGroup.add(group);
            });
        }

        // 房间
        if (config.rooms) {
            config.rooms.forEach(r => {
                const rh = r.height || 3;
                const wt = r.wallThickness || 0.5;
                const rw = r.width;
                const rd = r.depth;
                // 简化：画4面墙
                this.addBox(r.x, rh / 2, r.z - rd / 2, rw, rh, wt, blockMat);
                this.addBox(r.x, rh / 2, r.z + rd / 2, rw, rh, wt, blockMat);
                this.addBox(r.x - rw / 2, rh / 2, r.z, wt, rh, rd, blockMat);
                this.addBox(r.x + rw / 2, rh / 2, r.z, wt, rh, rd, blockMat);
            });
        }

        // 二层平台
        if (config.secondFloors) {
            const sf2Mat = new THREE.MeshStandardMaterial({
                color: config.colors.secondFloor || config.colors.platform || 0x5a5a5a,
                roughness: 0.5, metalness: 0.3
            });
            config.secondFloors.forEach(sf => {
                this.addBox(sf.x, sf.y, sf.z, sf.width, sf.thickness || 0.3, sf.depth, sf2Mat);
            });
        }

        // 工厂建筑（简化渲染）
        if (config.factoryBuilding) {
            const fb = config.factoryBuilding;
            const fbMat = new THREE.MeshStandardMaterial({
                color: config.colors.factory || 0x4a4a4a,
                roughness: 0.6, metalness: 0.3,
                transparent: true, opacity: 0.6
            });
            const wt = fb.wallThickness || 1;
            // 四面墙
            this.addBox(fb.x, fb.height / 2, fb.z - fb.depth / 2, fb.width, fb.height, wt, fbMat);
            this.addBox(fb.x, fb.height / 2, fb.z + fb.depth / 2, fb.width, fb.height, wt, fbMat);
            this.addBox(fb.x - fb.width / 2, fb.height / 2, fb.z, wt, fb.height, fb.depth, fbMat);
            this.addBox(fb.x + fb.width / 2, fb.height / 2, fb.z, wt, fb.height, fb.depth, fbMat);
        }

        // 火车
        if (config.trains) {
            const trainMat = new THREE.MeshStandardMaterial({
                color: config.colors.train || 0x2a2a3a, roughness: 0.5, metalness: 0.5
            });
            config.trains.forEach(t => {
                this.addBox(t.x, 2, t.z, t.length, 4, 3, trainMat);
            });
        }

        // 火车轨道
        if (config.trainTracks) {
            const railMat = new THREE.MeshStandardMaterial({
                color: config.colors.rail || 0x3a3a3a, roughness: 0.7, metalness: 0.6
            });
            config.trainTracks.forEach(track => {
                this.addBox(0, 0.05, track.z, track.length, 0.1, 2, railMat);
            });
        }

        // 出生点标记
        if (config.spawnPoints) {
            const blueSpawnMat = new THREE.MeshBasicMaterial({ color: 0x4488ff });
            const redSpawnMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
            const markerGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8);

            config.spawnPoints.blue.forEach(sp => {
                const m = new THREE.Mesh(markerGeo, blueSpawnMat);
                m.position.set(sp.x, 0.1, sp.z);
                this.pivotGroup.add(m);
            });
            config.spawnPoints.red.forEach(sp => {
                const m = new THREE.Mesh(markerGeo, redSpawnMat);
                m.position.set(sp.x, 0.1, sp.z);
                this.pivotGroup.add(m);
            });
        }
    }

    addBox(x, y, z, w, h, d, material) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.pivotGroup.add(mesh);
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            if (this.pivotGroup) {
                this.pivotGroup.rotation.y += this.rotationSpeed * 0.016;
            }

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    disposeScene() {
        if (!this.scene) return;

        this.scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });

        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.pivotGroup = null;
    }

    // 完全销毁
    destroy() {
        this.stopAnimation();
        this.disposeScene();

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }

        this.container = null;
    }
}

// 全局实例
let mapPreviewRenderer = null;
