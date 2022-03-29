import { ArtColumn, features, useTablePipeline } from 'ali-react-table'
import { WebsiteBaseTable } from 'assets/WebsiteBaseTable'
import React from 'react'
import { DatePicker, Radio, Select } from 'antd'
import 'antd/dist/antd.css';
import moment from "moment";
// import '../src/css/cell-edit.scss'

export default { title: '可编辑单元格' }

const random = (count: number) => {
  return Math.ceil(Math.random() * count)
}

const randomLine = (line: number, count: number) => {
  return new Array(random(line)).fill('').map((str, index) => (
    `${index + 1}. ${new Array(random(count)).fill('文本').join('')}`
  )).join('\n')
}

const dataSource: any[] = new Array(100).fill('').map((item, i) => ({
  id: `${i + 1}`,
  name: `键_${i + 1}`,
  value: randomLine(5, 10),
  sort: i,
  enable: 0,
  time: moment(new Date())
}))

const columns: ArtColumn[] = [
  { code: 'id', name: '编号', width: 100, align: 'center', lock: true },
  {
    code: 'name',
    name: '键',
    width: 150,
    editable: {
      type: 'input',
      tip: '键名不能为空',
      validate: (value: string) => !!value
    }
  },
  {
    code: 'value',
    name: '值',
    width: 150,
    editable: {
      type: 'input',
      tip: '值必须大于5位',
      multiline: true,
      validate: (value: string) => value && value.length > 5
    }
  },
  { code: 'sort', name: '排序', width: 50, align: 'center' },
  {
    code: 'enable',
    name: '启用',
    width: 100,
    align: 'center',
    editable: {
      type: 'select',
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ],
      tip: '请至少选择一项'
    }
  },
  {
    code: 'time',
    name: '更新时间',
    width: 100,
    align: 'center',
    editable: {
      type: 'date',
      format: 'YYYY-MM-DD HH:mm'
    }
  },
]

export function 基本用法 () {
  // 模拟异步获取下拉菜单数据
  setTimeout(() => {
    columns.find(col => col.code === 'enable').editable.options = [
      { label: '否', value: 0 },
      { label: '是', value: 1 },
      { label: '待定', value: -1 }
    ]
  }, 500)

  const pipeline = useTablePipeline({ components: { Select, Radio, DatePicker } })
    .primaryKey('id')
    .input({ dataSource, columns })
    .use(features.cellEdit({
      /**
       * 每当单元格数据发生变化时触发该回调
       * @param row         行数据（对应的列已经更新为新值，恒等于value）
       * @param rowIndex    行索引
       * @param column      单元格对应的列信息
       * @param columnIndex 列索引
       * @param value       单元格最新值
       */
      onChange ({ row, rowIndex, column, columnIndex, value }) {
        console.log('更新值', row, column)
      }
    }))

  return (
    <WebsiteBaseTable
      {...pipeline.getProps()}
      style={{ width: '100%', height: 500, overflow: 'auto' }}
    />
  )
}
