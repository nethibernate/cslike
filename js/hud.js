// FrostBite Arena - HUD控制器
class HUD {
    constructor() {
        this.elements = {
            healthValue: document.getElementById('health-value'),
            armorValue: document.getElementById('armor-value'),
            moneyValue: document.getElementById('money-value'),
            currentAmmo: document.getElementById('current-ammo'),
            reserveAmmo: document.getElementById('reserve-ammo'),
            weaponName: document.getElementById('weapon-name'),
            timer: document.getElementById('timer'),
            blueScore: document.getElementById('blue-score'),
            redScore: document.getElementById('red-score'),
            centerMessage: document.getElementById('center-message'),
            killFeed: document.getElementById('kill-feed'),
            fpsDisplay: document.getElementById('fps-display'),
            reloadIndicator: document.getElementById('reload-indicator'),
            hitMarker: document.getElementById('hit-marker'),
            crosshair: document.getElementById('crosshair'),
            scopeOverlay: document.getElementById('scope-overlay'),
            hud: document.getElementById('hud')
        };

        this.hitMarkerTimeout = null;
    }

    update(player, roundTime, scores) {
        if (!player) return;

        // 生命值
        if (this.elements.healthValue) {
            this.elements.healthValue.textContent = Math.ceil(player.health);

            // 低血量警告
            if (player.health <= 30) {
                this.elements.hud.classList.add('low-health');
            } else {
                this.elements.hud.classList.remove('low-health');
            }
        }

        // 护甲
        if (this.elements.armorValue) {
            this.elements.armorValue.textContent = Math.ceil(player.armor);
        }

        // 金钱
        if (this.elements.moneyValue) {
            this.elements.moneyValue.textContent = player.money || 0;
        }

        // 弹药/投掷物显示
        if (player.currentGrenade) {
            // 显示当前选中的投掷物
            const grenadeNames = {
                'he_grenade': '手雷',
                'flashbang': '闪光弹',
                'smoke': '烟雾弹'
            };
            const count = player.grenades[player.currentGrenade] || 0;
            if (this.elements.currentAmmo) {
                this.elements.currentAmmo.textContent = count;
            }
            if (this.elements.reserveAmmo) {
                this.elements.reserveAmmo.textContent = '0';
            }
            if (this.elements.weaponName) {
                // 显示拉保险状态
                const baseName = grenadeNames[player.currentGrenade] || '投掷物';
                const pinStatus = player.grenadePinPulled ? ' [拉保险]' : '';
                this.elements.weaponName.textContent = baseName + pinStatus;
            }
            this.showReloading(false);
        } else if (player.currentWeapon) {
            if (this.elements.currentAmmo) {
                this.elements.currentAmmo.textContent = player.currentWeapon.currentMag;
            }
            if (this.elements.reserveAmmo) {
                this.elements.reserveAmmo.textContent = player.currentWeapon.reserveAmmo;
            }
            if (this.elements.weaponName) {
                this.elements.weaponName.textContent = player.currentWeapon.data.name;
            }

            // 换弹提示
            if (player.currentWeapon.isReloading) {
                this.showReloading(true);
            } else {
                this.showReloading(false);
            }

            // 瞄准镜状态（狙击枪功能 - 圆形望远镜效果）
            if (this.elements.crosshair) {
                if (player.isScoped) {
                    // 开镜时显示圆形瞄准镜
                    this.elements.crosshair.classList.add('scoped');
                    if (this.elements.scopeOverlay) {
                        this.elements.scopeOverlay.classList.add('active');
                    }
                } else {
                    this.elements.crosshair.classList.remove('scoped');
                    if (this.elements.scopeOverlay) {
                        this.elements.scopeOverlay.classList.remove('active');
                    }
                }
            }
        }

        // 计时器
        if (roundTime !== undefined && this.elements.timer) {
            const minutes = Math.floor(roundTime / 60);
            const seconds = Math.floor(roundTime % 60);
            this.elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // 分数
        if (scores) {
            if (this.elements.blueScore) {
                this.elements.blueScore.textContent = scores.blue;
            }
            if (this.elements.redScore) {
                this.elements.redScore.textContent = scores.red;
            }
        }

        // 十字准星散布
        this.updateCrosshair(player.getAccuracy());
    }

    updateCrosshair(accuracy) {
        if (!this.elements.crosshair) return;

        // 根据精准度调整准星间距
        const gap = 8 + (1 - accuracy) * 20;
        const lines = this.elements.crosshair.querySelectorAll('.crosshair-line');

        lines.forEach(line => {
            if (line.classList.contains('top')) {
                line.style.bottom = `${gap}px`;
            } else if (line.classList.contains('bottom')) {
                line.style.top = `${gap}px`;
            } else if (line.classList.contains('left')) {
                line.style.right = `${gap}px`;
            } else if (line.classList.contains('right')) {
                line.style.left = `${gap}px`;
            }
        });
    }

    showHitMarker(isHeadshot = false) {
        if (!this.elements.hitMarker) return;

        // 清除之前的定时器
        if (this.hitMarkerTimeout) {
            clearTimeout(this.hitMarkerTimeout);
        }

        // 显示命中标记
        this.elements.hitMarker.classList.remove('hidden');
        if (isHeadshot) {
            this.elements.hitMarker.classList.add('headshot');
        } else {
            this.elements.hitMarker.classList.remove('headshot');
        }

        // 0.15秒后隐藏
        this.hitMarkerTimeout = setTimeout(() => {
            this.elements.hitMarker.classList.add('hidden');
        }, 150);
    }

    showReloading(show) {
        if (!this.elements.reloadIndicator) return;

        if (show) {
            this.elements.reloadIndicator.classList.remove('hidden');
        } else {
            this.elements.reloadIndicator.classList.add('hidden');
        }
    }

    showCenterMessage(text, duration = 2000) {
        if (!this.elements.centerMessage) return;

        this.elements.centerMessage.textContent = text;
        this.elements.centerMessage.classList.remove('hidden');

        setTimeout(() => {
            this.elements.centerMessage.classList.add('hidden');
        }, duration);
    }

    addKillFeedEntry(killer, victim, weapon, isHeadshot = false) {
        if (!this.elements.killFeed) return;

        const entry = document.createElement('div');
        entry.className = 'kill-entry';

        const headshotIcon = isHeadshot ? ' ✦' : '';
        entry.innerHTML = `
            <span class="killer">${killer}</span>
            <span class="weapon">[${weapon}]${headshotIcon}</span>
            <span class="victim">${victim}</span>
        `;

        this.elements.killFeed.appendChild(entry);

        // 保持最多5条
        while (this.elements.killFeed.children.length > 5) {
            this.elements.killFeed.removeChild(this.elements.killFeed.firstChild);
        }

        // 5秒后移除
        setTimeout(() => {
            if (entry.parentNode) {
                entry.remove();
            }
        }, 5000);
    }

    updateFPS(fps) {
        if (this.elements.fpsDisplay && CONFIG.settings.showFps) {
            this.elements.fpsDisplay.textContent = `FPS: ${fps}`;
            this.elements.fpsDisplay.style.display = 'block';
        } else if (this.elements.fpsDisplay) {
            this.elements.fpsDisplay.style.display = 'none';
        }
    }

    show() {
        if (this.elements.hud) {
            this.elements.hud.style.display = 'block';
        }
    }

    hide() {
        if (this.elements.hud) {
            this.elements.hud.style.display = 'none';
        }
    }
}
