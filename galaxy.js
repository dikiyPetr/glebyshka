const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Фоновые звезды - распределены по всей высоте контента
const stars = [];
const totalContentHeight = window.innerHeight * CONFIG.contentHeightMultiplier;

for (let i = 0; i < CONFIG.stars.count; i++) {
    const scrollPosition = Math.random();
    stars.push({
        x: Math.random() * canvas.width,
        contentY: scrollPosition * totalContentHeight,
        size: Math.random() * CONFIG.stars.maxSize,
        brightness: Math.random(),
        speed: Math.random() * CONFIG.stars.brightnessSpeed,
        density: 1 - scrollPosition // Инвертируем: вверху плотнее, внизу меньше
    });
}

// Галактики с расположением от центра ВВЕРХУ контента
const galaxies = [];

const centerX = canvas.width / 2;
const galaxyCenterY = canvas.height / 2; // Центр ВВЕРХУ контента
const minDistance = CONFIG.galaxies.distance.min;
const maxDistance = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)) * CONFIG.galaxies.distance.maxMultiplier;

// Базовые размеры галактик зависят от ширины экрана
const screenWidthFactor = canvas.width / 1920;
const mainGalaxySize = (CONFIG.galaxies.mainGalaxy.size.min + Math.random() * (CONFIG.galaxies.mainGalaxy.size.max - CONFIG.galaxies.mainGalaxy.size.min)) * screenWidthFactor;
const otherGalaxyMinSize = CONFIG.galaxies.regularGalaxy.size.min * screenWidthFactor;
const otherGalaxyMaxSize = CONFIG.galaxies.regularGalaxy.size.max * screenWidthFactor;

// Генерируем полностью случайные параметры для каждой галактики
for (let i = 0; i < CONFIG.galaxies.total; i++) {
    const size = i === 0 ? mainGalaxySize : otherGalaxyMinSize + Math.random() * (otherGalaxyMaxSize - otherGalaxyMinSize);
    const color = [
        Math.floor(CONFIG.galaxies.color.min + Math.random() * (CONFIG.galaxies.color.max - CONFIG.galaxies.color.min)),
        Math.floor(CONFIG.galaxies.color.min + Math.random() * (CONFIG.galaxies.color.max - CONFIG.galaxies.color.min)),
        Math.floor(CONFIG.galaxies.color.min + Math.random() * (CONFIG.galaxies.color.max - CONFIG.galaxies.color.min))
    ];
    const speed = CONFIG.galaxies.rotationSpeed.min + Math.random() * (CONFIG.galaxies.rotationSpeed.max - CONFIG.galaxies.rotationSpeed.min);
    const scaleX = i === 0 ? CONFIG.galaxies.mainScale.x : CONFIG.galaxies.otherScale.x.min + Math.random() * (CONFIG.galaxies.otherScale.x.max - CONFIG.galaxies.otherScale.x.min);
    const scaleY = i === 0 ? CONFIG.galaxies.mainScale.y.min + Math.random() * (CONFIG.galaxies.mainScale.y.max - CONFIG.galaxies.mainScale.y.min) : CONFIG.galaxies.otherScale.y.min + Math.random() * (CONFIG.galaxies.otherScale.y.max - CONFIG.galaxies.otherScale.y.min);
    const rotationZ = i === 0 ? 0 : Math.random() * Math.PI * 2;

    if (i === 0) {
        // Главная галактика вверху
        galaxies.push({
            x: centerX,
            contentY: galaxyCenterY,
            size: size,
            color: color,
            speed: -speed,
            scaleX: scaleX,
            scaleY: scaleY,
            rotationZ: rotationZ,
            internalRotation: 0
        });
    } else if (i <= CONFIG.galaxies.aroundMain) {
        // Галактики вокруг главной (вверху)
        const angleStep = (Math.PI * 2) / CONFIG.galaxies.aroundMain;
        const baseAngle = angleStep * (i - 1);
        const angleVariation = (Math.random() - 0.5) * angleStep * 0.5;
        const angle = baseAngle + angleVariation;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);

        const x = centerX + Math.cos(angle) * distance;
        const contentY = galaxyCenterY + Math.sin(angle) * distance;

        galaxies.push({
            x: x,
            contentY: contentY,
            size: size,
            color: color,
            speed: speed,
            scaleX: scaleX,
            scaleY: scaleY,
            rotationZ: rotationZ,
            internalRotation: 0
        });
    } else {
        // Дополнительные галактики разбросаны по пути (от верха вниз)
        const scrollPosition = CONFIG.galaxies.scatteredPosition.min + Math.random() * (CONFIG.galaxies.scatteredPosition.max - CONFIG.galaxies.scatteredPosition.min);
        const x = Math.random() * canvas.width;
        const contentY = scrollPosition * totalContentHeight;

        galaxies.push({
            x: x,
            contentY: contentY,
            size: size,
            color: color,
            speed: speed,
            scaleX: scaleX,
            scaleY: scaleY,
            rotationZ: rotationZ,
            internalRotation: 0
        });
    }
}

// Создаем звезды для каждой галактики
galaxies.forEach((galaxy, index) => {
    galaxy.stars = [];

    // Выбираем конфиг в зависимости от типа галактики
    const starsConfig = index === 0 ? CONFIG.galaxies.mainGalaxy.stars : CONFIG.galaxies.regularGalaxy.stars;

    // Рандомизируем параметры для каждой галактики
    const arms = Math.floor(starsConfig.arms.min + Math.random() * (starsConfig.arms.max - starsConfig.arms.min + 1));
    const starsPerArm = Math.floor(starsConfig.count.min + Math.random() * (starsConfig.count.max - starsConfig.count.min + 1));
    const maxSize = starsConfig.maxSize.min + Math.random() * (starsConfig.maxSize.max - starsConfig.maxSize.min);
    const brightness = starsConfig.brightness.min + Math.random() * (starsConfig.brightness.max - starsConfig.brightness.min);
    const clusterOffset = starsConfig.clusterOffset.min + Math.random() * (starsConfig.clusterOffset.max - starsConfig.clusterOffset.min);
    const densityPower = starsConfig.densityPower.min + Math.random() * (starsConfig.densityPower.max - starsConfig.densityPower.min);

    // Сохраняем параметры в галактике
    galaxy.brightness = brightness;

    for (let arm = 0; arm < arms; arm++) {
        const armAngle = (Math.PI * 2 / arms) * arm;

        for (let i = 0; i < starsPerArm; i++) {
            const distance = (i / starsPerArm) * galaxy.size;
            const baseAngle = armAngle + (i / starsPerArm) * Math.PI * 4;

            const normalizedDistance = distance / galaxy.size;
            const density = Math.pow(1 - normalizedDistance, densityPower);

            const size = Math.random() * maxSize * density;
            const variation = Math.random() * 50 - 25;

            const offset = (Math.random() - 0.5) * clusterOffset * distance;

            galaxy.stars.push({
                distance: distance,
                baseAngle: baseAngle,
                clusterOffset: offset,
                size: size,
                r: Math.max(0, Math.min(255, galaxy.color[0] + variation)),
                g: Math.max(0, Math.min(255, galaxy.color[1] + variation)),
                b: Math.max(0, Math.min(255, galaxy.color[2] + variation)),
                brightness: Math.random(),
                brightnessSpeed: (Math.random() * (starsConfig.brightnessSpeed.max - starsConfig.brightnessSpeed.min) + starsConfig.brightnessSpeed.min) * (Math.random() > 0.5 ? 1 : -1),
                baseDensity: density
            });
        }
    }
});

function drawStars(scrollY) {
    const scrollProgress = scrollY / (totalContentHeight - canvas.height); // 0-1

    stars.forEach(star => {
        // Вычисляем экранную позицию звезды
        const screenY = star.contentY - scrollY;

        // Проверяем, видна ли звезда на экране
        if (screenY < -50 || screenY > canvas.height + 50) return;

        // Плотность и видимость зависят от прогресса скролла (инвертировано)
        const visibilityEnd = 1 - star.density * 0.7; // Звезды исчезают при скролле вниз
        if (scrollProgress > visibilityEnd) return;

        const visibilityProgress = Math.min(1, 1 - (scrollProgress - (visibilityEnd - 0.3)) / 0.3);

        star.brightness += star.speed;
        if (star.brightness > 1 || star.brightness < 0) star.speed *= -1;

        const finalOpacity = star.brightness * Math.max(0, visibilityProgress);

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(star.x, screenY, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (star.brightness > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(star.brightness - 0.7) * 0.5 * Math.max(0, visibilityProgress)})`;
            ctx.beginPath();
            ctx.arc(star.x, screenY, star.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawGalaxy(galaxy, scrollY) {
    const screenY = galaxy.contentY - scrollY;

    // Проверяем, видна ли галактика на экране (с запасом)
    if (screenY < -galaxy.size * 2 || screenY > canvas.height + galaxy.size * 2) return;

    const { x, size, color, scaleX, scaleY, rotationZ, internalRotation } = galaxy;

    // Плавное исчезновение галактики при скролле вниз
    const scrollProgress = scrollY / (totalContentHeight - canvas.height);
    const galaxyDisappearEnd = (galaxy.contentY / totalContentHeight) + 0.2;
    if (scrollProgress > galaxyDisappearEnd) return;

    const appearProgress = Math.min(1, 1 - Math.max(0, (scrollProgress - (galaxyDisappearEnd - 0.2)) / 0.2));

    ctx.save();
    ctx.globalAlpha = appearProgress;
    ctx.translate(x, screenY);
    ctx.rotate(rotationZ);
    ctx.scale(scaleX, scaleY);

    // Центральное ядро
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
    coreGradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
    coreGradient.addColorStop(0.3, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`);
    coreGradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Рисуем звезды
    galaxy.stars.forEach(star => {
        star.brightness += star.brightnessSpeed;
        if (star.brightness > 1) {
            star.brightness = 1;
            star.brightnessSpeed *= -1;
        } else if (star.brightness < 0.3) {
            star.brightness = 0.3;
            star.brightnessSpeed *= -1;
        }

        const currentAngle = star.baseAngle + internalRotation;
        const perpAngle = currentAngle + Math.PI / 2;
        const offsetX = Math.cos(perpAngle) * star.clusterOffset;
        const offsetY = Math.sin(perpAngle) * star.clusterOffset;

        const starX = Math.cos(currentAngle) * star.distance + offsetX;
        const starY = Math.sin(currentAngle) * star.distance + offsetY;

        const opacity = star.baseDensity * galaxy.brightness * star.brightness;

        ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (opacity > 0.5) {
            ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(starX, starY, star.size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Внешнее свечение
    const outerGlow = ctx.createRadialGradient(0, 0, size * 0.7, 0, 0, size * CONFIG.galaxies.glow.outerSize);
    outerGlow.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${CONFIG.galaxies.glow.outerIntensity})`);
    outerGlow.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, size * CONFIG.galaxies.glow.outerSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Генерируем случайную солнечную систему
const solarSystemData = {
    // 3D поворот
    rotationX: CONFIG.solarSystem.rotation.x.min + Math.random() * (CONFIG.solarSystem.rotation.x.max - CONFIG.solarSystem.rotation.x.min),
    rotationY: CONFIG.solarSystem.rotation.y.min + Math.random() * (CONFIG.solarSystem.rotation.y.max - CONFIG.solarSystem.rotation.y.min),

    // Параметры звезды
    star: {
        size: CONFIG.solarSystem.star.size.min + Math.random() * (CONFIG.solarSystem.star.size.max - CONFIG.solarSystem.star.size.min),
        glowSize: CONFIG.solarSystem.star.glowSize.min + Math.random() * (CONFIG.solarSystem.star.glowSize.max - CONFIG.solarSystem.star.glowSize.min),
        color: [
            Math.floor(CONFIG.solarSystem.star.color.r.min + Math.random() * (CONFIG.solarSystem.star.color.r.max - CONFIG.solarSystem.star.color.r.min)),
            Math.floor(CONFIG.solarSystem.star.color.g.min + Math.random() * (CONFIG.solarSystem.star.color.g.max - CONFIG.solarSystem.star.color.g.min)),
            Math.floor(CONFIG.solarSystem.star.color.b.min + Math.random() * (CONFIG.solarSystem.star.color.b.max - CONFIG.solarSystem.star.color.b.min))
        ]
    },

    // Генерируем планеты
    planets: []
};

const planetsCount = Math.floor(CONFIG.solarSystem.planetsCount.min + Math.random() * (CONFIG.solarSystem.planetsCount.max - CONFIG.solarSystem.planetsCount.min + 1));
for (let i = 0; i < planetsCount; i++) {
    const planet = {
        distance: CONFIG.solarSystem.planets.distance.min + i * CONFIG.solarSystem.planets.distance.step + Math.random() * 40,
        size: CONFIG.solarSystem.planets.size.min + Math.random() * (CONFIG.solarSystem.planets.size.max - CONFIG.solarSystem.planets.size.min),
        speed: CONFIG.solarSystem.planets.speed.min + Math.random() * (CONFIG.solarSystem.planets.speed.max - CONFIG.solarSystem.planets.speed.min),
        color: [
            Math.floor(CONFIG.solarSystem.planets.color.r.min + Math.random() * (CONFIG.solarSystem.planets.color.r.max - CONFIG.solarSystem.planets.color.r.min)),
            Math.floor(CONFIG.solarSystem.planets.color.g.min + Math.random() * (CONFIG.solarSystem.planets.color.g.max - CONFIG.solarSystem.planets.color.g.min)),
            Math.floor(CONFIG.solarSystem.planets.color.b.min + Math.random() * (CONFIG.solarSystem.planets.color.b.max - CONFIG.solarSystem.planets.color.b.min))
        ],
        angle: Math.random() * Math.PI * 2
    };

    // Добавляем подпись к особенной планете
    if (i === CONFIG.solarSystem.specialPlanet.index && i < planetsCount) {
        planet.label = CONFIG.solarSystem.specialPlanet.label;
    }

    solarSystemData.planets.push(planet);
}

// Функция easeInCubic для ускорения
function easeInCubic(t) {
    return t * t * t;
}

// ========================================
// КЛАССЫ РЕЖИМОВ
// ========================================

// Базовый класс для всех режимов
class Mode {
    constructor(name) {
        this.name = name;
        this.active = false;
        this.startTime = null;
    }

    // Методы жизненного цикла
    onEnter(currentTime) {
        this.active = true;
        this.startTime = currentTime;
        console.log(`[${this.name}] Enter`);
    }

    onUpdate(currentTime, scrollY, ctx, canvas) {
        // Переопределяется в дочерних классах
    }

    onExit() {
        this.active = false;
        console.log(`[${this.name}] Exit`);
    }

    // Проверка условия активации
    shouldActivate(scrollY, currentTime) {
        return false;
    }

    // Проверка условия завершения
    shouldComplete(currentTime) {
        return false;
    }
}

// Режим обычного просмотра галактик (базовый режим)
class NormalMode extends Mode {
    constructor() {
        super('Normal');
    }

    shouldActivate() {
        // Режим активен всегда, когда нет других режимов
        return true;
    }

    onEnter(currentTime) {
        super.onEnter(currentTime);
    }

    onUpdate(currentTime, scrollY, ctx, canvas) {
        // Никаких особых обновлений - просто рисуем галактики
    }

    shouldComplete(currentTime) {
        // Режим завершается только при активации другого режима
        return false;
    }

    render(scrollY, ctx, canvas) {
        // Рисуем звезды и галактики
        drawStars(scrollY);

        galaxies.forEach(galaxy => {
            galaxy.internalRotation += galaxy.speed;
            drawGalaxy(galaxy, scrollY);
        });
    }
}

// Режим галактик (приближение к главной галактике)
class GalaxyZoomMode extends Mode {
    constructor() {
        super('GalaxyZoom');
        this.zoomProgress = 0;
        this.currentZoom = 1;
        this.flashStarted = false;
        this.flashProgress = 0;
        this.flashStartTime = null;
        this._completionLogged = false;
    }

    shouldActivate(scrollY) {
        return scrollY <= CONFIG.zoomMode.triggerScrollY;
    }

    onEnter(currentTime) {
        super.onEnter(currentTime);
        // НЕ блокируем скролл, НЕ меняем позицию - ждем, когда пользователь скроллит вверх
    }

    onUpdate(currentTime, scrollY, ctx, canvas) {
        const elapsed = currentTime - this.startTime;
        // Фаза 1: Задержка перед началом приближения
        if (elapsed < CONFIG.zoomMode.initialDelay) {
            this.zoomProgress = 0;
            this.currentZoom = 1;
        }
        // Фаза 2: Приближение к галактике
        else {
            const zoomElapsed = elapsed - CONFIG.zoomMode.initialDelay;
            const linearProgress = Math.min(1, zoomElapsed / CONFIG.zoomMode.zoomDuration);

            this.zoomProgress = easeInCubic(linearProgress);
            this.currentZoom = 1 + this.zoomProgress * CONFIG.zoomMode.maxZoom;

            // Проверяем, достигнут ли порог для вспышки
            if (this.currentZoom >= CONFIG.zoomMode.zoomToTriggerFlash && !this.flashStarted) {
                this.flashStarted = true;
                this.flashStartTime = currentTime;
                console.log('[GalaxyZoomMode] Flash started!');
            }

            // Обновление прогресса вспышки
            if (this.flashStarted) {
                const flashElapsed = currentTime - this.flashStartTime;
                this.flashProgress = Math.min(1, flashElapsed / CONFIG.zoomMode.flashDuration);
            }
        }
    }

    shouldComplete(currentTime) {
        const isComplete = this.flashStarted && this.flashProgress >= 1;
        if (isComplete && !this._completionLogged) {
            console.log(`[GalaxyZoomMode] Complete! flashStarted: ${this.flashStarted}, flashProgress: ${this.flashProgress}`);
            this._completionLogged = true;
        }
        return isComplete;
    }

    onExit() {
        super.onExit();
        // Разблокируем скролл
        document.body.style.overflow = 'auto';
        // НЕ скроллим автоматически - пользователь сам может посмотреть на солнечную систему
    }

    render(scrollY, ctx, canvas) {
        const mainGalaxy = galaxies[0];

        // Скрываем все галактики и звезды, когда началась вспышка
        if (!this.flashStarted) {
            // Плавное затухание фоновых звезд
            const starsFadeOut = 1 - this.zoomProgress;
            if (starsFadeOut > 0) {
                ctx.globalAlpha = starsFadeOut;
                drawStars(scrollY);
                ctx.globalAlpha = 1;
            }

            // Отдаление других галактик от центра
            const pushMultiplier = 1 + this.zoomProgress * 2;
            const fadeOutGalaxies = 1 - this.zoomProgress;

            galaxies.forEach((galaxy, index) => {
                galaxy.internalRotation += galaxy.speed;

                if (index !== 0) {
                    const centerScreenX = canvas.width / 2;
                    const centerScreenY = canvas.height / 2;
                    const galaxyScreenY = galaxy.contentY - scrollY;

                    const deltaX = galaxy.x - centerScreenX;
                    const deltaY = galaxyScreenY - centerScreenY;

                    const pushedX = centerScreenX + deltaX * pushMultiplier;
                    const pushedY = centerScreenY + deltaY * pushMultiplier;

                    const originalX = galaxy.x;
                    const originalContentY = galaxy.contentY;

                    galaxy.x = pushedX;
                    galaxy.contentY = pushedY + scrollY;

                    ctx.globalAlpha = fadeOutGalaxies;
                    drawGalaxy(galaxy, scrollY);
                    ctx.globalAlpha = 1;

                    galaxy.x = originalX;
                    galaxy.contentY = originalContentY;
                }
            });

            // Приближение главной галактики
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(this.currentZoom, this.currentZoom);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            mainGalaxy.internalRotation += mainGalaxy.speed;
            drawGalaxy(mainGalaxy, scrollY);

            ctx.restore();
        }

        // Вспышка
        if (this.flashStarted && this.flashProgress < 1) {
            drawFlash(mainGalaxy.color, this.flashProgress);
        }
    }
}

// Режим солнечной системы
class SolarSystemMode extends Mode {
    constructor() {
        super('SolarSystem');
        this.fadeInProgress = 0;
    }

    onEnter(currentTime) {
        super.onEnter(currentTime);
    }

    onUpdate(currentTime, scrollY, ctx, canvas) {
        const elapsed = currentTime - this.startTime;
        this.fadeInProgress = Math.min(1, elapsed / CONFIG.zoomMode.solarSystemFadeInDuration);
    }

    shouldComplete(currentTime) {
        // Режим завершается только при активации следующего режима
        return false;
    }

    render(scrollY, ctx, canvas) {
        const systemScale = CONFIG.zoomMode.solarSystemInitialScale +
                            (CONFIG.zoomMode.solarSystemFinalScale - CONFIG.zoomMode.solarSystemInitialScale) * this.fadeInProgress;

        ctx.save();
        ctx.globalAlpha = this.fadeInProgress;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(systemScale, systemScale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawSolarSystem();
        ctx.restore();
    }
}


// Менеджер режимов
class ModeManager {
    constructor() {
        this.modes = {
            normal: new NormalMode(),
            galaxyZoom: new GalaxyZoomMode(),
            solarSystem: new SolarSystemMode(),
        };
        this.currentMode = 'normal';
        // Активируем режим Normal сразу
        this.modes.normal.onEnter(performance.now());
    }

    update(currentTime, scrollY, ctx, canvas) {
        // Normal режим проверяет условия для перехода в режим зума
        if (this.modes.normal.active) {
            this.modes.normal.onUpdate(currentTime, scrollY, ctx, canvas);

            // Проверяем, нужно ли активировать режим зума
            if (this.modes.galaxyZoom.shouldActivate(scrollY)) {
                this.modes.normal.onExit();
                this.modes.galaxyZoom.onEnter(currentTime);
                this.currentMode = 'galaxyZoom';
                // Блокируем скролл для зума
                document.body.style.overflow = 'hidden';
            }
        }

        // Обновляем режим приближения к галактике
        if (this.modes.galaxyZoom.active) {
            this.modes.galaxyZoom.onUpdate(currentTime, scrollY, ctx, canvas);

            // Проверяем завершение режима галактики
            const isComplete = this.modes.galaxyZoom.shouldComplete(currentTime);
            if (isComplete) {
                console.log('[ModeManager] Transitioning from GalaxyZoom to SolarSystem');
                this.modes.solarSystem.onEnter(currentTime);
                this.modes.galaxyZoom.onExit();
                this.currentMode = 'solarSystem';
            }
        }

        if (this.modes.solarSystem.active) {
            this.modes.solarSystem.onUpdate(currentTime, scrollY, ctx, canvas);
        }
    }

    render(scrollY, ctx, canvas) {
        // Рисуем в зависимости от текущего режима
        if (this.modes.normal.active) {
            this.modes.normal.render(scrollY, ctx, canvas);
        }

        if (this.modes.galaxyZoom.active) {
            this.modes.galaxyZoom.render(scrollY, ctx, canvas);
        }

        if (this.modes.solarSystem.active) {
            this.modes.solarSystem.render(scrollY, ctx, canvas);
        }
        
        // Следующий режим (черный экран)
        if (this.currentMode === 'next') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    hasActiveMode() {
        return this.modes.normal.active ||
               this.modes.galaxyZoom.active ||
               this.modes.solarSystem.active ||
               this.modes.planetZoom.active ||
               this.currentMode === 'next';
    }
}

function drawFlash(galaxyColor, progress) {
    // Инвертируем прогресс: начинаем с 1 (полная яркость) и заканчиваем на 0 (затухание)
    const intensity = 1 - progress;
    const radius = canvas.width * (1 + progress * 2);

    const flashGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, radius
    );
    flashGradient.addColorStop(0, `rgba(${galaxyColor[0]}, ${galaxyColor[1]}, ${galaxyColor[2]}, ${intensity * 0.9})`);
    flashGradient.addColorStop(0.5, `rgba(${galaxyColor[0]}, ${galaxyColor[1]}, ${galaxyColor[2]}, ${intensity * 0.5})`);
    flashGradient.addColorStop(1, `rgba(${galaxyColor[0]}, ${galaxyColor[1]}, ${galaxyColor[2]}, 0)`);

    ctx.fillStyle = flashGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Функция для применения 3D поворота к координатам
function rotate3D(x, y, z, rotX, rotY) {
    // Поворот вокруг оси X
    let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

    // Поворот вокруг оси Y
    let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
    let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

    return { x: x2, y: y1, z: z2 };
}

function drawSolarSystem() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Вычисляем масштаб на основе минимальной стороны экрана
    const minScreenDimension = Math.min(canvas.width, canvas.height);
    const scale = minScreenDimension / 1000; // Базовый размер системы - 1000px

    const star = solarSystemData.star;
    const scaledStarSize = star.size * scale;
    const scaledGlowSize = star.glowSize * scale;

    // Подготавливаем данные планет с учетом Z-координат
    const planetsData = [];
    solarSystemData.planets.forEach((planet, index) => {
        const scaledDistance = planet.distance * scale;
        const scaledSize = planet.size * scale;

        // Обновляем угол
        planet.angle += planet.speed;

        // Вычисляем 3D позицию планеты на орбите
        const orbitX = Math.cos(planet.angle) * scaledDistance;
        const orbitY = 0; // Орбита в плоскости XZ
        const orbitZ = Math.sin(planet.angle) * scaledDistance;

        // Применяем 3D поворот
        const rotated = rotate3D(orbitX, orbitY, orbitZ, solarSystemData.rotationX, solarSystemData.rotationY);

        // Вычисляем финальный Z-индекс для сортировки
        // Z солнца = 0
        // Планеты за солнцем (rotated.z > 0): отрицательный z-индекс, чем дальше орбита, тем меньше
        // Планеты перед солнцем (rotated.z <= 0): положительный z-индекс, чем дальше орбита, тем больше
        let finalZ;
        if (rotated.z > 0) {
            // За солнцем: дальние планеты рисуются первыми (меньший z)
            finalZ = -(index + 1) - (rotated.z / scaledDistance);
        } else {
            // Перед солнцем: дальние планеты рисуются последними (больший z)
            finalZ = (index + 1) + Math.abs(rotated.z / scaledDistance);
        }

        planetsData.push({
            planet: planet,
            rotated: rotated,
            scaledDistance: scaledDistance,
            scaledSize: scaledSize,
            planetX: centerX + rotated.x,
            planetY: centerY + rotated.y,
            finalZ: finalZ,
            orbitIndex: index
        });
    });

    // Сортируем планеты по finalZ (от меньшего к большему - сначала дальние, потом ближние)
    planetsData.sort((a, b) => a.finalZ - b.finalZ);

    // Рисуем планеты за звездой
    planetsData.forEach(data => {
        if (data.finalZ < 0) {
            drawPlanet(data, scale);
        }
    });

    // Рисуем звезду (z = 0)
    const starGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scaledGlowSize);
    starGradient.addColorStop(0, `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, 1)`);
    starGradient.addColorStop(0.4, `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, 0.8)`);
    starGradient.addColorStop(1, `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, 0)`);

    ctx.fillStyle = starGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scaledGlowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${star.color[0]}, ${star.color[1]}, ${star.color[2]})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scaledStarSize, 0, Math.PI * 2);
    ctx.fill();

    // Рисуем планеты перед звездой
    planetsData.forEach(data => {
        if (data.finalZ >= 0) {
            drawPlanet(data, scale);
        }
    });
}

// Вспомогательная функция для рисования планеты
function drawPlanet(data, scale) {
    const planet = data.planet;
    const rotated = data.rotated;
    const planetX = data.planetX;
    const planetY = data.planetY;
    const scaledSize = data.scaledSize;

    // Вычисляем видимость на основе Z-координаты (ближние планеты ярче)
    const depthFactor = 1 - (rotated.z / (data.scaledDistance * 2));
    const visibility = Math.max(0.3, Math.min(1, depthFactor));

    // Планета
    ctx.globalAlpha = visibility;
    ctx.fillStyle = `rgb(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]})`;
    ctx.beginPath();
    ctx.arc(planetX, planetY, scaledSize, 0, Math.PI * 2);
    ctx.fill();

    // Свечение планеты
    const planetGlow = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, scaledSize * 2);
    planetGlow.addColorStop(0, `rgba(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]}, ${0.4 * visibility})`);
    planetGlow.addColorStop(1, `rgba(${planet.color[0]}, ${planet.color[1]}, ${planet.color[2]}, 0)`);
    ctx.fillStyle = planetGlow;
    ctx.beginPath();
    ctx.arc(planetX, planetY, scaledSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // Подпись к планете
    if (planet.label) {
        ctx.font = `${Math.max(12, 16 * scale)}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * visibility})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planet.label, planetX, planetY - scaledSize - 30 * scale);
    }

    ctx.globalAlpha = 1;
}

// Создаем экземпляр менеджера режимов
const modeManager = new ModeManager();

function animate() {
    const scrollY = window.scrollY;
    const currentTime = performance.now();

    // Темный фон
    const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    bgGradient.addColorStop(0, '#0a0520');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Проверяем, есть ли активные режимы
    if (!modeManager.hasActiveMode()) {
        // Обычный режим - рисуем звезды и галактики
        drawStars(scrollY);

        galaxies.forEach(galaxy => {
            galaxy.internalRotation += galaxy.speed;
            drawGalaxy(galaxy, scrollY);
        });
    } else {
        // Обновляем и рисуем активные режимы
        modeManager.update(currentTime, scrollY, ctx, canvas);
        modeManager.render(scrollY, ctx, canvas);
    }

    requestAnimationFrame(animate);
}

// Автоматический скролл вниз при загрузке страницы
window.addEventListener('load', () => {
    // Запускаем анимацию
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 100);
    setTimeout(() => {
        animate();
    }, 300);
});