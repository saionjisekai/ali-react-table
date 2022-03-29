import React, { HTMLAttributes, useRef, useState } from 'react'
import { TablePipeline } from '../pipeline'
import { ArtColumn, CellProps } from "../../interfaces";
import { internals } from "../../internals";
import { singleSelect } from "./singleSelect";
import cx from 'classnames'
import EditCell, { Classes } from "./cellEditStyles";

interface PayLoad {
  row: any,
  rowIndex: number,
  column: ArtColumn,
  columnIndex: number,
  value: any
}

interface CellEditFeatureOptions {
  onChange?: ({ row, rowIndex, column, columnIndex, value }: PayLoad) => void
}

const STATE_KEY = 'cellEdit'
const SINGLE_SELECT_KEY = 'singleSelect'

/**
 * 单元格编辑功能拓展
 * @param opts
 */
export function cellEdit (opts: CellEditFeatureOptions) {

  return function cellEditStep (pipeline: TablePipeline) {
    const { Select, DatePicker, InputNumber } = pipeline.ctx.components
    const primaryKey = pipeline.ensurePrimaryKey(STATE_KEY) as string
    const highlightRowKey = pipeline.getStateAtKey(SINGLE_SELECT_KEY)
    const [highlightCell, setHighlightCell] = useState('')

    pipeline.use(singleSelect({
      clickArea: 'row',
      highlightRowWhenSelected: true,
      radioColumn: { hidden: true }
    }))

    pipeline.getColumns().forEach((column: ArtColumn, columnIndex) => {
      const { editable } = column
      if (!editable) return
      const { type, validate, tip, multiline } = editable
      const ref = useRef(null)

      /**
       * 输入框 & 文本域
       */
      if (type === 'input') {
        column.getCellProps = (value: any, row: any, rowIndex: number): CellProps => {
          return {
            style: { padding: 0, outline: 0 }
          }
        }
        column.render = (value: any, row: any, rowIndex: number) => {
          const props: HTMLAttributes<HTMLElement> = {
            className: 'art-cell-input',
            onInput (e) {
              checkValue(e, validate)
            },
            onFocus (e) {
              pipeline.setStateAtKey(SINGLE_SELECT_KEY, row.id)
              hideSpecialComponent()
            },
            onBlur (e) {
              const { pass, value } = checkValue(e, validate)
              if (!pass) return
              onChange({ row, rowIndex, column, columnIndex, value })
            },
            onKeyPress (e) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }
          }
          const highlight = highlightRowKey === internals.safeGetRowKey(primaryKey, row, rowIndex)
          return (
            <EditCell
              className={cx(highlight && 'highlight')}
              data-tip={tip}
            >
              {
                multiline
                  ? <div {...props}>{value}</div>
                  : <input {...props} defaultValue={value} />
              }
            </EditCell>
          )
        }
      }

      /**
       * 下拉框
       */
      else if (type === 'select') {
        if (!Select) throw new Error('可编辑列 select 需要通过 pipeline context 设置 components.Select')
        const { options } = editable
        column.getCellProps = getCellProps
        column.render = (value: any, row: any, rowIndex: number) => {
          const editing = `${rowIndex}-${columnIndex}` === highlightCell
          return (
            editing ? (
              <Select
                ref={ref}
                defaultValue={value}
                onClick={(e: Event) => e.stopPropagation()}
                onDropdownVisibleChange={resetAfterComponentClose}
                onChange={(value: any) => {
                  onChange({ row, rowIndex, column, columnIndex, value })
                }}
              >
                {
                  options.map((option: any, index: number) => (
                    <Select.Option key={index} value={option.value}>{option.label}</Select.Option>
                  ))
                }
              </Select>
            ) : (
              options.find((option: any) => option.value === value)?.label || value
            )
          )
        }
      }

      /**
       * 日期选择器
       */
      else if (type === 'date') {
        if (!DatePicker) throw new Error('可编辑列 date 需要通过 pipeline context 设置 components.DatePicker')
        const { format = 'YYYY-MM-DD HH:mm:ss' } = editable
        column.getCellProps = getCellProps
        column.render = (value: any, row: any, rowIndex: number) => {
          const editing = `${rowIndex}-${columnIndex}` === highlightCell
          return (
            editing ? (
              <DatePicker
                ref={ref}
                format={format}
                defaultValue={value}
                onOpenChange={resetAfterComponentClose}
                onBlur={hideSpecialComponent}
                onChange={(value: Date) => {
                  onChange({ row, rowIndex, column, columnIndex, value: value })
                }}
              />
            ) : (
              value.format(format)
            )
          )
        }
      }

      /**
       * 特殊组件交互
       * @param value
       * @param row
       * @param rowIndex
       */
      function getCellProps (value: any, row: any, rowIndex: number): CellProps {
        const isHighlight = highlightRowKey === internals.safeGetRowKey(primaryKey, row, rowIndex)

        function showSpecialComponent () {
          setHighlightCell(`${rowIndex}-${columnIndex}`)
        }

        return {
          style: { outline: 0 },
          tabIndex: isHighlight ? 0 : -1,
          onClick: isHighlight ? showSpecialComponent : hideSpecialComponent,
          onFocus () {
            isHighlight && showSpecialComponent()
            setTimeout(() => ref?.current?.focus())
          },
          onKeyUp ({ key }) {
            key === 'Escape' && hideSpecialComponent()
          }
        }
      }

    })

    /**
     * 清除特殊组件的编辑状态
     */
    function hideSpecialComponent () {
      setHighlightCell('')
    }

    /**
     * 特殊组件关闭后自动清除编辑状态
     * @param open
     */
    function resetAfterComponentClose (open: boolean) {
      !open && setTimeout(hideSpecialComponent)
    }

    return pipeline
  }

  /**
   * 校验值并实时反馈校验状态
   * @param e
   * @param validate
   */
  function checkValue (e: any, validate: any): { pass: boolean, value: any } {
    let pass = true
    const value = (e.currentTarget.value || e.currentTarget.innerText || '').trim()
    if (!validate) return { pass, value }
    pass = false;
    if (validate.call) {
      pass = validate.call(null, value)
    } else if (validate.test) {
      pass = validate.test(value)
    }
    e.currentTarget.parentNode.classList[pass ? 'remove' : 'add'](Classes.errorClass)
    return { pass, value }
  }

  /**
   * 检查新旧值是否有变化，有变化则触发回调
   * @param payload
   */
  function onChange (payload: PayLoad) {
    const { row, column, value } = payload
    if (row[column.code] !== value) {
      row[column.code] = value
      opts.onChange?.(payload)
    }
  }

}
