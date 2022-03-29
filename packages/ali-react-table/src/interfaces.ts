import React, { ReactNode } from 'react'

export type ArtColumnAlign = 'left' | 'center' | 'right'

export type CellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export interface ArtColumnStaticPart {
  /** 列的名称 */
  name: string

  /** 在数据中的字段 code */
  code?: string

  /** 列标题的展示名称；在页面中进行展示时，该字段将覆盖 name 字段 */
  title?: ReactNode

  /** 列的宽度，如果该列是锁定的，则宽度为必传项 */
  width?: number

  /** 单元格中的文本或内容的 对其方向 */
  align?: ArtColumnAlign

  /** @deprecated 是否隐藏 */
  hidden?: boolean

  /** 是否锁列 */
  lock?: boolean

  /** 表头单元格的 props */
  headerCellProps?: CellProps

  /** 功能开关 */
  features?: { [key: string]: any }

  /** 可编辑单元格元数据 */
  editable?: EditableOpts
}

export interface ArtColumnDynamicPart {
  /** 自定义取数方法 */
  getValue?(row: any, rowIndex: number): any

  /** 自定义渲染方法 */
  render?(value: any, row: any, rowIndex: number): ReactNode

  /** 自定义的获取单元格 props 的方法 */
  getCellProps?(value: any, row: any, rowIndex: number): CellProps

  /** 自定义的获取单元格 SpanRect 方法 */
  getSpanRect?(value: any, row: any, rowIndex: number): SpanRect
}

export interface ArtColumn extends ArtColumnStaticPart, ArtColumnDynamicPart {
  /** 该列的子节点 */
  children?: ArtColumn[]
}

/** 可编辑单元格相关属性 */
export interface EditableOpts {
  // 编辑类型，用于呈现不同控件
  type: string
  // 选项列表，用于下拉框option展示
  options?: any
  // 多行编辑
  multiline?: boolean
  // 日期格式
  format?: string
  // 提示话术，用于提示校验不通过
  tip?: string
  // 校验器
  validate?: Function | RegExp | any
}

/** SpanRect 用于描述合并单元格的边界
 * 注意 top/left 为 inclusive，而 bottom/right 为 exclusive */
export interface SpanRect {
  top: number
  bottom: number
  left: number
  right: number
}

export interface AbstractTreeNode {
  children?: AbstractTreeNode[]
}

export type SortOrder = 'desc' | 'asc' | 'none'

export type SortItem = { code: string; order: SortOrder }

export type Transform<T> = (input: T) => T

/** @deprecated transform */
export type TableTransform = Transform<{
  columns: ArtColumn[]
  dataSource: any[]
}>

export interface HoverRange {
  start: number
  end: number
}
