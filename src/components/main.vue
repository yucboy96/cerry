<template>
    <div id="file_container">
        <div class="button-container">
            <!--<el-upload-->
                        <!--ref="upload" action="http://13.com" :multiple="false"-->
                       <!--:on-change="fileChange"-->
                       <!--:file-list="fileList" :auto-upload="false" list-type="text" :before-upload="beforeUpload"-->
                       <!--:limit="1">-->
                <!--<el-button icon="el-icon-folder-opened" slot="trigger" size="small"-->
                           <!--plain round-->
                           <!--style="width:100px;padding-left:0px;margin-right:0px;font-size: 14px;">File-->
                <!--</el-button>-->
            <!--</el-upload>-->
            <el-button icon="el-icon-upload" size="small"
                       plain round
                       v-if="false"
                       style="width:100px;margin-right: 0px; font-size: 14px;"
                       @click="submitUpload">Upload
            </el-button>
            <el-button icon="el-icon-magic-stick" size="small" :type="interpreted?'primary':''"
                       :plain="!interpreted" round
                       style="width:100px;margin-right: 0px; font-size: 14px;"
                       @click="setInterpreted">Interpret
            </el-button>
            <el-button icon="el-icon-refresh-left" size="small"
                       plain round
                       style="width:100px;margin-right: 10px;padding-left: 0px; font-size: 14px;"
                       @click="reset">Reset
            </el-button>

        </div>
        <div>
            <strong style="margin: 5px;font-family: Avenir;color:rgb(84,84,84);font-size: 18px;">Code</strong>
            <span style="margin-left: 280px;">{{anchorText}}</span>
            <el-input class="input-container"
                      ref="input1"
                      :autosize="autoSize"
                      type="textarea"
                      readonly
                      placeholder="请输入内容"
                      v-model="input" v-show="!interpreted">

            </el-input>
            <div id="code_container" v-show="interpreted">
                <div style="margin: 10px;">
                <CodeBlob :code="code" :blankArray="blankArray"></CodeBlob>
                </div>
                <div id="tz" @mousedown="dragEagle">
                </div>
            </div>
            <div class="next-previous">
                <el-button icon="el-icon-arrow-left" size="small" @click="previous()"
                           plain round
                           style="width:90px;font-size: 14px;">Prior
                    <!--v-if="jsonMode.mode===true"> add-->
                </el-button>
                <el-button size="small" @click="next()"
                           style="width:90px;font-size: 14px;margin-left: 30px;"
                           plain round
                >Next
                    <i class="el-icon-arrow-right el-icon--right"/>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import CodeBlob from "./code_blob"
    import Axios from 'axios'
    import {Loading} from 'element-ui';
    import {ncodeKeyIndexHandler,genBlankArray,getCodeChip} from "../tools";
    import Formatter from "auto-format"

    function findLine(res) {
        let explain = res.explanations;
        explain.sort(function (a, b) {
            return -(a.commentKeyword.length - b.commentKeyword.length)
        });
        let commentKeywords = res.commentKeywords;
        commentKeywords.sort(function (a, b) {
            return -(a.length - b.length)
        });
        let comment = res.comment;
        let commentTemp = '';
        let codeKeyIndex = res.codeKeyIndex;
        if (res.ncodeKeyIndex)
            codeKeyIndex = ncodeKeyIndexHandler(res.ncodeKeyIndex)
        for (var ci = 0; ci < comment.length; ci++)
            commentTemp += comment[ci];
        var indexList = [];
        for (var i = 0; i < explain.length; i++) {
            let supports = explain[i].supports;
            if (supports) {
                let maxP = 0.0, codeWordsIndexs = [];
                for (var j = 0; j < supports.length; j++) {
                    if (supports[j][1] > maxP) {
                        maxP = supports[j][1];
                        codeWordsIndexs = supports[j][0];
                    }
                }
                let temp = [];
                for (var k = 0; k < codeWordsIndexs.length; k++) {
                    temp.push(codeKeyIndex[codeWordsIndexs[k]])
                }
                if (temp.length > 0) {
                    let start = commentTemp.toLowerCase().indexOf(commentKeywords[i].toLowerCase());
                    let end = start + commentKeywords[i].length;
                    if (start > 0 && commentTemp[start - 1] === '<')
                        start--;
                    if (end < commentTemp.length && commentTemp[end + 1] === '>')
                        end++;
                    indexList.push([start, end - start, temp]);
                    let newCommentTemp = '';
                    for (let p = 0; p < commentTemp.length; p++) {
                        if (p >= start && p < end)
                            newCommentTemp += ' ';
                        else
                            newCommentTemp += commentTemp[p]
                    }
                    commentTemp = newCommentTemp;
                }
            }
        }
        indexList.sort(function (a, b) {
            return a[0] - b[0];
        });
        window.console.log("indexList:", indexList);
        let wordList = [], s = 0, e = 0, p = 0, count = 0;
        while (p < indexList.length) {
            while (p < indexList.length && s == indexList[p][0]) {
                wordList.push([comment.substring(s, s + indexList[p][1]), {
                    'index': count,
                    'relation': indexList[p][2]
                }]);
                s = s + indexList[p][1];
                p++;
                count++;
            }
            {
                e = s;
                while (e < comment.length && comment[e] != ' ') {
                    e++;
                }
                e++;
                wordList.push([comment.substring(s, e), null]);
                s = e;
            }
        }
        if (s < comment.length - 1)
            wordList.push([comment.substring(s), null]);
        window.console.log("wordList:", wordList);
        return wordList;
    }

    function spaceFilter(line) {
        let temp = [];
        for (var i = 0; i < line.length; i++) {
            if (line[i] !== '') {
                temp.push(line[i])
            }
        }
        return temp;
    }

    function splitcode(code) {
        let newCode = [];
        for (var i = 0; i < code.length; i++) {
            newCode.push(spaceFilter(code[i].split(' ')))
        }
        return newCode;
    }

    function nsplitcode(code) {
        let newCode = [];
        for (var i = 0; i < code.length; i++)
            newCode.push(code[i].split(''))
        return newCode;
    }

    function ongetRes(that, res) {
        window.console.log("res=>",res);
        var javaFormatter = Formatter.createJavaFormatter("    ");
        that.$store.commit('setIndexNow', that.jsonMode.i);
        if (res.ncodeKeyIndex) {
            that.$store.commit('setCode', nsplitcode(res.ncode));
            that.$store.commit('setShowBlank', "");
            var newncode = javaFormatter.format(res.ncode.join('\n'));
            that.blankArray = genBlankArray(newncode,res.ncode);
            that.input = newncode.join('\n');
        }
        else {
            that.$store.commit('setCode', splitcode(res.code));
            that.$store.commit('setShowBlank', "    ");
            that.input = javaFormatter.format(res.code.join('\n')).join('\n');
        }
        that.$store.commit('setComment', [res.comment]);
        that.jsonMode.res[that.jsonMode.i].comment = res.comment;
        var interpretedComment  = findLine(res);
        that.jsonMode.res[that.jsonMode.i].interpretedComment = interpretedComment
        that.$store.commit('setInterpretedComment', interpretedComment)
    }

    export default {
        name: "Main",
        components: {
            CodeBlob
        },
        data() {
            return {
                fileList: [],
                blankArray:[],
                jsonMode: {
                    res: [],
                    mode: false,
                    i: 0,
                    map: []
                },
                autoSize: {
                    'minRows': 15,
                    'maxRows': 15
                },
                input:''
            }
        },
        computed: {
            ...mapState({
                code: state => state.code,
                interpreted: state => state.interpreted,
            }),
            anchorText: function () {
                if (this.jsonMode.res.length === 0)
                    return "0/0";
                else
                    return String(this.jsonMode.i + 1) + '/' + String(this.jsonMode.res.length)
                // return String(this.codeChip.i+1)+'/10';

            }
        },
        watch: {
            autoSize: function (val) {
                this.$refs.input1.resizeTextarea(val);
            }
        },
        mounted: function () {
            this.init()
        },
        methods: {
            init(){
                this.jsonMode.res= getCodeChip()
                this.jsonMode.i = 0;
                this.formatInput()
                for (var i = 0; i < this.jsonMode.res.length; i++)
                    this.jsonMode.map.push(false);
                this.$store.commit("iniCommentIndexMap", this.jsonMode.map);
            },
            clear() {
                this.$store.commit('setInterpreted', false);
                this.$store.commit('setComment', []);
                // this.$store.commit('setCode', []);
                this.$store.commit('setInterpretedComment', []);
                this.jsonMode.i = 0;
                this.jsonMode.mode = false;
                this.jsonMode.res = [];
                this.jsonMode.map =[];
                this.blankArray = [];
                this.init()
            },
            formatInput(){
                this.$store.commit('setInterpreted', false);
                var javaFormatter = Formatter.createJavaFormatter("    ");
                var newncode = javaFormatter.format(this.jsonMode.res[this.jsonMode.i].ncode.join('\n'));
                this.blankArray = genBlankArray(newncode,this.jsonMode.res[this.jsonMode.i].ncode);
                this.input = newncode.join('\n');
                this.$store.commit('setCode', nsplitcode(this.jsonMode.res[this.jsonMode.i].ncode));
                this.$store.commit('setIndexNow', this.jsonMode.i);
                if (this.jsonMode.res[this.jsonMode.i].interpretedComment){
                    this.$store.commit('setComment', this.jsonMode.res[this.jsonMode.i].comment);
                    this.$store.commit('setInterpretedComment', this.jsonMode.res[this.jsonMode.i].interpretedComment)
                }
                else {
                    this.$store.commit('setComment', []);
                    this.$store.commit('setInterpretedComment', [])
                }
            },
            next() {
                if (this.jsonMode.i < this.jsonMode.res.length - 1) {
                    this.jsonMode.i += 1;
                    this.formatInput()
                }
            },
            previous() {
                if (this.jsonMode.i >= 1) {
                    this.jsonMode.i -= 1;
                    this.formatInput()
                }
            },
            fileChange(file) {
                this.reset();
                this.$refs.upload.clearFiles();
                var that = this;
                var type = file.name.split('.');
                if (file.raw) {
                    let reader = new FileReader();//读取文件内容
                    reader.readAsText(file.raw, 'utf8'); //防止中文乱码问题，不加reader.onload方法都不会触发
                    reader.onload = function (e) {
                        if (type[type.length - 1] == 'json') {
                            that.jsonMode.res = JSON.parse(e.target.result);
                            that.findLengthRelation()
                            that.jsonMode.mode = true;
                            for (var i = 0; i < that.jsonMode.res.length; i++)
                                that.jsonMode.map.push(false);
                            that.$store.commit("iniCommentIndexMap", that.jsonMode.map);
                            ongetRes(that, that.jsonMode.res[that.jsonMode.i]);
                            that.$emit('onFileChange');
                        }
                        else
                            that.input = e.target.result;
                    }
                }
            },
            beforeUpload() {

            },
            submitUpload() {
                // let data = {"code": this.input, "mode": "nsbt"};
                let data = {"code": this.jsonMode.res[this.jsonMode.i].ncode.join('\n'), "mode": "nsbt"};
                let loadingInstance = Loading.service({fullscreen: true});
                Axios.post("http://10.144.5.120:8888/api/interpret", data)
                    .then(res => {
                        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                            loadingInstance.close();
                        });
                        res.ncode = data.code.split('\n');
                        ongetRes(this, res.data);
                        this.$store.commit('setInterpreted', !this.$store.state.interpreted)
                    });

            },
            findLengthRelation(){
                var res = this.jsonMode.res;
                var resLength=[];
                var i=0;
                var j=0,sum=0;
                for(i=0;i<res.length;i++){
                    sum = 0;
                    for (j=0;j<res[i].code.length;j++)
                        sum+=res[i].code[j].length;
                    resLength.push([res[i].code.length,sum])
                }
                for(i=0;i<res.length;i++)
                    resLength.push(res[i].code.length)
                window.console.log(resLength.slice(0,10));
                window.console.log(resLength.slice(10,20));
                this.min=10000;
            },
            compute(part1,part2){
                var sum =0;
                for(var i=0;i<part1.length;i++)
                    sum +=Math.abs(part1[i]-part2[i])
                return sum
            },
            exchange(part2,i,j){
              var temp = part2[j];
              part2[j] = part2[i];
              part2[i] = temp;
              return part2;
            },
            part2print(){
                for (var i=0;i<this.part2.length;i++){
                    window.console.log(this.part2[i])
                }
            },
            findmin(part1,part2,i){//i is the bit to change
                if (i===part2.length-1) {
                    if (this.compute(part1, part2) < this.min) {
                        this.min = this.compute(part1, part2)
                        this.part2 = part2
                        this.part1 = part1
                        window.console.log(this.min)
                        this.part2print()
                    }
                    return;
                }
                for( var j=i;j<part2.length;j++)
                {
                    this.findmin(part1,this.exchange(part2,i,j),i+1)
                }

            },
            setInterpreted() {
                if (this.jsonMode.mode===false&& this.interpreted===false)
                    this.submitUpload()
                else
                    this.$store.commit('setInterpreted', !this.$store.state.interpreted)
            },
            reset() {
                this.clear();
                this.$emit('clear');
            },
            dragEagle: function (e) {
                var targetDiv = document.getElementById('code_container'); //e.target.parentNode.parentNode;.children[0]
                //得到点击时该地图容器的宽高：
                var targetDivHeight = targetDiv.offsetHeight;
                var startY = e.clientY;
                document.onmousemove = function (e) {
                    e.preventDefault();
                    //得到鼠标拖动的宽高距离：取绝对值
                    var distY = Math.abs(e.clientY - startY);
                    var height = 0;
                    //往上方拖动：
                    if (e.clientY < startY) {
                        height = (targetDivHeight - distY);
                    }
                    //往下方拖动：
                    if (e.clientY > startY) {
                        height = (targetDivHeight + distY);
                    }
                    if (height < 325)
                        height = 325;
                    targetDiv.style.height=height+'px';
                };
                document.onmouseup = function () {
                    document.onmousemove = null;
                }
            }
        }
    }
</script>

<style scoped>
    .button-container {
        padding-top: 0px;
        height: 360px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
    }

    .input-container {
        width: 700px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
    }

    #file_container {
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-start;
    }

    #code_container {
        position: relative;
        width: 700px;
        height: 325px;
        overflow: auto;
        border: 1px solid rgba(0, 0, 0, .15);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        background: white;
    }

    .next-previous {
        width: 700px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    #tz {
        position: absolute;
        right: 0px;
        bottom: 0px;
        cursor: se-resize;
        z-index: 200001;
        width:0;
        height:0;
        border-bottom:8px solid gray;
        border-left:8px solid transparent;
    }

</style>