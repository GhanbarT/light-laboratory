/**
 * Circle blocker / filter.
 * Tools -> Blocker -> Circle Blocker
 * @property {Point} p1 - The center of the circle.
 * @property {Point} p2 - A point on the circle.
 * @property {boolean} isDichroic - Whether it is a filter.
 * @property {boolean} isDichroicFilter - If true, the ray with wavelength outside the bandwidth is blocked. If false, the ray with wavelength inside the bandwidth is blocked.
 * @property {number} wavelength - The target wavelength if filter is enabled. The unit is nm.
 * @property {number} bandwidth - The bandwidth if filter is enabled. The unit is nm.
 */
objTypes['blackcircle'] = class extends CircleObjMixin(BaseFilter) {
    static type = 'blackcircle';
    static isOptical = true;
    static serializableDefaults = {
        p1: null,
        p2: null,
        isDichroic: false,
        isDichroicFilter: false,
        wavelength: GREEN_WAVELENGTH,
        bandwidth: 10
    };

    timeoutIDs = [];

    draw(canvasRenderer, isAboveLight, isHovered) {
        const ctx = canvasRenderer.ctx;
        ctx.beginPath();
        ctx.arc(this.p1.x, this.p1.y, geometry.segmentLength(this), 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isHovered ? 'cyan' : ((scene.colorMode && this.wavelength && this.isDichroic) ? wavelengthToColor(this.wavelength || GREEN_WAVELENGTH, 1) : 'rgb(108,210,25)');
        //ctx.fillStyle="indigo";

        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fillRect(this.p1.x - 1.5, this.p1.y - 1.5, 3, 3);

        ctx.lineWidth = 1;
        if (isHovered) {
            ctx.fillStyle = 'magenta';
            ctx.fillRect(this.p2.x - 1.5, this.p2.y - 1.5, 3, 3);
        }
    }

    checkRayIntersects(ray) {
        localStorage.setItem('win-counter', `0`)
        if (this.checkRayIntersectFilter(ray)) {
            return this.checkRayIntersectsShape(ray);
        } else {
            return null;
        }
    }

    onRayIncident(ray, rayIndex, incidentPoint) {
        const win = localStorage.getItem('win')
        if (win === 'true') return {
            isAbsorbed: true
        };
        else if (ray.brightness_p >= 0.3) {
            for (let i = 0; i < this.timeoutIDs.length; i++) {
                clearTimeout(this.timeoutIDs[i]);
            }
            this.timeoutIDs = [];
            // add timer to after 1.5s do below code
            let timeoutID = setTimeout(() => {
                const winCounter = +localStorage.getItem('win-counter') | 0
                if (!winCounter) return
                const toastLiveExample = document.getElementById('liveToast')
                /*toastLiveExample.getElementsByClassName('btn-close')[0].addEventListener('click', function () {
                    localStorage.setItem('win', '0')
                })*/
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
                toastBootstrap.show()
                localStorage.setItem('win', `true`)
                //  read the url of page and extract the level number and save it in localstorage named "max-level" if the currenct level is greater than the max-level
                const url = window.location.href
                const level = url.split('/').pop()
                const levelNumber = level.match(/\d+/)[0]
                const maxLevel = localStorage.getItem('max-level')
                if (!maxLevel || +maxLevel < +levelNumber) {
                    localStorage.setItem('max-level', String(+levelNumber + 1))
                }

            }, 1500)
            this.timeoutIDs.push(timeoutID);
            localStorage.setItem('win-counter', `1`)
        }

        return {
            isAbsorbed: true
        };
    }
};
