// @flow
import * as React from 'react';
import {FormControlProps} from "@material-ui/core/FormControl";
import {Button, FormControl, } from "@material-ui/core";

import CloudUploadIcon from "@material-ui/core/SvgIcon/SvgIcon";
import InputFile, {InputFileComponent} from "../../../components/InputFile";
import {MutableRefObject, useRef} from "react";

interface UploadFieldProps {
    accept:string;
    label:string;
    setValue: (value) => void;
    disabled?: boolean;
    error?: any;
    FormControlProps?:FormControlProps

};
export const UploadField:React.FC<UploadFieldProps> = (props) => {

    const fileRef = useRef() as MutableRefObject<InputFileComponent>;

    const {accept, label, setValue, disabled, error } = props;
    return (
        <FormControl
            error={error !== undefined}
            disabled={disabled === true}
            fullWidth
            margin={"normal"}
            {...props.FormControlProps}
        >

            <InputFile
                ref={fileRef}
                TextFieldProps={{
                    label:label,
                    InputLabelProps: {shrink:true},
                    style: {backgroundColor: '#ffffff'}
                }}

                InputFileProps={{
                    accept,
                    onChange(event) {
                        const files = event.target.files as any;
                        files.length && setValue(files[0])
                    }
                }}

                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon />}
                        variant={"contained"}
                        color={"primary"}
                        onClick={ () => fileRef.current.openWindow()}
                    >
                        Adicionar
                    </Button>

                }
            />

        </FormControl>
    );
};