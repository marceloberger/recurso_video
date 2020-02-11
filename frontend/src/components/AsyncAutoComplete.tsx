// @flow
import * as React from 'react';

import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {CircularProgress, TextField, TextFieldProps} from "@material-ui/core";
import {useState} from "react";
import {useEffect} from "react";
import castMemberHttp from "../util/http/cast-member-http";
import {useSnackbar} from "notistack";

interface AsyncAutoCompleteProps  {
    fetchOptions: (searchText) => Promise<any>
    TextFieldProps?:TextFieldProps
    AutocompleteProps?:Omit<AutocompleteProps<any>, 'renderInput'>

};
const AsyncAutoComplete: React.FC<AsyncAutoCompleteProps> = (props) => {
    const {AutocompleteProps} = props;

    const {freeSolo, onOpen, onClose, onInputChange} = AutocompleteProps as any;

    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const snackbar = useSnackbar();

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink:true},
        ...(props.TextFieldProps && {...props.TextFieldProps})

    };

    const autocompleteProps:AutocompleteProps<any> = {
        loadingText: 'Carregando ...',
        noOptionsText: 'Nenhum item encontrado',
        ...(AutocompleteProps && {...AutocompleteProps}),
        open,
        options,
        loading: loading,
        onOpen() {
           setOpen(true);
           onOpen && onOpen();
        },
        onClose() {
            setOpen(false);
            onClose && onClose();
        },
        onInputChange(event, value) {
            setSearchText(value);
            onInputChange && onInputChange();
        },
        renderInput: params => (
            <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                         <>
                             {loading && <CircularProgress color={"inherit"} size={20}/>}
                             {params.InputProps.endAdornment}
                         </>

                    )
                }}
            />
        )
    };

    useEffect(() => {

        if(!open  && !freeSolo) {
            setOptions([])
        }
    }, [open]);

    useEffect( () => {

        if(!open || searchText === "" && freeSolo) {
            return
        }

       let isSubscribed = true;

        (async  () => {

            setLoading(true);

            try {
                const data = await props.fetchOptions(searchText);
                if(isSubscribed) {
                    setOptions(data);
                }

            } catch (error) {

                console.log(error);
                snackbar.enqueueSnackbar(
                    'Nāo foi possível carregar as informaçoes',
                    {variant: 'error'}
                );

            } finally {
                setLoading(false)
            }

        })();

       return () => {
           isSubscribed = false;
       }

    }, [freeSolo ? searchText: open]);

    return (
       <Autocomplete {...autocompleteProps}/>
    );
};

export default AsyncAutoComplete;