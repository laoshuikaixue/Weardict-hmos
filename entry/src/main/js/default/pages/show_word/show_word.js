import router from '../../common/router.js'
import file from '@system.file';
import storage from '@system.storage';
import textlayout from '../../common/textlayout.js';
import common from '../../common/common.js';

let wordBookUri = 'internal://app/wordbook'
let wordBook = [];
let wordBookIndex = 0
let dictChineseIndex = 0

let toastTimeout = null;

export default {
    data: {
        isShow: {
            Loading: true,
            Main: false,
            Empty: false,
            Multi: false
        },
        dict: {
            words: "加载中...",
            part: "",
            phonetic: "",
            frequency: "",
            mean: "加载中...",
            ex: "加载中...",
            tran: "加载中...",
            extra: ""
        },
        inner: {
            longTextHeight: 400,
            overFlowHeight: 200,
            chineseCount: 50,
            chineseTotalCount: 0,
            isMulti: false,
            isSaved: false,
            multiContent: [],
            sections: [],
            index: 0,
            isLoading: false
        },
        toast: {
            show: false,
            width: 0,
            left: 0,
            text: ""
        },
        result: null,
        searchType: "",
        chineseWord: "",
        moveY: -1,
        RounderBackground: true,
        RounderBackgroundValue: {
            background: "transparent",
            radius: 0
        },
        colorList: [{name:"纸色",value:"#ffe2cbad",checked:true,textColor:"#000000"},{name:"黑色",value:"#000000",checked:false,textColor:"#F1F3F5"},{name:"白色",value:"#F1F3F5",checked:false,textColor:"#000000"}],
        themeIndex: 0
    },
    onInit() {
        this.getBackgroundSettings();
        this.getThemeType();
        common.getParams(this, () => {
            if (this.result == null) return;
            if (this.result.preview != undefined) {
                this.getMultiData();
                this.getWordBookData(false);
                this.inner.isMulti = true;
                this.cleanKeyboard();
            } else if (this.result.preview == undefined) {
                this.cleanKeyboard();
            }
        });
    },
    onShow() {
        if (this.result == null) {
            this.showEmptyUI();
        } else if (this.result.preview != undefined) {
            this.showMultiUI();
        } else if (this.result.preview == undefined) {
            this.getDictData();
            this.getWordBookData();
            this.showMainUI();
        }
    },
    getThemeType() {
        storage.get({
            key: "themeIndex",
            default: "0",
            success: (data) => {
                this.themeIndex = Number(data);
            }
        });
    },
    cleanKeyboard() {
        storage.get({
            key: "CleanKeyboardAfterSearch",
            default: '0',
            success: (data) => {
                if (data == "1") storage.delete({
                    key: this.inner.isMulti ? 'chinese' : 'english',
                    value: ""
                });
            }
        });
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
    onHide() {
        this.rotation("main", false, false);
        this.rotation("multi", false, false);
    },
    onDestroy() {
        clearTimeout(toastTimeout);
        this.toast.show = false;
        wordBook = null;
    },
    getDictData() {
        if (this.searchType == "a") {
            this.dict.words = this.result.words
            this.dict.part = this.result.part
            this.dict.phonetic = this.result.phonetic || ""
            this.dict.frequency = this.result.frequency || ""
            this.dict.mean = this.result.mean
            this.dict.ex = this.result.ex
            this.dict.tran = this.result.tran
            this.dict.extra = this.result.extra || ""
            this.inner.sections = this.buildDictASections();
            this.inner.longTextHeight = 0;
        } else if (this.searchType == "b") {
            this.dict.words = this.result.words
            this.dict.mean = this.result.mean
            this.inner.sections = [];
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.mean, 350, "topBox", "bottomBox");
            }, 50)
        }
        this.inner.overFlowHeight = this.searchType === "b" ? 200 : 220
    },
    getMultiData() {
        this.inner.chineseTotalCount = this.result.data.length;
        storage.get({
            key: 'chineseCount',
            default: '50',
            success: (data) => {
                this.inner.chineseCount = Number(data);
            }
        });
        this.inner.multiContent = [];
        this.inner.index = 0;
        this.loadMultiBatch(0);
    },
    loadMultiBatch(startIndex) {
        let maxCount = this.inner.chineseCount;
        let allWords = this.result.data;
        let totalLen = allWords.length;
        if (startIndex >= totalLen || startIndex >= maxCount) return;
        let batchEnd = startIndex + 5;
        if (batchEnd > totalLen) batchEnd = totalLen;
        if (batchEnd > maxCount) batchEnd = maxCount;
        let batchCount = batchEnd - startIndex;
        let loaded = 0;
        let batchItems = [];
        let processItem = () => {
            if (loaded >= batchCount) return;
            let i = startIndex + loaded;
            let wordKey = allWords[i];
            file.readText({
                uri: 'internal://app/history/' + this.searchType + '/' + this.chineseWord + '/' + wordKey,
                success: (fileData) => {
                    let obj = JSON.parse(fileData.text);
                    fileData.text = null;
                    let showMean = obj.mean || "";
                    if (showMean.length > 36) {
                        showMean = showMean.substring(0, 36) + "...";
                    }
                    batchItems.push({ words: obj.words, showMean: showMean });
                    obj = null;
                    loaded++;
                    processItem();
                },
                fail: () => {
                    loaded++;
                    processItem();
                }
            });
        };
        let checkDone = () => {
            if (loaded >= batchCount) {
                this.inner.multiContent.push.apply(this.inner.multiContent, batchItems);
                batchItems = null;
                let nextStart = startIndex + batchCount;
                if (nextStart < totalLen && nextStart < maxCount) {
                    setTimeout(() => {
                        this.loadMultiBatch(nextStart);
                    }, 10);
                }
            } else {
                setTimeout(checkDone, 30);
            }
        };
        processItem();
        checkDone();
    },
    loadFullWordData(word, callback) {
        file.readText({
            uri: 'internal://app/history/' + this.searchType + '/' + this.chineseWord + '/' + word,
            success: (data) => {
                let obj = JSON.parse(data.text);
                data.text = null;
                callback(obj);
            },
            fail: () => {
                callback(null);
            }
        });
    },
    getWordBookData(isCheck = true) {
        file.readText({
            uri: wordBookUri + "/list.json",
            length: 4096,
            success: (data) => {
                wordBook = JSON.parse(data.text);
                if (isCheck) this.checkWordBook();
            }
        });
    },
    checkWordBook() {
        for (let i = 0, obj = wordBook, len = obj.length;i < len; i++) {
            if (obj[i][0] == this.dict.words && obj[i][1] == this.searchType) {
                this.inner.isSaved = true
                wordBookIndex = i
                break;
            }
        }
    },
    deleteWordBookWord(index) {
        file.delete({
            uri: wordBookUri + "/" + wordBook[index][1] + "/" + wordBook[index][0]
        });
    },
    writeWordBookWord(obj) {
        file.writeText({
            uri: wordBookUri + "/" + this.searchType + "/" + obj.words,
            text: JSON.stringify(obj)
        });
    },
    saveToWordBook() {
        if (this.inner.isSaved) {
            this.deleteWordBookWord(wordBookIndex);
            wordBook.splice(wordBookIndex, 1);
            this.showToast("单词删除成功", "auto", 1500);
        } else if (!this.inner.isSaved) {
            let result = this.result;
            if (this.inner.isMulti) {
                result = {
                    words: this.dict.words,
                    part: this.dict.part,
                    mean: this.dict.mean,
                    type: this.searchType
                };
                if (this.searchType === "a") {
                    result.phonetic = this.dict.phonetic || "";
                    result.frequency = this.dict.frequency || "";
                    result.ex = this.dict.ex || "";
                    result.tran = this.dict.tran || "";
                    result.extra = this.dict.extra || "";
                }
            }
            this.writeWordBookWord(result);
            wordBook.unshift([result.words, this.searchType]);
            wordBookIndex = 0;
            this.showToast("单词保存成功", "auto", 1500);
        }
        file.writeText({
            uri: wordBookUri + "/list.json",
            text: JSON.stringify(wordBook)
        });
        this.inner.isSaved = !this.inner.isSaved
    },
    multiReplace(index) {
        dictChineseIndex = index
        this.rotation("main", false);
        let word = this.inner.multiContent[index].words;
        this.loadFullWordData(word, (obj) => {
            if (obj) {
                this.writeMultiDataFromObj(obj);
                obj = null;
            }
            this.showMainUI();
            this.checkWordBook();
        });
    },
    writeMultiDataFromObj(obj) {
        if (this.searchType == "a") {
            this.dict.words = obj.words
            this.dict.part = obj.part
            this.dict.phonetic = obj.phonetic || ""
            this.dict.frequency = obj.frequency || ""
            this.dict.mean = obj.mean
            this.dict.ex = obj.ex
            this.dict.tran = obj.tran
            this.dict.extra = obj.extra || ""
            this.inner.sections = this.buildDictASections();
            this.inner.longTextHeight = 0;
        } else if (this.searchType == "b") {
            this.dict.words = obj.words
            this.dict.mean = obj.mean
            this.inner.sections = [];
            setTimeout(() => {
                this.inner.longTextHeight = this.getTextHeight(this.dict.mean, 350, "topBox", "bottomBox");
            }, 50)
        }
        this.inner.overFlowHeight = this.searchType === "b" ? 200 : 330
    },
    searchAgain() {
        this.rotation("main", false, false);
        common.writeMultiParams({
            searchWord: this.dict.words,
            searchType: this.searchType === "a" ? "b" : "a",
            wantType: 'english',
            moveY: this.moveY,
            isSearchAgain: true
        }, () => {
            router.replace({
                uri: "pages/search_word/search_word"
            });
        });
    },
    chineseSearchAgain() {
        this.rotation("multi", false, false);
        common.writeMultiParams({
            searchWord: this.chineseWord,
            searchType: this.searchType === "a" ? "b" : "a",
            wantType: 'chinese',
            moveY: this.moveY,
            isSearchAgain: true
        }, () => {
            router.replace({
                uri: "pages/search_word/search_word"
            });
        });
    },
    showMainUI() {
        this.isShow.Multi = false;
        this.isShow.Main = true;
        this.isShow.Loading = false;
        this.rotation("main", true);
    },
    showEmptyUI() {
        this.isShow.Loading = false
        this.isShow.Empty = true
    },
    showMultiUI() {
        this.rotation("main", false);
        this.isShow.Main = false;
        this.isShow.Multi = true;
        this.rotation("multi", true);
    },
    replaceMulti() {
        this.inner.isSaved = false;
        this.$refs.main.scrollTo({
            index: 0
        });
        this.showMultiUI();
    },
    mainSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            if (this.inner.isMulti) {
                this.replaceMulti();
            } else {
                this.rotation("main", false, false);
                common.clean();
                router.back({
                    params: {
                        moveY: this.moveY
                    }
                });
            }
        }
    },
    emptySwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            common.clean();
            router.back({
                params: {
                    moveY: this.moveY
                }
            });
        }
    },
    multiSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.rotation("multi", false, false);
            common.clean();
            router.back({
                params: {
                    moveY: this.moveY
                }
            });
        }
    },
    getTextHeight(text, width, topRef, bottomRef) {
        if (!this.$refs[topRef].getPosition) {
            return textlayout.getTextHeight(text, width);
        }
        let topPosition = this.$refs[topRef].getPosition();
        let bottomPosition = this.$refs[bottomRef].getPosition();
        let textHeight = bottomPosition.y - topPosition.y;
        return textHeight;
    },
    buildDictASections() {
        let sections = [];
        this.addDictSection(sections, "音标", this.dict.phonetic);
        this.addDictSection(sections, "词频", this.dict.frequency);
        this.addDictSection(sections, "释义", this.dict.mean);
        this.addDictSection(sections, "例句", this.dict.ex);
        this.addDictSection(sections, "翻译", this.dict.tran);
        this.addDictSection(sections, "补充", this.dict.extra);
        return sections;
    },
    addDictSection(sections, title, text) {
        if (text == undefined || text === "") return;
        let chunks = this.splitText(text, 280);
        for (let i = 0, len = chunks.length; i < len; i++) {
            sections.push({
                title: i === 0 ? title : title + "（续）",
                text: chunks[i],
                height: this.getSectionHeight(chunks[i])
            });
        }
    },
    splitText(text, maxLength) {
        let chunks = [];
        let buffer = "";
        let lines = String(text).split("\n");
        for (let i = 0, len = lines.length; i < len; i++) {
            let line = lines[i];
            if (line.length > maxLength) {
                if (buffer !== "") {
                    chunks.push(buffer);
                    buffer = "";
                }
                for (let start = 0; start < line.length; start += maxLength) {
                    chunks.push(line.substring(start, start + maxLength));
                }
                continue;
            }
            let next = buffer === "" ? line : buffer + "\n" + line;
            if (next.length > maxLength) {
                chunks.push(buffer);
                buffer = line;
            } else {
                buffer = next;
            }
        }
        if (buffer !== "") chunks.push(buffer);
        return chunks;
    },
    getSectionHeight(text) {
        let rowCount = this.getTextRows(text, 350);
        return 40 + rowCount * 34;
    },
    getTextRows(text, width) {
        let str = String(text);
        let rowCount = 1;
        let rowPx = 0;
        for (let i = 0, len = str.length; i < len;) {
            let charCode = str.charCodeAt(i);
            if (charCode == 10 || charCode == 13) {
                rowPx = 0;
                rowCount++;
                i++;
                continue;
            }
            let charPx = textlayout.getCharPx(charCode);
            if (rowPx + charPx <= width) {
                rowPx += charPx;
            } else {
                rowPx = charPx;
                rowCount++;
            }
            if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                i += 2;
            } else {
                i++;
            }
        }
        return rowCount;
    },
    rotation(ref, bol_type=true, isTimer=true) {
        let rotation_func = () => {
            if (this.$refs[ref].rotation) {
                this.$refs[ref].rotation({
                    focus: bol_type
                })
            }
        }
        if (isTimer) setTimeout(rotation_func, 50);
        else rotation_func();
    },
    showToast(text, width, time) {
        clearTimeout(toastTimeout);
        this.toast.text = text;
        this.toast.width = width === "auto" ? this.getTextWidth(text) + 70 : width;
        this.toast.left = (466 - this.toast.width) / 2;
        this.toast.show = true;
        toastTimeout = setTimeout(() => {
            this.toast.show = false;
            clearTimeout(toastTimeout);
        }, time);
    },
    getTextWidth(str) {
        let strWidth = 0
        for (let i = 0, len = str.length;i < len; i++) {
            strWidth += textlayout.getCharPx(str.charCodeAt(i));
        }
        return strWidth;
    }
}
