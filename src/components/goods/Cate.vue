<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图区域-->
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCateDialogVisible">添加分类</el-button>
          </el-col>
        </el-row>
<!--        表格-->
        <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border>
<!--          是否有效-->
          <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" style="color: #55a532"
            v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color:red;" v-else></i>
          </template>
<!--          排序-->
          <template slot="order" slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
            <el-tag v-else type="warning" size="mini">三级</el-tag>
          </template>
          <!--        操作-->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialogVisible(scope.row.cat_id )">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
<!--        分页-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="querInfo.pagenum"
          :page-sizes="[1, 2, 4, 10]"
          :page-size="querInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
<!--      添加分类对话框-->
      <el-dialog
        @close="addCateDialogCloesd"
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="30%">
<!--        添加分类表单-->
        <el-form :model="addCateForm"
                 :rules="addCateFormRules"
                 ref="addCateFormRef" label-width="100px" class="demo-ruleForm">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              style="width: 100%"
              clearable
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChange"></el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
<!--      编辑对话框-->
      <el-dialog
        @close="editCateDialogCloesd"
        title="编辑用户"
        :visible.sync="editDialogVisible"
        width="30%">
        <el-form :model="editCateForm"
                 :rules="editCateFormRules"
                 ref="editCateFormRef" label-width="100px">
          <el-form-item label="分类名称">
            <el-input v-model="editCateForm.cat_name" disabled></el-input>
          </el-form-item>
          <el-form-item label="新分类名称" prop="new_cat_name">
            <el-input v-model="editCateForm.new_cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCast">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      //  添加分类的数据表单
      addCateForm: {
        //  默认分类父 ID
        cat_pid: 0,
        cat_name: '',
        //  分类层级 一级
        cat_level: 0
      },
      editCateForm: {
        cat_id: '',
        cat_name: '',
        new_cat_name: ''
      },
      //  查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      //  总数据条数
      total: 0,
      parentCateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          //  当前列定义为模板列
          type: 'template',
          //  表示当前使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // prop: 'cat_level',
          //  当前列定义为模板列
          type: 'template',
          //  表示当前使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //  当前列定义为模板列
          type: 'template',
          //  表示当前使用的模板名称
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      editDialogVisible: false,
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      editCateFormRules: {
        new_cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 指定级联选择器
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      //  选择父级
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    showAddCateDialogVisible () {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    async showEditCateDialogVisible (id) {
      this.editDialogVisible = true
      this.editCateForm.cat_id = id
      // 先获取数据
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        console.log('获取用户失败')
      }
      this.editCateForm.cat_name = res.data.cat_name
    },
    //  获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //  数据获取列表
      this.catelist = res.data.result
      this.total = res.data.total
      console.log(this.catelist)
    },
    //  监听pagesize改变
    handleSizeChange (newsize) {
      this.querInfo.pagesize = newsize
      this.getCateList()
    },
    //  监听页码值
    handleCurrentChange (newpage) {
      this.querInfo.pagenum = newpage
      this.getCateList()
    },
    //  获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    //  选择项
    parentCateChange () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        //  父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return ''
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败')
        }
        this.getCateList()
        this.addCateDialogVisible = false
        this.$message.success('添加成功')
      })
    },
    addCateDialogCloesd () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    editCateDialogCloesd () {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.cat_id = ''
      this.editCateForm.cat_name = ''
      this.editCateForm.new_cat_name = ''
    },
    //  编辑用户
    async editCast () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.new_cat_name })
        if (res.meta.status !== 200) {
          console.log(res)
          return this.$message.error('编辑失败')
        }
        this.getCateList()
        this.editDialogVisible = false
        this.$message.success('添加成功')
      })
    },
    // 删除
    async deleteCate (id) {
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getCateList()
      this.$message.success('删除成功')
    }
  }
}
</script>

<style scoped lang="less">
.treeTable{
  margin-top: 15px;
}

</style>
