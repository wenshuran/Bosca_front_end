<template>
<div id="signUp">
  <div style="display: flex;justify-content: center;margin-top: 150px">
    <el-card style="width: 30%" >
      <div slot="header" class="clearfix">
        <span>Sign Up</span>
      </div>
      <el-form ref="form" :model="signUpInfo" label-width="80px">
        <el-form-item label="username">
          <el-input v-model="signUpInfo.username" ref="username" @keyup.enter.native="signUp"></el-input>
        </el-form-item>
        <el-form-item label="email">
          <el-input v-model="signUpInfo.email" @keyup.enter.native="signUp"></el-input>
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="signUpInfo.password" @keyup.enter.native="signUp"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="signUp" v-loading.fullscreen.lock="fullscreenLoading">Sign Up</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</div>
</template>

<script>
    export default {
        name: "SignUp",
        data() {
            return {
                signUpInfo: { username: '', email: '', password: '' },
                fullscreenLoading: false,
            }
        },
        methods: {
            signUp() {
                if (this.signUpInfo.username === ''){
                    this.$message({
                        message: 'Please enter username',
                        type: 'warning',
                    });
                }
                else if (this.signUpInfo.email === ''){
                    this.$message({
                        message: 'Please enter email address',
                        type: 'warning',
                    });
                }
                else if (this.signUpInfo.password === ''){
                    this.$message({
                        message: 'Please enter password',
                        type: 'warning',
                    });
                }
                else{
                    this.fullscreenLoading = true;
                    this.$http({
                        method: 'post',
                        url: 'https://22d5c6e0-8f52-4c42-914c-26dd11d2227f.mock.pstmn.io/users',
                        data: {
                            "username": this.signUpInfo.username,
                            "email": this.signUpInfo.email,
                            "password": this.signUpInfo.password
                        }
                    }
                    ).then(result => {
                        console.log(result);
                        this.fullscreenLoading = false;
                        if (result.status === 200){
                            this.$router.push('/');
                        }
                        else {
                            this.fullscreenLoading = false;
                            this.$message.error(result.data.message);
                        }
                    }).catch(err => {
                            this.fullscreenLoading = false;
                            this.$message.error(err.response.data);
                            this.signUpInfo.email = '';
                            this.signUpInfo.password = '';
                    }
                    );
                    // setTimeout(() => {
                    //     this.fullscreenLoading = false;
                    //     this.$message.error('Time out!');
                    // }, 20000);
                }
            },
        }
    }
</script>

<style scoped>

</style>
