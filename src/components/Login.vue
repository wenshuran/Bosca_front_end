<template>
  <div id="login">
    <div style="display: flex;justify-content: center;margin-top: 150px">
      <el-card style="width: 30%" >
        <div slot="header" class="clearfix">
          <span>Login</span>
        </div>
        <el-form ref="form" :model="loginInfo" label-width="80px">
          <el-form-item label="username">
            <el-input v-model="loginInfo.username" ref="username" @keyup.enter.native="login"></el-input>
          </el-form-item>
          <el-form-item label="password">
            <el-input v-model="loginInfo.password" @keyup.enter.native="login"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login" v-loading.fullscreen.lock="fullscreenLoading">login</el-button>
            <el-button @click="sign_up">sign up</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
    export default {
        name: "login",
        data() {
            return {
                loginInfo: { username: '', password: '' },
                fullscreenLoading: false,
            }
        },
        mounted(){
            this.$refs.username.focus()
        },
        computed: {
            responseResult: {
                get() {
                    return this.loginInfo.username + "\n" + this.loginInfo.password
                }
            }
        },
        methods: {
            login() {
                if (this.loginInfo.username === ''){
                    this.$message({
                        message: 'Please enter username',
                        type: 'warning',
                    });
                }
                else if (this.loginInfo.password === ''){
                    this.$message({
                        message: 'Please enter password',
                        type: 'warning',
                    });
                }
                else{
                    this.fullscreenLoading = true;
                    this.$http({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method: 'post',
                        data: {
                            "email": this.loginInfo.username,
                            "password": this.loginInfo.password
                        },
                        url: 'http://localhost:8011/user-ws/user/login'
                    }).then(result => {
                        console.log(result);
                        if (result.status === 200){
                            var data = result.data;
                            this.$store.commit('LOGIN', {token: result.headers['token'], user: result.headers['userid']});
                            this.$http({
                                method: 'get',
                                url: 'http://localhost:8011/user-ws/users/'+result.headers['userid']
                            }).then(
                                result1 => {
                                    this.$store.commit('SETROOT', result1.data.rootDir);
                                }
                            );
                            setTimeout(() => {
                                this.$message({
                                    message: 'Login Success!',
                                    type: 'success',
                                });
                                this.fullscreenLoading = false;
                                this.$router.push('/');
                            }, 300);

                        }
                        else {
                            this.$message.error('Username or password wrong!');
                            this.password = '';
                        }
                    }).catch(err => {
                            this.fullscreenLoading = false;
                            console.log(err);
                            //this.$message.error('Login Fail! ' + err.response.data.message);
                            this.loginInfo.password = '';
                        }
                    );
                }
            },
            sign_up(){
                this.$router.push('/signUp');
            }
        }
    }
</script>

<style scoped>
  .el-input {
    width:90%;
  }
</style>
