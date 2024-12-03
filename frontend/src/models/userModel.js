import store from '@/store'
import axios from '@/plugins/axios'

const exportObject = {
    isLogin: () => {
        const accessToken = localStorage.getItem('accessToken');
        return !!(accessToken && accessToken !== 'undefined');
    },
    requestLogin: async(payload) => {
        return await axios
            .post('/users/authorize', {
                loginId: payload.loginId,
                loginPass: payload.loginPass,
            })
            .then(async(res) => {
                await exportObject.processLogin(res.data);
            });
    },
    processLogin: async(result) => {
        if (result?.accessToken && result?.refreshToken) {
            localStorage.setItem('accessToken', result?.accessToken);
            localStorage.setItem('refreshToken', result?.refreshToken);

            store.commit('authorize/setLogin', true);

            await exportObject.requestMyInfo();
        }
        else {
            store.commit('authorize/setLogin', false);

            store.commit('authorize/setUserInfo', null);

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            alert('사용자 로그인에 실패하였습니다.');
        }
    },
    requestMyInfo: async() => {
        return await axios.get('/users').then(res => {
            store.commit('authorize/setUserInfo', res.data);
        });
    },
    processLogOut: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        store.commit('authorize/setLogin', false);
        store.commit('authorize/setUserInfo', null);
    }
}

export default exportObject;