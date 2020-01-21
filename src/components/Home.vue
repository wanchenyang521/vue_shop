<template>
  <el-container class="home-container">
<!--    头部区域-->
    <el-header>
      <div class="headerLogo">
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
<!--    页面主体区域-->
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#ccc"
          active-text-color="#ffd04b"
          unique-opened
          :collapse = "isCollapse"
          :collapse-transition="false"
          :router = "true"
          :default-active="activePath"
        >
<!--          一级菜单-->
          <el-submenu :index="item.id+''"
                      v-for="item in menulist"
                      :key="item.id">
<!--            一级菜单模板-->
            <template slot="title">
<!--              图标-->
              <i :class="iconObj[item.id]"></i>
<!--              文本-->
              <span>{{item.authName}}</span>
            </template>
<!--            二级菜单-->
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/'+subItem.path+''"
              @click="saveNavState('/'+subItem.path+'')"
            >
              <template slot="title">
                <!--              图标-->
                <i class="el-icon-menu"></i>
                <!--              文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-danju'
      },
      isCollapse: false,
      //  被激活地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  name: '',
  methods: {
    loginOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menulist = res.data
      }
    },
    // 菜单折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    //  保存链接激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped lang="less">
  .home-container{
    height: 100%;
  }
  .el-menu{
    border-right: 0;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
  }
  .headerLogo{
    display: flex;
    align-items: center;
    font-size: 30px;
    color: #cccccc;
  }
  .headerLogo img{
    height: 60px;
    width: 60px;
    border-radius: 50%;
    background-color: white;
  }

  .el-aside{
    background-color: #333744;
  }
  .el-main{
    background-color: #fff;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    background-color: #4a5064;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
