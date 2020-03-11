import * as React from 'react';
import AsyncAutoComplete, {AsyncAutoCompleteComponent} from "../../../components/AsyncAutoComplete";
import {FormControl, FormHelperText, Grid, FormControlProps, Typography, Theme} from "@material-ui/core";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import useHttpHandled from "../../../hooks/useHttpHandle";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {Genre} from "../../../util/models";
import categoryHttp from "../../../util/http/category-http";
import {getGenresFromCategory} from "../../../util/models-filters";
import {makeStyles} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";
import {RefAttributes} from "react";
import {CastMemberFieldComponent} from "./CastMemberField";
import {useRef} from "react";
import {MutableRefObject} from "react";
import {useImperativeHandle} from "react";

const useStyles = makeStyles((theme: Theme) => ({
    genresSubtitle: {
        color: grey["800"],
        fontSize: '0,8rem'
    }
}));




interface CategoryFieldProps extends RefAttributes<CategoryFieldComponent> {

    categories:any[],
    setCategories: (categories) => void,
    genres:Genre[],
    error:any
    disabled?:boolean,
    FormControlProps?:FormControlProps


};

export interface CategoryFieldComponent {
    clear: () => void;

}


const CategoryField = React.forwardRef<CategoryFieldComponent,CategoryFieldProps>  ( (props, ref) => {

    const classes = useStyles();

    const autocompleteHttp = useHttpHandled();
    const {categories, setCategories, genres,  error, disabled} = props;
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutoCompleteComponent>

    function fetchOptions(searchText) {

        return autocompleteHttp(

            categoryHttp
                .list({
                    queryParams: {
                        genres: genres.map(genre => genre.id).join(","),
                        all: ""
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
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genres.length
                }}
                TextFieldProps={{
                    label:'Categorias',
                    error: error !== undefined
                }}/>

            <FormControl
                margin={"normal"}
                fullWidth
                error={error != undefined}
                disabled={disabled === true}
                {...props.FormControlProps}

            >

                <GridSelected>
                    {
                        categories.map( (category,key) => {

                            let genresFromCategory = "";

                            if(genres != undefined && genres.length > 0) {
                                let genreses = getGenresFromCategory(genres, category);

                                if(genreses != undefined && genreses.length > 0) {
                                    genresFromCategory = genreses
                                .map(genre => genre.name)
                                        .join(',');
                                }


                            }



                            return (
                            <GridSelectedItem
                                key={key}
                                onDelete={() => removeItem(category)} xs={12}
                            >
                                <Typography noWrap={true}>
                                    {category.name}
                                </Typography>

                                <Typography noWrap={true} className={classes.genresSubtitle}>
                                    Gêneros: {genresFromCategory}
                                </Typography>
                            </GridSelectedItem>

                            )
                       })
                    }
                </GridSelected>

                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }

            </FormControl>

        </>


    );
});

export default CategoryField;