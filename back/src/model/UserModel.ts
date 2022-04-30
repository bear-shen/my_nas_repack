import BaseModel from "./BaseModel";

class UserModel extends BaseModel<UserCol> {
    public table = 'user';
}

export default UserModel;