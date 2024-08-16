<script setup>
import { notification } from 'ant-design-vue'

const formState = reactive({
  username: '',
  password: '',
})
function handleLogin() {
  http.post({
    url: `/user/login`,
    data: {
      ...formState,
    },
  }).then((res) => {
    notification.success({
      message: '登录成功',
      description: res.data,
      duration: 0,
    })
  }).catch((error) => {
    notification.error({
      message: '登录失败',
      description: error.msg,
      duration: 0,
    })
  })
}
</script>

<template>
  <div class="bg-color" h-100vh w-100vw flex items-center justify-center>
    <div rd-2 bg-white flex="~ items-center justify-around" pa-28 class="<lg:w-160">
      <!-- <div class="<lg:hidden">
        <img h-full w-full src="">
      </div> -->
      <!-- <div class="h-full w-1px bg-[#cacbcd] <lg:hidden" /k -->
      <div flex="~ col justify-between" h-full>
        <div mb-8 text-8 color-black font-medium>
          Welcome!
        </div>
        <AForm :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off">
          <AFormItem label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
            <a-input v-model:value="formState.username" class="w-200px" />
          </AFormItem>

          <AFormItem label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model:value="formState.password" class="w-200px" />
          </AFormItem>
          <!-- <AFormItem :wrapper-col="{ offset: 8, span: 16 }">
            <a-button type="primary" html-type="submit">
              登录
            </a-button>
          </AFormItem> -->
        </AForm>

        <div size="large" class="button-shadow h-32px flex items-center justify-center btn" @click="handleLogin">
          登录
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-color {
  background: linear-gradient(90deg, #43aaf0 0%, #6c82fd 100%);
}

.input-wrapper {
  min-width: 20.88rem;
  /* height: 3rem; */
  /* background: #ffffff; */
  box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.1);
  border-radius: 6px 6px 6px 6px;
}

.button-shadow {
  box-shadow: 0rem 0rem 0.5rem 0.06rem rgba(0, 0, 0, 0.16);
}
</style>
