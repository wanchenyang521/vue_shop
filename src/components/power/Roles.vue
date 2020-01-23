<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--  卡片视图-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>
        <el-table
          stripe
          border
          :data="rolelist">
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row v-for="(item1,index1) in scope.row.children" :key="item1.id" :class="['bdbottom','vcenter',index1 ===  0 ? 'bdtop': '']">
<!--                一级-->
                <el-col :span="5">
                 <el-tag
                   @close="removeRightById(scope.row,item1.id)"
                   closable > {{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
<!--                二级和三级-->
                <el-col :span="19">
                  <el-row v-for="(item2,index2) in item1.children" :key="item2.id" :class="[index2 !==  0 ? 'bdtop': '','vcenter']">
                    <el-col :span="6">
                      <el-tag
                        @close="removeRightById(scope.row,item2.id)"
                        closable
                        type="success"> {{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="13">
                      <el-tag
                        @close="removeRightById(scope.row,item3.id)"
                        closable
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id">
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
<!--          索引列-->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!--              修改-->
              <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showEditDialog(scope.row.id)">编辑</el-button>
              </el-tooltip>
              <!--              删除-->
              <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                <el-button size="mini" type="danger" icon="el-icon-delete"  @click="removeRoleById(scope.row.id)">删除</el-button>
              </el-tooltip>
              <!--              分配角色-->
              <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
                <el-button size="mini"
                           @click="showSetRightDialog(scope.row)"
                           type="warning"
                           icon="el-icon-setting">分配权限</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
<!--      添加角色信息-->
      <el-dialog
        @close="addDialogClosed"
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%">
<!--        主体区域-->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoles">确 定</el-button>
  </span>
      </el-dialog>
<!--      编辑角色-->
      <el-dialog
        @close="editDialogClosed"
        title="修改角色信息"
        :visible.sync="editDialogVisible"
        width="50%">
        <span>
          <el-form :model="editForm"
                   :rules="addFormRules"
                   ref="editFormRef"
                   label-width="100px">
            <el-form-item label="角色ID">
              <el-input v-model="editForm.roleId" disabled></el-input>
            </el-form-item>
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
<!--      分配权限-->
      <el-dialog
        @close="setRightDialogClosed"
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%">
        <span>
<!--         树形控件-->
          <el-tree
            ref="treeRef"
            :default-checked-keys="defKeys"
            default-expand-all
            node-key="id"
            show-checkbox
            :data="rightslist"
            :props="treeProps"></el-tree>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>

</template>

<script>
export default {
  data () {
    return {
      //  默认选中权限值
      defKeys: [],
      roleId: '',
      //  所有角色列表
      rolelist: [],
      rightslist: [],
      addDialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {},
      // 添加表单对象规则
      addFormRules: {
        roleName: [
          { required: true, message: '角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ]
      },
      treeProps: {
        children: 'children',
        label: 'authName'
      }
    }
  },
  created () {
    this.getRoleList()
  },
  //  获取所有角色列表
  methods: {
    //  分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      this.$message.success('更新权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    //  通过递归的形式下，获取角色下的三级权限
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    async showSetRightDialog (role) {
      //  获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.rightslist = res.data
      //  递归获取三级节点id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
      this.roleId = role.id
    },
    removeRightById (role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        role.children = res.data
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 根据id删除对应的用户
    async removeRoleById (id) {
      await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          this.$message({
            type: 'error',
            message: '删除用户失败!'
          })
        } else {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getRoleList()
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
      //  确认删除则返回字符串
      // console.log(confirmResult)
    },
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.getRoleList()
        this.editDialogVisible = false
        this.$message.success('修改角色成功')
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
    },
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.addDialogVisible = false
        this.$message.success('添加角色成功')
        this.getRoleList()
      })
    }
  }
}
</script>
<style scoped lang="less">
 .el-tag{
  margin: 7px;
}
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }

</style>
