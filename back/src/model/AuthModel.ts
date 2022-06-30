import BaseModel from "./BaseModel";
import {AuthCol} from "../columns";


class AuthModel extends BaseModel<AuthCol> {
    table = 'auth';
}

export default AuthModel;