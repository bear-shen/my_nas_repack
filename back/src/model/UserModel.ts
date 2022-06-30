import BaseModel from "./BaseModel";
import {UserCol} from "../columns";

class UserModel extends BaseModel<UserCol> {
    public table = 'user';
}

export default UserModel;