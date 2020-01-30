<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card>
<!--        提示区域-->
        <el-alert
          title="添加商品信息"
          type="info"
          center
          :closable="false"
          show-icon>
        </el-alert>
<!--        步骤条区域-->
        <el-steps align-center :space="200" :active="activeIndex- 0" finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm"
                 :rules="addFormRules"
                 ref="addFormRef"
                 label-position="top"
                 label-width="100px">

          <!--        tab栏区域-->
          <el-tabs
            @tab-click="tabClicked"
            :before-leave="beforeTabLeave"
            v-model="activeIndex" :tab-position="'left'">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input type="number"  v-model="addForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input type="number" v-model="addForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input type="number" v-model="addForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item type="array" label="商品分类" prop="goods_cat">
                <el-cascader
                  clearable
                  v-model="addForm.goods_cat"
                  :options="catelist"
                  :props="cascaderProps"
                  @change="handleChange"></el-cascader>
              </el-form-item>

            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
                <el-form-item v-for="item in manyTableData"
                              :key="item.attr_id"
                              :label="item.attr_name">
                  <el-checkbox-group v-model="item.attr_vals">
                    <el-checkbox :label="cb"
                                 v-for="(cb, index) in item.attr_vals"
                                 border
                                 :key="index"></el-checkbox>>
                  </el-checkbox-group>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item v-for="item in onlyTableData"
                            :key="item.attr_id"
                            :label="item.attr_name">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
<!--              action: 图片上传api-->
              <el-upload
                :on-success="handleSuccess"
                :headers="headerObj"
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce">
              </quill-editor>
<!--              添加商品-->
<!--
                            ref="addFormRef"
                            :options="editorOption"
                            @blur="onEditorBlur($event)"
                            @focus="onEditorFocus($event)"
                            @ready="onEditorReady($event)"-->
              <el-button type="primary"
                         class="btnAdd" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
<!--      图片预览-->
      <el-dialog
        title="图片预览"
        :visible.sync="previewPathDialogVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //  以为','分割的分类列表
        goods_cat: [],
        //  图片的数组
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ]
      },
      catelist: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      //  动态参数列表
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewPathDialogVisible: false
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
      // console.log(this.catelist)
    },
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      // console.log(this.addForm.goods_cat)
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        //  获取分类categories/:id/attributes
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        //  获取分类categories/:id/attributes
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // console.log('---------------')
        // console.log(res)
        // console.log('---------------')
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      // 处理图片预览
      this.previewPath = file.response.data.url
      this.previewPathDialogVisible = true
    },
    handleRemove (file) {
      //  处理移除图片
      // console.log(file)
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm)
    },
    handleSuccess (response) {
      //  监听图片上传成功
      // console.log(response)
      //  1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //  2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
    },
    async add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要表单项')
        }
        //  执行添加的业务逻辑
        //  进行深拷贝 lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //  处理动态参数和静态属性
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        //  发起请求
        //  商品的名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style scoped lang="less">
  .el-checkbox{
    margin: 0 10px 0 0 !important;
  }
  .previewImg{
    width: 100%;
  }
  .btnAdd{
    margin-top: 15px;
  }
</style>
