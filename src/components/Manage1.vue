
<template>
  <div id="manage">
    <el-container style="height: 500px; border: 1px solid #eee;">
      <el-aside width="13%" style="background-color: ghostwhite">
        <div>
          <el-input
            placeholder="Filter"
            v-model="filterText" style="font-size: 15px;" >
          </el-input>
        </div>

      </el-aside>
    <el-container>
      <el-header v-if="this.flag === false" style="background-color: whitesmoke; height: 40px">
        <el-button v-if="this.dirList.length !== 1" @click.native="goBack" size="small" style="float: left; margin-top: 4px;">Back</el-button>
        <el-button icon="el-icon-plus" @click.native="createFolderUI = true" size="small" style="float: left; margin-top: 4px;">New Folder</el-button>
        <el-button icon="el-icon-upload2" @click.native="showUpload = true" size="small" style="float: left; margin-top: 4px;">Upload</el-button>
        <el-button icon="el-icon-user-solid" @click.native="logout" size="small" style="float: left; margin-top: 4px;">Logout</el-button>
        <span style="float: right;font-size: 25px">username</span>
      </el-header>
      <el-header v-if="this.flag === true" style="height: 40px">
        <el-button icon="el-icon-download" @click.native="handleDownload" size="small" style="float: left; margin-top: 4px;">Download</el-button>
        <el-button icon="el-icon-delete" @click.native="handleDelete" size="small" style="float: left; margin-top: 4px;">Delete</el-button>
        <el-button icon="el-icon-top-right" @click.native="handleMove" size="small" style="float: left; margin-top: 4px;">Move</el-button>
        <el-button icon="el-icon-edit" v-if="this.multiCheck===false" @click.native="renameUI = true" size="small" style="float: left; margin-top: 4px;">Rename</el-button>
      </el-header>

        <el-main>
          <div v-for="file in this.files" v-bind:key="file.fileId" v-bind:id="file.fileId" >
            <el-card style="float: left; border: 1px solid #DCDFE6; margin-right: 20px; margin-bottom: 20px" @mousedown.native="showEvents(file)">
              <el-button v-if="file.checked" icon="el-icon-success" style="font-size: 20px; float: right; padding: 0px"></el-button>
              <el-button v-if="!file.checked" icon="el-icon-circle-close" style="font-size: 20px;float: right; padding: 0px"></el-button>
              <el-button v-if="file.isFolder" @click.native="openFolder(file.fileId)" icon="el-icon-folder" style="font-size: 50px;"></el-button>
              <el-button v-if="file.isFolder===false" icon="el-icon-document" style="font-size: 50px;"></el-button>
              <div >{{file.filename}}</div>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <el-dialog
      title="Move To"
      :visible="moveUI"
      width="30%"
      :before-close="handleClose">
      <el-tree :props="treeFiles" :load="loadNode" lazy
               ref="tree"
               highlight-current
               accordion
               @node-click="nodeClick"></el-tree>
      <span slot="footer" class="dialog-foo ter">
    <el-button @click="renameUI = false">Cancel</el-button>
    <el-button type="primary" @click="moveFile">Move</el-button>
  </span>
    </el-dialog>

    <el-dialog
      title="Rename"
      :visible="renameUI"
      width="30%"
      :before-close="handleClose">
      <el-input placeholder="New Name" @keydown.enter.native="rename" v-model="renameName"></el-input>
      <span slot="footer" class="dialog-footer">
    <el-button @click="renameUI = false">Cancel</el-button>
    <el-button type="primary" @click="rename">Rename</el-button>
  </span>
    </el-dialog>

    <el-dialog
      title="Rename"
      :visible="renameUI"
      width="30%"
      :before-close="handleClose">
      <el-input placeholder="New Name" @keydown.enter.native="rename" v-model="renameName"></el-input>
      <span slot="footer" class="dialog-footer">
    <el-button @click="renameUI = false">Cancel</el-button>
    <el-button type="primary" @click="rename">Rename</el-button>
  </span>
    </el-dialog>

    <el-dialog
      title="Create Folder"
      :visible="createFolderUI"
      width="30%"
      :before-close="handleClose">
      <el-input placeholder="Folder Name" @keydown.enter.native="createFolder" v-model="createFolderName"></el-input>
      <span slot="footer" class="dialog-footer">
    <el-button @click="createFolderUI = false">Cancel</el-button>
    <el-button type="primary" @click="createFolder">Create</el-button>
  </span>
    </el-dialog>

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
      :headers="{Authorization: 'Bearer ' + this.$store.getters.jwtoken}"
      :action="uploadUrl()"
      :data="userInfo"
      :auto-upload="false"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
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
    <el-button @click="showUpload = false">Cancel</el-button>
    <el-button type="primary" @click="uploadFiles">Upload</el-button>
  </span>
  </el-dialog>
  </div>
</template>

<script>

    export default {
        name: "Manage",
        mounted:function(){
            if (this.$store.getters.userid === null){
                this.$router.push('/login')
            }
            this.userid = this.$store.getters.userid;
            this.rootdir = this.$store.getters.rootdir;
            this.currentdir = this.rootdir;
            this.dirList.push(this.rootdir);
            this.getList(this.rootdir);
            this.treeFiles.push({label: "root", id: this.rootdir, children: []});
        },
        computed:{
            userInfo: function(){
                return {parentDir: this.currentdir}
            },
        },
        methods: {
            logout(){
                this.$store.commit('LOGOUT');
            },
            handleDownload(){
                var index;
                var selected;
                for (index in this.files){
                    if (this.files[index].checked === true){
                        selected = this.files[index].fileId;
                        this.$http({
                            method: 'get',
                            url: 'http://localhost:8011/file-ws/users/' + this.userid + '/files?fileId=' + selected,
                            responseType: 'blob'

                        }).then(result => {
                            let url = window.URL.createObjectURL(new Blob([result.data]));
                            let link = document.createElement('a');
                            link.style.display = 'none';
                            link.href = url;
                            link.setAttribute('download', result.headers['content-disposition'].split('=')[1].replace("\"", "").replace("\"", ""));

                            document.body.appendChild(link);
                            link.click();
                        }).catch(err => {
                            console.log(err);
                                this.$router.push('/login');
                                this.$message.error('Please login again');
                            }
                        );
                    }
                }
            },
            uploadUrl(){
                console.log(this.userInfo);
                return 'http://localhost:8011/file-ws/users/' + this.userid + '/files';
            },
            nodeClick(item, node, self){
                this.currentTreeNode = node;
            },
            moveFile(){
                var index;
                var selected;
                for (index in this.files){
                    if (this.files[index].checked === true){
                        selected = this.files[index].fileId;
                        this.$http({
                            method: 'put',
                            data: {
                                "parentDir": this.currentTreeNode.data.id
                            },
                            url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/files?fileId=' + selected
                        }).then(result => {
                            this.moveUI = false;
                            this.getList(this.currentdir);
                        }).catch(err => {
                                this.$router.push('/login');
                                this.$message.error('Please login again');
                            }
                        );
                    }
                }
            },
            handleMove(){
                // var index;
                // for (index in this.rootFiles){
                //     if (this.rootFiles[index].isFolder === true)
                //       this.treeFiles.push({label: this.rootFiles[index].filename, id: this.rootFiles[index].fileId});
                // }
                this.moveUI = true;
            },
            loadNode(node, resolve) {
                if (node.level === 0){
                    return resolve(this.treeFiles);
                }
                else {
                    this.getTreeChild(node.data.id, resolve)
                }
            },
            getTreeChild(id, resolve) {
                this.userid = this.$store.getters.userid;
                this.$http({
                    method: 'get',
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/folders?fileId=' + id
                }).then(result => {
                    var tmp = result.data.files;
                    var index;
                    var children = [];
                    for (index in tmp){
                        if (tmp[index].isFolder === true)
                            children.push({label: tmp[index].filename, id: tmp[index].fileId});
                    }
                    resolve(children);
                }).catch(err => {
                        this.$router.push('/login')
                        this.$message.error('Please login again');
                    }
                );
            },
            rename(){
                var index;
                var selected;
                for (index in this.files){
                    if (this.files[index].checked === true){
                        selected = this.files[index].fileId;
                    }
                }
                this.$http({
                    method: 'put',
                    data: {
                        "filename": this.renameName,
                    },
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/files?fileId=' + selected
                }).then(result => {
                    this.renameUI = false;
                    this.renameName = '';
                    this.getList(this.currentdir);
                }).catch(err => {
                        this.$router.push('/login');
                        this.$message.error('Please login again');
                    }
                );
            },
            createFolder(){
                this.$http({
                    method: 'post',
                    data: {
                        "filename": this.createFolderName,
                        "parentDir": this.dirList[this.dirList.length-1],
                        "isFolder": true
                    },
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/folders'
                }).then(result => {
                    this.createFolderUI = false;
                    this.createFolderName = '';
                    this.getList(this.currentdir);
                }).catch(err => {
                        this.$router.push('/login');
                        this.$message.error('Please login again');
                    }
                );
            },
            goBack(){
                this.dirList.pop();
                this.currentdir = this.dirList.pop();
                this.$http({
                    method: 'get',
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/folders?fileId=' + this.currentdir
                }).then(result => {
                    if (this.dirList.length === 0){
                        this.dirList.push(this.rootdir);
                    }
                    this.files = result.data.files;
                    var index;
                    for (index in this.files){
                        this.files[index].checked = false;
                    }
                }).catch(err => {
                        this.$router.push('/login')
                        this.$message.error('Please login again');
                    }
                );
            },
            openFolder(fileID){
                this.userid = this.$store.getters.userid;
                this.$http({
                    method: 'get',
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/folders?fileId=' + fileID
                }).then(result => {
                    this.files = result.data.files;
                    var index;
                    for (index in this.files){
                        this.files[index].checked = false;
                    }
                    this.dirList.push(fileID);
                    this.currentdir = fileID;
                    this.flag = false;
                }).catch(err => {
                        this.$router.push('/login')
                        this.$message.error('Please login again');
                    }
                );
            },
            getList(dir){
                this.$http({
                    method: 'get',
                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/folders?fileId=' + dir
                }).then(result => {
                    this.files = result.data.files;
                    this.rootFiles = this.files;
                    var index;
                    for (index in this.files){
                        this.files[index].checked = false;
                    }
                }).catch(err => {
                    this.$router.push('/login')
                    this.$message.error('Please login again');
                    }
                );
            },
            showEvents:function(file){
                file.checked = !file.checked;
                var checked;
                var count = 0;
                this.flag = false;
                for (checked in this.files){
                    if (this.files[checked].checked){
                        this.flag = true;
                        count++;
                    }
                }
                if (count > 1){
                    this.multiCheck = true;
                }
                else{
                    this.multiCheck = false;
                }
            },
            showDefaultImg(url) {
                if (!url) {
                    return require('../assets/folder.jpg')
                } else {
                    return url
                }
            },
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
                        this.createFolderUI = false;
                        this.renameUI = false;
                        this.moveUI = false;
                        done();
                    })
                    .catch(_ => {});
            },
            handleDelete(){
                this.$confirm('Are you sure to delete?')
                    .then(_ => {
                        var checked;
                        for (checked in this.files){
                            if (this.files[checked].checked){
                                this.$http({
                                    method: 'delete',
                                    url: 'http://localhost:8011/metadata-ws/users/' + this.userid + '/files?fileId=' + this.files[checked].fileId
                                }).then(result => {
                                    this.flag = false;
                                    this.getList(this.currentdir);
                                }).catch(err => {
                                        this.$router.push('/login')
                                        this.$message.error('Please login again');
                                    }
                                );
                            }
                        }
                    })
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
                currentTreeNode: '',
                moveUI: false,
                renameUI: false,
                renameName: '',
                createFolderUI: false,
                createFolderName: '',
                userid:'',
                currentdir:'',
                dirList: [],
                flag: false,
                multiCheck: false,
                treeFiles: [],
                rootFiles: [],
                files: [
                    {
                        "checked": false,
                        "fileId": "2adb3d0f-4340-4c75-bdcc-73188a8f9603",
                        "filename": "6666-hyeztyt3717863.png",
                        "owner": "a5d65875-5f7a-4473-9a9a-093bd639389f",
                        "size": 1979214,
                        "createdTime": "2019-12-02T22:44:54.000+0000",
                        "lastModifiedTime": "2019-12-02T22:44:54.000+0000",
                        "parentDir": "29e25162-c689-4d73-94e1-379e20a2e2d2",
                        "isFolder": false
                    },
                    {
                        "checked": false,
                        "fileId": "5126992d-0a6e-409f-a865-b619cf737198",
                        "filename": "test-folder",
                        "owner": "a5d65875-5f7a-4473-9a9a-093bd639389f",
                        "size": 0,
                        "createdTime": null,
                        "lastModifiedTime": null,
                        "parentDir": "29e25162-c689-4d73-94e1-379e20a2e2d2",
                        "isFolder": true
                    },
                    {
                        "checked": false,
                        "fileId": "fe2bec87-4183-419f-800e-fd91a95bfe7b",
                        "filename": "my-folder",
                        "owner": "a5d65875-5f7a-4473-9a9a-093bd639389f",
                        "size": 0,
                        "createdTime": null,
                        "lastModifiedTime": null,
                        "parentDir": "29e25162-c689-4d73-94e1-379e20a2e2d2",
                        "isFolder": true
                    }
                ],
                showUpload: false,
                filterText: '',

            };
        },
    }
</script>

<style scoped>
  .el-header {
    background-color: #B3C0D1;
    color: white;
    line-height: 100px;
  }

  .el-aside {
    color: #333;
  }

  .el-button{
    border: 0px solid #DCDFE6;
  }

</style>
