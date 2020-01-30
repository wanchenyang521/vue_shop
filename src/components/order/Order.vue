<template>
    <div>
      <!--      面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图区域-->
      <el-card>
        <el-row>
          <el-col :span="8">
            <el-input placeholder="请输入内容" >
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
        </el-row>
<!--        订单列表数据-->
        <el-table :data="orderlist"
        border
        stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="订单编号" prop="order_number"></el-table-column>
          <el-table-column label="订单价格" prop="order_price"></el-table-column>
          <el-table-column label="是否付款" prop="pay_status">
            <template slot-scope="scope">
              <el-tag type="successs" v-if="scope.row.pay_status === '1' ">已付款</el-tag>
              <el-tag type="danger" v-else>未付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send"></el-table-column>
          <el-table-column label="下单事件" prop="create_time">
            <template slot-scope="scope">
              {{scope.row.create_time | dataFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" >
            <template>
              <el-tooltip :enterable="false"
                          class="item"
                          effect="dark"
                          content="修改订单地址"
                          placement="top">
                <el-button size="mini"
                           type="primary"
                           icon="el-icon-edit"
                @click="showBox"></el-button>
              </el-tooltip>
              <el-tooltip :enterable="false" class="item"
                          effect="dark" content="物流进度"
                          placement="top">
                <el-button size="mini"
                           type="success"
                           @click="showprogressBox"
                           icon="el-icon-location"></el-button>
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
          :page-sizes="[1, 2, 5, 10]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
<!--      修改地址对话框-->
      <el-dialog
      @close="addDialogClosed"
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%">
      <el-form :model="addressForm"
               :rules="addressFormRules"
               ref="addressFormRef"
               label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            clearable
            v-model="addressForm.address1"
            :options="cityData"
            :props="cascaderProps"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
    </el-dialog>
<!--      物流-->
      <el-dialog
        title="物流进度"
        :visible.sync="progressVisible"
        width="30%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      addressVisible: false,
      progressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      cascaderProps: {
        expandTrigger: 'hover',
        children: 'children',
        checkStrictly: 'true'
      },
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    showBox () {
      this.addressVisible = true
    },
    addDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    async showprogressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流失败')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style scoped lang="less">
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";
</style>
