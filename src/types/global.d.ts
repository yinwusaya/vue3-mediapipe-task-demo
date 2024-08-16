import type { Ref } from 'vue'
import type { VNodeChild } from 'vue'

declare global {
  interface Window {
    mainApi: any
    RPC: any
    BrowserType: Fn
    _getSession: Fn
    setCookie: Fn
    pubsub: any
    ajax: any
  }
  type Recordable<T = any> = Record<string, T>

  interface Fn<T = any, R = T> {
    (...arg: T[]): R
  }

  interface RenderFn {
    (data: Recordable): VueNode
  }

  type VueNode = VNodeChild | JSX.Element

  type ReactiveProps<T> = {
    [P in keyof T]: Ref<T[P]> | T[P];
  }

  interface EnumItem {
    name: any
    key: any
  }
  interface ResponseBody<T = any> {
    data?: T
    code: number
    traceId: string
    msg: string
  }

  interface PageData<T> {
    list: Array<T>
    total: number
  }
  /**
   * 表单操作类型
   * 用于添加、修改、查看
   */
  type FormOperationMode = 'add' | 'edit' | 'view'
}

export {}
