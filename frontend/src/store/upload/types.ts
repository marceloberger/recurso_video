import {Video} from "../../util/models";
import {AxiosError} from "axios";
import {AnyAction} from "redux";

export interface FileUpload {

    fieldField:string;
    filename:string;
    progress:number;
    error?:AxiosError

}

export interface Upload {
    video:Video;
    progress:number;
    files:FileUpload[];
}

export interface State {

    uploads: Upload[];
}


export interface AddUploadAction extends AnyAction {
    payload: {
        video:Video
        files: Array<{file:File, fileField:string}>

    }

}

export type Actions = AddUploadAction;