import { Auth_Error, Load_User, Log_In, Log_Out, Sign_Up } from "../actions/user/types";



const initialState = {
    user: {
        name: "",
        email: "",
        password: "",
        avatar: "",
        ip: ""
    },
    isAuthenticated: false,
    token: localStorage.getItem('token'),
    loading: true,
    errors: {}
}

const authReducer = (state: any = initialState, action: any) => {
    const { type, payload } = action;

    switch(type) {
        case Load_User:
            return { ...state, user: payload, isAuthenticated: true, loading: false }

        case Log_In:
        case Sign_Up:
            localStorage.setItem('token', payload.token)
            return { ...state, user: payload.user, ...payload, isAuthenticated: true, loading: false }
        
        case Auth_Error:
        case Log_Out:
            localStorage.removeItem('token')
            return { ...state, user: null, token: null, isAuthenticated: false, loading: false }
        
        default:
            return state;
    }


}
export default authReducer;