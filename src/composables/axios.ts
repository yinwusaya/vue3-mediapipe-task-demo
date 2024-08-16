import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { cloneDeep } from 'lodash-es'
import qs from 'qs'

// Used to store the identification and cancellation function of each request
let pendingMap = new Map<string, Canceler>()

export const getPendingUrl = (config: AxiosRequestConfig) => [config.method, config.url].join('&')

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string
  transform?: AxiosTransform
  requestOptions?: RequestOptions
}

export abstract class AxiosTransform {
  /**
   * @description: Process configuration before request
   * @description: Process configuration before request
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig

  /**
   * @description: Request successfully processed
   */
  transformRequestHook?: (res: AxiosResponse<any>, options: RequestOptions) => any

  /**
   * @description: 请求失败处理
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>

  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (config: InternalAxiosRequestConfig, options: CreateAxiosOptions) => InternalAxiosRequestConfig

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error: Error) => void
}

export class AxiosCanceler {
  /**
   * Add request
   * @param {object} config
   */
  addPending(config: AxiosRequestConfig) {
    this.removePending(config)
    const url = getPendingUrl(config)
    config.cancelToken
        = config.cancelToken
        || new axios.CancelToken((cancel) => {
          if (!pendingMap.has(url)) {
            // If there is no current request in pending, add it
            pendingMap.set(url, cancel)
          }
        })
  }

  /**
   * @description: Clear all pending
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel()
    })
    pendingMap.clear()
  }

  /**
   * Removal request
   * @param {object} config
   */
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config)

    if (pendingMap.has(url)) {
      // If there is a current request identifier in pending,
      // the current request needs to be cancelled and removed
      const cancel = pendingMap.get(url)
      cancel && cancel(url)
      pendingMap.delete(url)
    }
  }

  /**
   * @description: reset
   */
  reset(): void {
    pendingMap = new Map<string, Canceler>()
  }
}

export class AxiosClient implements HttpClient {
  private axiosInstance: AxiosInstance

  private readonly options: CreateAxiosOptions

  constructor(options: CreateAxiosOptions) {
    this.options = options
    this.axiosInstance = axios.create(options)
    this.setupInterceptors()
  }

  /**
   * @description:  Create axios instance
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config)
  }

  private getTransform() {
    const { transform } = this.options
    return transform
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance
  }

  /**
   * @description: Reconfigure axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance)
      return

    this.createAxios(config)
  }

  /**
   * @description: Set general header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance)
      return

    Object.assign(this.axiosInstance.defaults.headers, headers)
  }

  /**
   * @description: Interceptor configuration
   */
  private setupInterceptors() {
    const transform = this.getTransform()
    if (!transform)
      return

    const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } = transform

    const axiosCanceler = new AxiosCanceler()

    // 请求侦听器配置处理
    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      // @ts-expect-error
      // const { ignoreCancelToken } = config.requestOptions
      //
      // const ignoreCancel = ignoreCancelToken !== undefined ? ignoreCancelToken : this.options.requestOptions?.ignoreCancelToken
      //
      // !ignoreCancel && axiosCanceler.addPending(config)
      if (requestInterceptors && isFunction(requestInterceptors))
        config = requestInterceptors(config, this.options)

      return config
    }, undefined)

    // 请求拦截器错误捕获
    requestInterceptorsCatch
    && isFunction(requestInterceptorsCatch)
    && this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch)

    // 响应结果拦截器处理
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      res && axiosCanceler.removePending(res.config)
      if (responseInterceptors && isFunction(responseInterceptors))
        res = responseInterceptors(res)

      return res
    }, undefined)

    // 响应结果拦截器错误捕获
    responseInterceptorsCatch
    && isFunction(responseInterceptorsCatch)
    && this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch)
  }

  // 支持表单数据
  private supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers

    const contentType = headers?.['Content-Type'] || headers?.['content-type']

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED
      || !Reflect.has(config, 'data')
      || config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    }
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({
      ...config,
      method: RequestEnum.GET,
    }, options)
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({
      ...config,
      method: RequestEnum.POST,
    }, options)
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({
      ...config,
      method: RequestEnum.PUT,
    }, options)
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({
      ...config,
      method: RequestEnum.DELETE,
    }, options)
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    let conf: CreateAxiosOptions = cloneDeep(config)

    const transform = this.getTransform()

    const { requestOptions } = this.options

    const opt: RequestOptions = Object.assign({}, requestOptions, options)

    const { beforeRequestHook } = transform || {}

    if (beforeRequestHook && isFunction(beforeRequestHook))
      conf = beforeRequestHook(conf, opt)

    conf.requestOptions = opt

    conf = this.supportFormData(conf)
    // return useRequest(() => new Promise<ResponseBody<T>>((resolve, reject) => {
    //   this.axiosInstance.request(conf)
    //     .then((res) => {
    //       const data = res.data
    //       if (data.code !== 0)
    //         reject(data)

    //       resolve(res.data)
    //     })
    // }), {
    //   loadingDelay: 400,
    //   loadingKeep: 1000,
    // })
    return new Promise<ResponseBody<T>>((resolve, reject) => {
      this.axiosInstance.request(conf)
        .then((res) => {
          if (conf.requestOptions?.rawData)
            resolve(res)

          const data = res.data
          if (data.code !== 200) {
            reject(data)
          }

          resolve(res.data)
        })
    })
  }
}
