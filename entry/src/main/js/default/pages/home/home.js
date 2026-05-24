import router from '../../common/router.js'
import app from '@system.app';
import storage from '@system.storage';

function getIconPath(name) {
    return '/common/' + name;
}

let clickObj = {
    search() {
        router.push({
            uri: 'pages/search_keyboard/english/english',
        })
    },
    about() {
        router.push({
            uri: 'pages/about/about',
        })
    },
    wordbook() {
        router.push({
            uri: 'pages/wordbook/wordbook',
        })
    },
    history() {
        router.push({
            uri: 'pages/history/history',
        })
    },
    settings() {
        router.push({
            uri: 'pages/settings/settings',
        })
    }
}

export default {
    data: {
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
        list: [{
            name: "搜索单词", icon: getIconPath("search.png"), click: clickObj.search
        }, {
            name: "单词笔记", icon: getIconPath("wordbook.png"), click: clickObj.wordbook
        }, {
            name: "搜索历史", icon: getIconPath("history.png"), click: clickObj.history
        }, {
            name: "词典设置", icon: getIconPath("settings.png"), click: clickObj.settings
        }, {
            name: "关于词典", icon: getIconPath("about.png"), click: clickObj.about
        }]
    },
    getBackgroundSettings() {
        storage.get({
            key: 'RounderBackground',
            default: '0',
            success: (data) => {
                if (data == '1') {
                    this.RounderBackgroundValue.background = "rgb(36,36,36)";
                    this.RounderBackgroundValue.radius = 75;
                }
            }
        });
    },
    onShow() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    onHide() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            app.terminate();
        }
    }
}
