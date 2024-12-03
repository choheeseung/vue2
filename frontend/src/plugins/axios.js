import Vue from 'vue'
import $axios from 'axios'
import store from "@/store";
import userModel from "@/models/userModel";

class AxiosExtend {
    instance = null;
    isAlreadyFetchingAccessToken = false;

    subscribers = [];
    constructor() {
        this.instance = $axios.create({
            baseURL: process.env.NODE_ENV === 'production'
                ? '릴리즈 서버 REST API URI'
                : 'http://127.0.0.1:3000',
            timeout: 10000,
            withCredentials: true
        })

        this.instance.interceptors.request.use(
            config => {
                const accessToken = localStorage.getItem('accessToken');
                if (accessToken)
                    config.headers.Authorization = `Bearer ${accessToken}`;
                return config
            },
            error => Promise.reject(error)
        )

        this.instance.interceptors.response.use(
            response => {
                return response;
            },
            async error => {
                const { config } = error;
                const originalRequest = config;

                if (error.response?.status === 401) {
                    if (!this.isAlreadyFetchingAccessToken) {
                        this.isAlreadyFetchingAccessToken = true;
                        await this.instance.post('/users/authorize/token', {
                            refreshToken: localStorage.getItem('refreshToken')
                        }).then(r => {
                            this.isAlreadyFetchingAccessToken = false;

                            localStorage.setItem('refreshToken', r.data.refreshToken);
                            localStorage.setItem('accessToken', r.data.accessToken);

                            store.commit('authorize/setLogin', true);
                            this.subscribers = this.subscribers.filter(callback => callback(r.data.accessToken));
                        });
                    } else {
                        window.localStorage.removeItem('accessToken');
                        window.localStorage.removeItem('refreshToken');
                        originalRequest.headers.Authorization = null;

                        store.commit('authorize/setLogin', false);
                        store.commit('authorize/setUserInfo', null);
                    }

                    const retryOriginalRequest = new Promise(resolve => {
                        this.subscribers.push(accessToken => {
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            resolve(this.instance(originalRequest));
                        });
                    });

                    if (userModel.isLogin())
                        await userModel.requestMyInfo();

                    return retryOriginalRequest;
                }
                else {
                    let message;

                    if (error.response?.data?.error) {
                        message = error.response.data.error;
                    } else {
                        switch (error.response?.status) {
                            case 0:
                                message = "REST API 서버에 접근할 수 없습니다\n서버 관리자에게 문의하세요";
                                break;
                            case 400:
                                message = "잘못된 요청입니다.";
                                break;
                            case 404:
                                message = '[404] REST API 요청에 실패하였습니다.';
                                break;
                            case 500:
                                message = '서버에서 처리중 오류가 발생하였습니다.';
                                break;
                            default:
                                message = "잘못된 요청입니다.";
                                break;
                        }
                    }
                    alert(message);
                    return Promise.reject(error);
                }
            }
        )
    }
}

const axios = new AxiosExtend();
Vue.prototype.$axios = axios.instance;
export default axios.instance;