// FrostBite Arena - 武器系统
const WEAPONS = {
    // 步枪 - 主武器
    frostbite_rifle: {
        id: 'frostbite_rifle',
        name: 'FROSTBITE RIFLE',
        damage: 25,
        headshotMultiplier: 4,
        fireRate: 600, // RPM
        magSize: 30,
        reserveAmmo: 90,
        reloadTime: 2.0,
        spread: 0.02,
        spreadIncrease: 0.008,
        spreadRecovery: 0.05,
        maxSpread: 0.1,
        recoil: { x: 0.02, y: 0.04 },
        range: 100,
        automatic: true,
        noAutoReload: true,  // 弹匣为0时不自动换弹
        slot: 'primary'
    },

    // 冲锋枪 - 快速射击
    hailstorm_smg: {
        id: 'hailstorm_smg',
        name: 'HAILSTORM SMG',
        damage: 18,
        headshotMultiplier: 3,
        fireRate: 800,
        magSize: 35,
        reserveAmmo: 105,
        reloadTime: 1.8,
        spread: 0.04,
        spreadIncrease: 0.01,
        spreadRecovery: 0.08,
        maxSpread: 0.15,
        recoil: { x: 0.015, y: 0.025 },
        range: 50,
        automatic: true,
        noAutoReload: true,
        slot: 'primary'
    },

    // 霰弹枪 - 近战霸主
    glacier_shotgun: {
        id: 'glacier_shotgun',
        name: 'GLACIER SHOTGUN',
        damage: 20, // 每颗弹丸
        pellets: 8,
        headshotMultiplier: 2,
        fireRate: 60,
        magSize: 6,
        reserveAmmo: 24,
        reloadTime: 0.5, // 每发
        reloadPerShell: true,
        spread: 0.1,
        spreadIncrease: 0,
        spreadRecovery: 0.1,
        maxSpread: 0.1,
        recoil: { x: 0.05, y: 0.1 },
        range: 20,
        automatic: false,
        noAutoReload: true,
        slot: 'primary'
    },

    // 狙击枪 - 一枪毙命 (除腿部外)
    blizzard_sniper: {
        id: 'blizzard_sniper',
        name: 'BLIZZARD SNIPER',
        damage: 115,  // 基础伤害，身体一击毙命
        legDamage: 65,  // 腿部伤害减少
        headshotMultiplier: 2,
        isSniper: true,  // 特殊标记：无视护甲
        fireRate: 40,
        magSize: 5,
        reserveAmmo: 20,
        reloadTime: 3.0,
        spread: 0.001,
        spreadIncrease: 0,
        spreadRecovery: 0.02,
        maxSpread: 0.001,
        recoil: { x: 0, y: 0.15 },
        range: 200,
        automatic: false,
        hasScope: true,
        scopeZoomLevels: [2],  // 只有2x缩放
        noAutoReload: false,  // 弹匣为0时不自动换弹
        slot: 'primary'
    },

    // 手枪 - 副武器
    mk9_pistol: {
        id: 'mk9_pistol',
        name: 'MK-9 PISTOL',
        damage: 30,
        headshotMultiplier: 4,
        fireRate: 400,
        magSize: 12,
        reserveAmmo: 36,
        reloadTime: 1.5,
        spread: 0.015,
        spreadIncrease: 0.02,
        spreadRecovery: 0.1,
        maxSpread: 0.08,
        recoil: { x: 0.01, y: 0.03 },
        range: 60,
        automatic: false,
        noAutoReload: true,
        slot: 'sidearm'
    }
};

// 武器工厂类
class Weapon {
    constructor(data) {
        this.data = data;
        this.currentMag = data.magSize;
        this.reserveAmmo = data.reserveAmmo;
        this.currentSpread = data.spread;
        this.isReloading = false;
        this.reloadProgress = 0;
        this.lastFireTime = 0;
        this.canFire = true;
    }

    get fireInterval() {
        return 60000 / this.data.fireRate; // 毫秒
    }

    canShoot(now) {
        if (this.isReloading) return false;
        if (this.currentMag <= 0) return false;
        if (now - this.lastFireTime < this.fireInterval) return false;
        return true;
    }

    shoot(now) {
        if (!this.canShoot(now)) return null;

        this.lastFireTime = now;
        this.currentMag--;

        // 增加散布
        this.currentSpread = Math.min(
            this.currentSpread + this.data.spreadIncrease,
            this.data.maxSpread
        );

        return {
            damage: this.data.damage,
            headshot: this.data.headshotMultiplier,
            spread: this.currentSpread,
            recoil: this.data.recoil,
            pellets: this.data.pellets || 1
        };
    }

    updateSpread(deltaTime) {
        // 散布恢复
        this.currentSpread = Math.max(
            this.data.spread,
            this.currentSpread - this.data.spreadRecovery * deltaTime
        );
    }

    startReload() {
        if (this.isReloading) return false;
        if (this.currentMag >= this.data.magSize) return false;
        if (this.reserveAmmo <= 0) return false;

        this.isReloading = true;
        this.reloadProgress = 0;
        return true;
    }

    updateReload(deltaTime) {
        if (!this.isReloading) return false;

        if (this.data.reloadPerShell) {
            // 霰弹枪逐发填装
            this.reloadProgress += deltaTime;
            if (this.reloadProgress >= this.data.reloadTime) {
                this.reloadProgress = 0;
                if (this.reserveAmmo > 0 && this.currentMag < this.data.magSize) {
                    this.currentMag++;
                    this.reserveAmmo--;
                }
                if (this.currentMag >= this.data.magSize || this.reserveAmmo <= 0) {
                    this.isReloading = false;
                    return true;
                }
            }
        } else {
            // 整体填装
            this.reloadProgress += deltaTime;
            if (this.reloadProgress >= this.data.reloadTime) {
                const neededAmmo = this.data.magSize - this.currentMag;
                const ammoToAdd = Math.min(neededAmmo, this.reserveAmmo);
                this.currentMag += ammoToAdd;
                this.reserveAmmo -= ammoToAdd;
                this.isReloading = false;
                this.reloadProgress = 0;
                return true;
            }
        }
        return false;
    }

    cancelReload() {
        this.isReloading = false;
        this.reloadProgress = 0;
    }

    refillAmmo() {
        this.currentMag = this.data.magSize;
        this.reserveAmmo = this.data.reserveAmmo;
    }
}

// 创建武器实例
function createWeapon(type) {
    const data = WEAPONS[type];
    if (!data) {
        console.error('Unknown weapon type:', type);
        return null;
    }
    return new Weapon(data);
}
