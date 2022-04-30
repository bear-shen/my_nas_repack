import BaseModel from "./BaseModel";
import NodeModel from "./NodeModel";

class TagGroupModel extends BaseModel<TagGroupCol> {
    public table = 'tag_group';
}

export default TagGroupModel;
