<template>
  <div id="manage">
    <el-container style="height: 500px; border: 1px solid #eee;">
      <el-aside width="17%" style="background-color: rgb(238, 241, 246);">
        <el-input
          placeholder="Filter"
          v-model="filterText" style="height: 100px">
        </el-input>
      </el-aside>

      <el-container>
        <el-header >
          <el-button icon="el-icon-upload2" @click.native="showUpload = true" size="small" style="float: left; margin-top: 14px;">Upload</el-button>
          <span style="float: right;font-size: 25px">username</span>
        </el-header>

        <el-main>

        </el-main>
      </el-container>
    </el-container>
    <el-dialog
      title="提示"
      :visible="showUpload"
      width="30%"
      :before-close="handleClose">
      <el-upload
        v-if="showUpload"
        ref="upload"
        class="upload-demo"
        drag
        action="http://localhost:8081/amazonS3/upload"
        :data="userInfo"
        :auto-upload="false"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :before-upload="beforeUpload"
        :on-success="uploadSuccess"
        :on-error="uploadFail"
        multiple
        :limit="3"
        :on-exceed="handleExceed">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drag the file to here, or <em>click to upload</em></div>
        <div slot="tip" class="el-upload__tip">maximum: 1Mb</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
    <el-button @click="showUpload = false">取 消</el-button>
    <el-button type="primary" @click="uploadFiles">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
    export default {
        name: "Manage",
        computed: {
            filelist:{
                get(){
                    this.$http({
                        method: 'get',
                        url: 'http://localhost:8080/amazonS3/list',
                    }).then(value => {
                        if (value.data){
                            for (var i = 0; i < value.data.length; i++){

                            }
                            return value.data;
                        }
                    })
                }
            }
        },
        methods: {
            addFile(){
                this.$refs.upload.clearFiles();
                this.showUpload = true;
            },
            uploadFiles(){
              this.$refs.upload.submit();
            },
            uploadSuccess(){
                alert("Upload Success!");
                this.$refs.upload.clearFiles();
                this.showUpload = false;
            },
            uploadFail(){
                alert("Upload Fail!")
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            handleClose(done) {
                this.$confirm('Are you sure to leave?')
                    .then(_ => {
                        this.showUpload = false;
                        done();
                    })
                    .catch(_ => {});
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${ file.name }？`);
            }
        },
        data() {
            return {
                showUpload: false,
                filterText: '',
                data(){
                    return this.getter().filelist;
                },
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                userInfo: {
                    userToken: "11111",
                    userName: "wdznb"
                }
            };
        },
    }
</script>

<style scoped>
  .el-header {
    background-color: #B3C0D1;
    color: white;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
  }

</style>
