// @flow
import * as React from 'react';
import {FormControlProps} from "@material-ui/core/FormControl";
import {Button, FormControl, } from "@material-ui/core";

import CloudUploadIcon from "@material-ui/core/SvgIcon/SvgIcon";
import InputFile, {InputFileComponent} from "../../../components/InputFile";
import {MutableRefObject, useImperativeHandle, useRef} from "react";
import {RefAttributes} from "react";

interface UploadFieldProps extends RefAttributes<UploadFieldComponent>{
    accept:string;
    label:string;
    setValue: (value) => void;
    disabled?: boolean;
    error?: any;
    FormControlProps?:FormControlProps

};

export interface UploadFieldComponent {
    clear: () => void;
}

export const UploadField =  React.forwardRef< UploadFieldComponent, UploadFieldProps> ( (props, ref) => {

    const fileRef = useRef() as MutableRefObject<InputFileComponent>;

    const {accept, label, setValue, disabled, error } = props;

    useImperativeHandle( ref, () => ({
        clear: () => fileRef.current.clear()

    }));


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
});