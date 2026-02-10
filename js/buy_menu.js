// FrostBite Arena - 购买菜单系统 (CS 1.6风格)

// 商品价格配置
const BUY_MENU_ITEMS = {
    // 装备
    equipment: {
        name: '装备',
        items: {
            vest: { name: '防弹衣', price: 650, armor: 100 },
            helmet: { name: '头盔+防弹衣', price: 1000, armor: 100, helmet: true }
        }
    },
    // 主武器
    primary: {
        name: '主武器',
        items: {
            frostbite_rifle: { name: 'Frostbite步枪', price: 2750 },
            hailstorm_smg: { name: 'Hailstorm冲锋枪', price: 1500 },
            glacier_shotgun: { name: 'Glacier霰弹枪', price: 1700 },
            blizzard_sniper: { name: 'Blizzard狙击枪', price: 4750 }
        }
    },
    // 副武器
    sidearm: {
        name: '副武器',
        items: {
            mk9_pistol: { name: 'MK-9手枪', price: 500 }
        }
    },
    // 弹药
    ammo: {
        name: '弹药',
        items: {
            primary_ammo: { name: '主武器弹药', price: 200 },
            sidearm_ammo: { name: '副武器弹药', price: 100 }
        }
    },
    // 投掷物
    grenades: {
        name: '投掷物',
        items: {
            he_grenade: { name: '手雷', price: 300, max: 2 },
            flashbang: { name: '闪光弹', price: 200, max: 2 },
            smoke: { name: '烟雾弹', price: 300, max: 2 }
        }
    }
};

// 购买菜单类
class BuyMenu {
    constructor(player, hud) {
        this.player = player;
        this.hud = hud;
        this.isOpen = false;
        this.currentCategory = null;

        this.createUI();
        this.setupKeyBindings();
    }

    // 更新玩家引用（用于复活或重新开始游戏时同步）
    updatePlayer(player) {
        this.player = player;
    }

    createUI() {
        // 检查是否已经存在购买菜单，如果存在则移除
        const existingMenu = document.getElementById('buy-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // 创建购买菜单容器
        this.menuElement = document.createElement('div');
        this.menuElement.id = 'buy-menu';
        this.menuElement.className = 'buy-menu hidden';
        this.menuElement.innerHTML = `
            <div class="buy-menu-container">
                <div class="buy-menu-header">
                    <h2>购买菜单</h2>
                    <div class="player-money">$<span class="buy-menu-money">800</span></div>
                </div>
                <div class="buy-menu-content">
                    <div class="buy-categories">
                        <div class="buy-category" data-category="equipment">
                            <span class="key">1</span> 装备
                        </div>
                        <div class="buy-category" data-category="primary">
                            <span class="key">2</span> 主武器
                        </div>
                        <div class="buy-category" data-category="sidearm">
                            <span class="key">3</span> 副武器
                        </div>
                        <div class="buy-category" data-category="ammo">
                            <span class="key">4</span> 弹药
                        </div>
                        <div class="buy-category" data-category="grenades">
                            <span class="key">5</span> 投掷物
                        </div>
                    </div>
                    <div class="buy-items buy-items-list">
                        <div class="buy-hint">选择分类 (1-5)</div>
                    </div>
                </div>
                <div class="buy-menu-footer">
                    <span>按 B 关闭 | 数字键选择</span>
                </div>
            </div>
        `;

        document.getElementById('game-container').appendChild(this.menuElement);

        // 缓存 DOM 元素引用（使用内部元素查找，避免全局 getElementById）
        this.moneyElement = this.menuElement.querySelector('.buy-menu-money');
        this.itemsListElement = this.menuElement.querySelector('.buy-items-list');

        // 绑定分类点击事件
        this.menuElement.querySelectorAll('.buy-category').forEach(cat => {
            cat.addEventListener('click', () => {
                this.selectCategory(cat.dataset.category);
            });
        });
    }

    setupKeyBindings() {
        // 键盘事件在game.js中处理，这里只提供接口
    }

    open() {
        if (!this.player || !this.player.isAlive) return;

        this.isOpen = true;
        this.currentCategory = null;
        this.menuElement.classList.remove('hidden');
        this.updateMoney();
        this.showCategories();

        // 释放鼠标锁定
        document.exitPointerLock();
    }

    close() {
        this.isOpen = false;
        this.currentCategory = null;
        this.menuElement.classList.add('hidden');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    updateMoney() {
        if (this.moneyElement && this.player) {
            // 使用 ?? 运算符，只有当 money 为 undefined 或 null 时才使用默认值
            this.moneyElement.textContent = this.player.money ?? 800;
        }
    }

    showCategories() {
        if (this.itemsListElement) {
            this.itemsListElement.innerHTML = '<div class="buy-hint">选择分类 (1-5)</div>';
        }

        // 移除所有分类的选中状态
        this.menuElement.querySelectorAll('.buy-category').forEach(cat => {
            cat.classList.remove('selected');
        });
    }

    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        const category = BUY_MENU_ITEMS[categoryId];
        if (!category || !this.itemsListElement) return;

        // 高亮当前分类
        this.menuElement.querySelectorAll('.buy-category').forEach(cat => {
            cat.classList.toggle('selected', cat.dataset.category === categoryId);
        });

        // 显示该分类的物品
        let html = '';
        let index = 1;

        for (const [itemId, item] of Object.entries(category.items)) {
            const canAfford = (this.player?.money ?? 800) >= item.price;
            const affordClass = canAfford ? '' : 'cannot-afford';

            html += `
                <div class="buy-item ${affordClass}" data-item="${itemId}" data-category="${categoryId}">
                    <span class="key">${index}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">$${item.price}</span>
                </div>
            `;
            index++;
        }

        this.itemsListElement.innerHTML = html;

        // 绑定物品点击事件
        this.itemsListElement.querySelectorAll('.buy-item').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                this.buyItem(itemEl.dataset.category, itemEl.dataset.item);
            });
        });
    }

    handleKeyPress(keyCode) {
        if (!this.isOpen) return false;

        // ESC或B关闭菜单
        if (keyCode === 'Escape' || keyCode === 'KeyB') {
            this.close();
            return true;
        }

        // 数字键
        const num = this.getNumberFromKeyCode(keyCode);
        if (num === null) return false;

        if (this.currentCategory === null) {
            // 选择分类
            const categories = ['equipment', 'primary', 'sidearm', 'ammo', 'grenades'];
            if (num >= 1 && num <= categories.length) {
                this.selectCategory(categories[num - 1]);
            }
        } else {
            // 选择物品
            const category = BUY_MENU_ITEMS[this.currentCategory];
            const items = Object.entries(category.items);
            if (num >= 1 && num <= items.length) {
                const [itemId] = items[num - 1];
                this.buyItem(this.currentCategory, itemId);
            }
        }

        return true;
    }

    getNumberFromKeyCode(keyCode) {
        if (keyCode.startsWith('Digit')) {
            return parseInt(keyCode.replace('Digit', ''));
        }
        if (keyCode.startsWith('Numpad')) {
            return parseInt(keyCode.replace('Numpad', ''));
        }
        return null;
    }

    buyItem(categoryId, itemId) {
        const category = BUY_MENU_ITEMS[categoryId];
        if (!category) return false;

        const item = category.items[itemId];
        if (!item) return false;

        const playerMoney = this.player?.money ?? 800;

        if (playerMoney < item.price) {
            this.showMessage('金钱不足!');
            audioManager.play('empty');
            return false;
        }

        // 执行购买
        let success = false;

        switch (categoryId) {
            case 'equipment':
                success = this.buyEquipment(itemId, item);
                break;
            case 'primary':
            case 'sidearm':
                success = this.buyWeapon(itemId, item, categoryId);
                break;
            case 'ammo':
                success = this.buyAmmo(itemId, item);
                break;
            case 'grenades':
                success = this.buyGrenade(itemId, item);
                break;
        }

        if (success) {
            this.player.money -= item.price;
            this.updateMoney();
            this.selectCategory(categoryId); // 刷新列表
            audioManager.play('pickup');
            this.showMessage(`购买了 ${item.name}`);
        }

        return success;
    }

    buyEquipment(itemId, item) {
        if (itemId === 'vest' || itemId === 'helmet') {
            if (this.player.armor >= 100) {
                this.showMessage('护甲已满!');
                return false;
            }
            this.player.armor = Math.min(100, this.player.armor + item.armor);
            if (item.helmet) {
                this.player.hasHelmet = true;
            }
            return true;
        }
        return false;
    }

    buyWeapon(weaponId, item, slot) {
        // 检查是否已有相同武器
        const currentWeapon = this.player.weapons[slot];
        if (currentWeapon && currentWeapon.data.id === weaponId) {
            this.showMessage('已拥有该武器!');
            return false;
        }

        this.player.equipWeapon(weaponId, slot);
        this.player.selectSlot(slot);
        return true;
    }

    buyAmmo(itemId, item) {
        if (itemId === 'primary_ammo') {
            const weapon = this.player.weapons.primary;
            if (!weapon) {
                this.showMessage('没有主武器!');
                return false;
            }
            if (weapon.reserveAmmo >= weapon.data.reserveAmmo) {
                this.showMessage('弹药已满!');
                return false;
            }
            weapon.reserveAmmo = weapon.data.reserveAmmo;
            return true;
        }
        if (itemId === 'sidearm_ammo') {
            const weapon = this.player.weapons.sidearm;
            if (!weapon) {
                this.showMessage('没有副武器!');
                return false;
            }
            if (weapon.reserveAmmo >= weapon.data.reserveAmmo) {
                this.showMessage('弹药已满!');
                return false;
            }
            weapon.reserveAmmo = weapon.data.reserveAmmo;
            return true;
        }
        return false;
    }

    buyGrenade(grenadeId, item) {
        // 初始化投掷物背包
        if (!this.player.grenades) {
            this.player.grenades = {
                he_grenade: 0,
                flashbang: 0,
                smoke: 0
            };
        }

        const current = this.player.grenades[grenadeId] || 0;
        const max = item.max || 1;

        if (current >= max) {
            this.showMessage(`${item.name}已达上限!`);
            return false;
        }

        this.player.grenades[grenadeId] = current + 1;
        return true;
    }

    showMessage(text) {
        if (this.hud) {
            this.hud.showCenterMessage(text, 1500);
        }
    }
}

// 导出
window.BuyMenu = BuyMenu;
window.BUY_MENU_ITEMS = BUY_MENU_ITEMS;
