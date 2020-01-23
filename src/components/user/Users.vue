<template>
    <div>
<!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card >
<!--        搜索与添加-->
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入内容"
                      @clear="getUserList"
                      v-model="queryInfo.query"
                      clearable>
              <el-button slot="append" icon="el-icon-search" @click="getUserList">
              </el-button>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>

        <el-table
          :data="userlist"
          stripe
          border
          style="width: 100%">
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="username" label="姓名" width="180"></el-table-column>
          <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
          <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="" label="操作" width="180px">
            <template slot-scope="scope">
<!--              修改-->
              <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
<!--              删除-->
              <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
              </el-tooltip>
<!--              分配角色-->
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button @click="setRole(scope.row)" size="mini" type="warning" icon="el-icon-setting"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
<!--        分页区域-->
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1,2,3,4,5]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="this.total">
        </el-pagination>
      </el-card>

<!--      添加用户-->
      <el-dialog
        @close="addDialogClosed"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%">
<!--        主体区域-->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="repassword">
            <el-input v-model="addForm.repassword" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

<!--        底部区域-->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
<!--      修改用户对话框-->
      <el-dialog
        @close="editDialogClosed"
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%">
        <span>
          <el-form :model="editForm"
                   :rules="editFormRules"
                   ref="editFormRef"
                   label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
<!--      分配角色对话框-->
      <el-dialog
        @close="setRoleDialogClosed"
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%">
        <div>
          <p>用户：{{userInfo.username}}</p>
          <p>角色：{{userInfo.role_name}}</p>
          <p>分配角色
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolelist"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
         </span>
      </el-dialog>

    </div>

</template>

<script>
export default {
  name: '',
  data () {
    var checkEmail = (rule, value, callback) => {
      // const regEmail = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('邮箱格式不正确'))
      }
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        callback()
      } else {
        callback(new Error('手机格式不正确'))
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      selectedRoleId: '',
      //  所有数据的角色列表
      rolelist: {},
      //  需要被分配角色信息
      userInfo: {},
      setRoleDialogVisible: false,
      //  获取用户列表参数
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        //  当前每页显示多少条
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      //  修改用户对话框
      editDialogVisible: false,
      // 添加表单用户对象
      addForm: {
        username: '',
        password: '',
        repassword: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      // 添加表单对象规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户秘密', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        repassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    //  保存分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择新角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //  展示分配角色
    async setRole (userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data
    },
    //  显示编辑用户对话框
    async showEditDialog (id) {
      this.editDialogVisible = true
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      // console.log(this.editForm)
    },
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件,一页显示多少条
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 页码值发生改变
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    //  监听switch状态开关的变化
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      return this.$message.success('用户状态修改成功')
      // return this.$message1('xxxx', 'error')
    },
    //  监听添加用户对话框事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    //   监听编辑对话框事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    //  点击按钮
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //  可以发起添加用户的网络请求  this.$delete(this.form,'members1')
        var tempUser = JSON.parse(JSON.stringify(this.addForm))
        this.$delete(tempUser, 'repassword')
        const { data: res } = await this.$http.post('users', tempUser)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.addDialogVisible = false
        this.$message.success('添加用户成功')
        this.getUserList()
      })
    },
    // 修改用户信息
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          mobile: this.editForm.mobile,
          email: this.editForm.email
        })
        if (res.meta.status !== 200) {
          return this.$message.error('添加用户失败')
        }
        this.getUserList()
        this.editDialogVisible = false
        this.$message.success('修改用户成功')
      })
    },
    // 根据id删除对应的用户
    async removeUserById (id) {
      //  const confirmResult =
      await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message({
            type: 'success',
            message: '删除用户失败!'
          })
        } else {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getUserList()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      //  确认删除则返回字符串
      // console.log(confirmResult)
    }
  }
}
</script>

<style scoped lang="less">

</style>
