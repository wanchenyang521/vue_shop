<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图区域-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input clearable @clear="getGoodsList" placeholder="请输入内容" v-model="queryInfo.query">
              <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </el-col>
        </el-row>
<!--        table表格区域-->
        <el-table
          :data="goodslist"
        border
        stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="价格（元）" prop="goods_price" width="95px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
          <el-table-column label="添加时间" prop="add_time" width="140px">
            <template slot-scope="scope">
              {{scope.row.add_time | dataFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
              <el-button @click="editById(scope.row.goods_id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button @click="removeById(scope.row.goods_id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>

        </el-table>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
<!--      编辑区域-->
<!--      <el-dialog-->
<!--        title="商品信息"-->
<!--        :visible.sync="editFormDialogVisible"-->
<!--        width="30%">-->
<!--        <el-form :model="editForm"-->
<!--                 :rules="editFormRules"-->
<!--                 ref="editFormRef"-->
<!--                 label-width="100px">-->
<!--          <el-form-item label="商品名称" prop="goods_name">-->
<!--            <el-input v-model="editForm.goods_name"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="商品价格" prop="goods_price">-->
<!--            <el-input type="number" v-model="editForm.goods_price"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="商品数量" prop="goods_number">-->
<!--            <el-input type="number" v-model="editForm.goods_number"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="商品重量" prop="goods_weight">-->
<!--            <el-input type="number" v-model="editForm.goods_weight"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="商品介绍" prop="goods_introduce">-->
<!--            <el-input v-model="editForm.goods_introduce"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="图片路径" prop="pics">-->
<!--            <el-input  v-model="editForm.pics"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="商品价格" prop="attrs">-->
<!--            <el-input  v-model="editForm.attrs"></el-input>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <span slot="footer" class="dialog-footer">-->
<!--          <el-button @click="editFormDialogVisible = false">取 消</el-button>-->
<!--          <el-button type="primary" @click="editFormDialogVisible = false">确 定</el-button>-->
<!--        </span>-->
<!--      </el-dialog>-->
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //  总数据条数
      total: 0,
      //  商品列表
      goodslist: [],
      editForm: {
        id: '',
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: '',
        attrs: ''
      },
      editFormDialogVisible: false,
      editFormRules: {
        goods_name: [
          { required: true, message: '商品名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    //  根据分页获取列表
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async editById (id) {
      this.editFormDialogVisible = true
      /*
      id商品 ID不能为空`携带在url中`
      goods_name商品名称不能为空
      goods_price价格不能为空
      goods_number数量不能为空
      goods_weight重量不能为空
      goods_introduce介绍可以为空
      pics上传的图片临时路径（对象）可以为空
      attrs
      */
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.editForm = res.data
    },
    removeById (id) {
      this.$confirm('此操作将永久删除商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getGoodsList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped lang="less">

</style>
