import type { AxiosRequestConfig } from 'axios'

declare global {
  type MessageDisplayModeEnum = 'NONE' | 'MESSAGE' | 'NOTIFICATION' | 'LOG'

  type MessageDisplayLevelEnum = 'INFO' | 'WARNING' | 'ERROR'

  interface RequestOptions {
    // 将请求参数拼接到url
    joinParamsToUrl?: boolean
    // 格式化请求参数时间
    formatDate?: boolean
    // 是否处理请求结果
    isTransformResponse?: boolean
    // 是否返回本地响应头,需要获取响应头时使用此属性
    isReturnNativeResponse?: boolean
    // Whether to join url
    joinPrefix?: boolean
    // 接口地址，如果保留为空，则使用默认值
    apiUrl?: string
    // 请求拼接路径
    urlPrefix?: string
    // 错误消息提示类型
    messageDisplayMode?: MessageDisplayModeEnum
    // 成功消息提示类型
    successMessageMode?: MessageDisplayLevelEnum
    // 是否添加时间戳
    joinTime?: boolean
    ignoreCancelToken?: boolean
    // 是否在标头中发送令牌
    withToken?: boolean
    // 返回原始数据
    rawData?: boolean
  }

  interface Result<T = any> {
    message: string
    code: string
    result: T
    success: boolean
    stackTrace: string
    timestamp: number
    messageDisplayMode: MessageDisplayModeEnum
    messageDisplayLevel: MessageDisplayLevelEnum
  }

  interface PageQueryParam {
    pageNo: number
    pageSize: number
  }

  interface Page<T = any> {
    records: T[]
    pageNumber: number
    pageSize: number
    totalPage: number
    totalRow: number
  }

  interface HttpClient {

    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>>

    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>>

    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>>

    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>>

    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>>
  }
}

export {}
