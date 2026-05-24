import router from '../../common/router.js'
import storage from '@system.storage';
import app from '@system.app';

export default {
    data: {
        versionName: '',
        isShow: false,
        showQrDialog: false,
        RounderBackground: false,
        RounderBackgroundValue: {
            background: 'transparent',
            radius: 0
        }
    },
    onInit() {
        this.versionName = app.getInfo().versionName;
        this.getBoolean('RounderBackground', '0');
    },
    getBoolean(key, defaultValue) {
        storage.get({
            key: key,
            default: defaultValue,
            success: (data) => {
                this[key] = data === '1';
                this.getRounderBackgroundValue();
            }
        });
    },
    getRounderBackgroundValue() {
        if (this.RounderBackground) {
            this.RounderBackgroundValue.background = 'rgb(36,36,36)';
            this.RounderBackgroundValue.radius = 75;
        } else {
            this.RounderBackgroundValue.background = 'transparent';
            this.RounderBackgroundValue.radius = 0;
        }
    },
    onShow() {
        setTimeout(() => {
            this.isShow = true;
            this.rotation(true);
        }, 50);
    },
    openSource() {
        this.rotation(false);
        this.showQrDialog = true;
    },
    closeQrDialog() {
        this.exitQrDialog();
    },
    exitQrDialog() {
        this.showQrDialog = false;
        this.rotation(true);
    },
    doNotPropagation(event) {
        event[event.StopPropagation ? 'StopPropagation' : 'stopPropagation']();
    },
    dialogClick(event) {
        this.exitQrDialog();
        this.doNotPropagation(event);
    },
    dialogSwipe(e) {
        if ((e.direction == 'down' || e.direction == 'left' || e.direction == 'right') &&
            (e.distance ? e.distance >= 80 : true)) {
            this.exitQrDialog();
        }
    },
    handleSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.rotation(false);
            router.back();
        }
    },
    rotation(focus) {
        setTimeout(() => {
            if (this.$refs.list && this.$refs.list.rotation) {
                this.$refs.list.rotation({
                    focus: focus
                });
            }
        }, 50);
    }
}
