import * as React from 'react';
import AsyncAutoComplete, {AsyncAutoCompleteComponent} from "../../../components/AsyncAutoComplete";
import {FormControl, FormHelperText, Grid, FormControlProps, Typography} from "@material-ui/core";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useHttpHandled from "../../../hooks/useHttpHandle";
import useCollectionManager from "../../../hooks/useCollectionManager";
import castMemberHttp from "../../../util/http/cast-member-http";
import {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from "react";



interface CastMemberFieldProps extends RefAttributes<CastMemberFieldComponent> {
    castMembers:any[],
    setCastMembers: (castMembers) => void,
    error:any
    disabled?:boolean,
    FormControlProps?:FormControlProps
};

export interface CastMemberFieldComponent {
    clear: () => void;

}
const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>( (props, ref) => {

    const {
        castMembers,
        setCastMembers,
        error,
        disabled
        } = props;

    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(castMembers, setCastMembers);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutoCompleteComponent>


    function fetchOptions(searchText) {

        return autocompleteHttp(

            castMemberHttp
                .list({
                    queryParams: {
                        search: searchText,  all: ""
                    }
                })

        ).then(data => data.data)
    }


     useImperativeHandle( ref, () => ({
         clear: () => autocompleteRef.current.clear()

     }));

    return (
        <>
            <AsyncAutoComplete
                ref={autocompleteRef}
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    //autoSelect:true,
                    clearOnEscape:true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled
                }}
                TextFieldProps={{
                    label:'Elenco',
                    error: error !== undefined
                }}
            />

            <FormControl
                margin={"normal"}
                fullWidth
                error={error != undefined}
                disabled={disabled === true}
                {...props.FormControlProps}

            >

                <GridSelected>
                    {
                        castMembers.map( (castMember,key) => (
                            <GridSelectedItem
                                key={key}
                                onDelete={() => removeItem(castMember)}
                                xs={6}
                            >
                                <Typography noWrap={true}>
                                    {castMember.name}
                                </Typography>
                            </GridSelectedItem>

                        ))
                    }
                </GridSelected>

                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }

            </FormControl>

        </>


    );
});

export default CastMemberField;