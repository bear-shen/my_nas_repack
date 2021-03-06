import BaseModel from "./BaseModel";
import NodeModel from "./NodeModel";
import {TagCol} from "../columns";

class TagModel extends BaseModel<TagCol> {
    public table = 'tag';

    _col_get_alt(input: string): string[] {
        if (!input) return [];
        const res = input.split(',');
        return res ? res : [];
    }

    _col_set_alt(input: any): string {
        if (!input) return '';
        return input.join(',');
    }
}

export default TagModel;
