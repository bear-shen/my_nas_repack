import BaseModel from "./BaseModel";


class AuthModel extends BaseModel<AuthCol> {
    table = 'auth';
}

export default AuthModel;