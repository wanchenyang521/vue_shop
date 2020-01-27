<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片-->
      <el-card>
<!--        头部警告区域-->
        <el-alert
          :closable="false"
          title="注意：只允许为第三级分类设置相关参数！"
          type="warning"
          show-icon>
        </el-alert>
<!--        选择商品分类区域-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
<!--            选择商品分类级联选择框-->
            <el-cascader
              clearable
              v-model="selectedCateKeys"
              :options="catelist"
              :props="cascaderProps"
              @change="handleChange">
            </el-cascader>
          </el-col>
        </el-row>
<!--        tab页签区域-->
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="动态参数" name="many">
<!--            添加动态参数的面板-->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
<!--                  循环渲染-->
                  <el-tag @close="handleClose(index, scope.row)" closable v-for="(item,index) in scope.row.attr_vals" :key="index">
                    {{item}}
                  </el-tag>
<!--                  输入按钮-->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
<!--                  添加按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary"
                             icon="el-icon-edit"
                             size="mini"
                             @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger"
                             icon="el-icon-delete"
                             size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
<!--            添加静态属性的面板-->
            <el-button type="primary"
                       size="mini"
                       :disabled="isBtnDisabled"
                       @click="addDialogVisible = true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--                  循环渲染-->
                  <el-tag @close="handleClose(index, scope.row)" closable v-for="(item,index) in scope.row.attr_vals" :key="index">
                    {{item}}
                  </el-tag>
                  <!--                  输入按钮-->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!--                  添加按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary"
                             icon="el-icon-edit"
                             size="mini"
                             @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
<!--      添加参数对话框-->
      <el-dialog
        @close="addDialogClosed"
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="30%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
<!--      编辑-->
      <el-dialog
        @close="editDialogClosed"
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="30%">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      catelist: [],
      // 指定级联选择器
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      // 级联选择框双向绑定的数据
      selectedCateKeys: [],
      //  被激活页签
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      //  控制添加对话框
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      editForm: {},
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //  默认情况隐藏输入文本框
      inputVisible: false,
      //  文本框输入内容
      inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //  数据获取列表
      this.catelist = res.data
      console.log(this.catelist)
    },
    //  级联选择框选中项变化，会触发
    async handleChange () {
      this.getParamsData()
    },
    //  这是tabs页签点击事件
    handleClick () {
      this.getParamsData()
    },
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return ''
      }
      //  选择的是三级分类
      console.log(this.selectedCateKeys)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      // console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //  addDialogClosed监听对话框的事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    //  点击按钮
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    //  显示对话框
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //  点击按钮
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return ''
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //  删除
    async removeParams (attrId) {
      await this.$confirm('此操作将永久删除改数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.getParamsData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(async () => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async handleInputConfirm (row) {
      //  文本框失去焦点
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return ''
      }
      //  输入内容，进行后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttr(row)
    },
    showInput (row) {
      row.inputVisible = true
      //  让文本框自动获取焦点
      //  $nextTick 就是当页面上元素被重新渲染之后，在执行代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose (index, row) {
      //  删除对应
      row.attr_vals.splice(index, 1)
      this.saveAttr(row)
    },
    async saveAttr (row) {
      //  需要保存至数据库categories/:id/attributes/:attrId
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('提交成功')
      }
      this.$message.success('修改成功')
    }
  },
  computed: {
    //  如果按钮需要被禁用，则返回true,false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //  当前选中的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //  动态计算dialogTitile
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style scoped lang="less">
  .cat_opt{
    margin: 15px 0;
  }
  .el-tag{
    margin-left: 10px;
  }
  .input-new-tag{
    width: 90px;
    margin-left: 10px;
  }
  .button-new-tag{
    margin-left: 10px;
  }
</style>
