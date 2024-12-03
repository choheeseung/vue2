import UserModel from "@/models/userModel";

export default {
    namespaced: true,
    state: () => ({
        isLogin: false,
        loginUser: {
            id: 0,
            nickname: '',
            auth: 0
        }
    }),
    mutations: {
        setLogin(state) {
            state.isLogin = UserModel.isLogin();
        },
        setUserInfo(state, payload) {
            state.loginUser.id = payload?.id ?? 0;
            state.loginUser.nickname = payload?.nickname ?? '';
            state.loginUser.auth = payload?.auth ?? 0;
        }
    },
    getters: {
        isLogin (state) {
            return state.isLogin;
        },
        loginUser (state) {
            return state.loginUser;
        }
    }
}