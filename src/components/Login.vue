<template>
    <div class="login_container">
      <div class="login_box">
<!--        头像区域-->
        <div class="avatar_box">
          <img src="../assets/logo.png" alt="">
        </div>
<!--        登录表单区域-->
        <div class="login_form">
          <el-form :rules="rules" ref="loginFormRef" :model="loginForm"  label-width="0px" class="login_form_el">
<!--            用户名-->
            <el-form-item prop="username">
              <el-input
                placeholder="请输入登录名"
                v-model="loginForm.username"
                prefix-icon="iconfont icon-user">
              </el-input>
            </el-form-item>
<!--          密码-->
            <el-form-item   prop="password">
              <el-input
                placeholder="请输入密码"
                v-model="loginForm.password"
                prefix-icon="iconfont icon-3702mima"
                type="password">
              </el-input>
            </el-form-item>
<!--            按钮区域-->
            <el-form-item class="btn">
              <el-button type="primary" @click="submitLoginForm('loginFormRef')">登录</el-button>
              <el-button type="info"  @click="resetLoginForm('loginFormRef')">重置</el-button>
            </el-form-item>

          </el-form>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      //  表单数据
      loginForm: {
        username: 'admin',
        password: '123456'

      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户秘密', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm (formName) {
      this.$refs[formName].resetFields()
    },
    submitLoginForm (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) {
            this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
            console.log(res)
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.login_container{
  background-color: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-content: flex-start;
  .avatar_box{
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    transform: translate(0,-50%);
    background-color: #fff;
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form{
    width: 100%;
    margin-top: -40px;
    display: flex;
    justify-content: center;
  }
}
.login_form_el{
  width: 80%;
}
  .btn{
    display: flex;
    justify-content: flex-end;
  }

</style>
