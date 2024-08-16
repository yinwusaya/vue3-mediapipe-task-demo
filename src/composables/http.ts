import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
// import { useCookies } from '@vueuse/integrations/useCookies'
import type { AxiosTransform, CreateAxiosOptions } from './axios'
import { AxiosClient } from './axios'

const defAxiosTransform: AxiosTransform = {

  requestInterceptors(config: InternalAxiosRequestConfig, options: CreateAxiosOptions): InternalAxiosRequestConfig {
    // if (useCookies(['locale']).get('token')) { config.headers.Authorization = useCookies(['locale']).get('token') }

    return config
  },

  responseInterceptors(res: AxiosResponse<any>): AxiosResponse<any> {
    // XHN-TODO: 拦截器，可以不写
    const data = res.data
    // if (ErrorCode.TOKEN_INVALID === data.code) {
    //   router.replace({ name: 'Login' })
    // }
    // // 拦截2： 弹出弹窗
    // else if (data.code !== 0 && data.msg) {
    //   usePopupMessage().popupMessage(data.msg, 'MESSAGE', 'ERROR')
    // }
    return res
  },
}

const defCreateAxiosOptions: CreateAxiosOptions = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10 * 1000,
  transform: defAxiosTransform,
}
export const http: AxiosClient = new AxiosClient(defCreateAxiosOptions)
