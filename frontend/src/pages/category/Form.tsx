// @flow
import * as React from 'react';
import {Checkbox, FormControlLabel, Grid, TextField} from "@material-ui/core";
import useForm from "react-hook-form";
import categoryHttp from "../../util/http/category-http";
import * as yup from '../../util/vendor/yup';
import {useParams, useHistory} from "react-router";
import {useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {Category} from "../../util/models";
import SubmitActions from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";
import {useContext} from "react";
import LoadingContext from "../../components/loading/LoadingContext";




const validationSchema = yup.object().shape( {
    name: yup
        .string()
        .label('Nome')
        .required()
        .max(255),

});


export const Form = () => {
    const {register, getValues, setValue, handleSubmit, errors, reset, watch, triggerValidation} = useForm({
        validationSchema,
        defaultValues: {
            is_active : true
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const loading = useContext(LoadingContext);




    useEffect( () => {
        register({name: "is_active"})

    },[register]);


    useEffect( () => {

        if(!id) {
            return;
        }

        async  function getCategory() {


            try {
                const {data} = await  categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);

            } catch (error) {

                console.log(error);
                snackbar.enqueueSnackbar(
                    'Nāo foi possível carregar as informaçoes',
                    {variant: 'error'}
                    );

            }

        }

         getCategory();

    }, []);

    async function onSubmit(formData, event) {

        try {
            const http = !category
                ?  categoryHttp.create(formData)
                :  categoryHttp.update(category.id, formData);

            const {data} = await http;

            snackbar.enqueueSnackbar(
                'Categoria salva com sucesso',
                {
                    variant: 'success'
                });

            setTimeout( () => {
                event
                    ? (
                        id
                            ? history.replace(`/categories/${data.data.id}/edit`)
                            : history.push(`/categories/${data.data.id}/edit`)

                    )
                    : history.push('/categories')
            });


        } catch (error) {

            console.log(error);
            snackbar.enqueueSnackbar(
                'Nāo foi possível salvar a categoria',
                {variant: 'error'}
            );

        }


}



    return (
        <DefaultForm GridItemProps={{xs:12, md:6}} onSubmit={handleSubmit(onSubmit)}>

                <TextField
                name={"name"}
                label={"Nome"}
                fullWidth
                variant={"outlined"}
                inputRef={register}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink:true}}
                />


                <TextField
                    name={"description"}
                    label={"Descrição"}
                    fullWidth
                    variant={"outlined"}
                    margin={"normal"}
                    inputRef={register}
                    disabled={loading}
                    InputLabelProps={{shrink:true}}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                        name={"is_active"}
                        color={"primary"}
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={watch('is_active')}
                    />
                    }
                    label={'Ativo?'}
                    labelPlacement={'end'}
                />


                <SubmitActions disabledButtons={loading}
                               handleSave={() =>
                                   triggerValidation().then( isValid => {
                                       isValid &&  onSubmit(getValues(), null)
                                   })
                               }
                />

        </DefaultForm>
    );
};