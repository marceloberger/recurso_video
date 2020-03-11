import * as React from 'react';
import {

    FormControl, FormControlLabel, FormHelperText,
    FormLabel,
     Radio,
    RadioGroup,
    TextField,

} from "@material-ui/core";

import useForm from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import {useEffect} from "react";
import * as yup from "../../util/vendor/yup";
import {useSnackbar} from "notistack";
import {useHistory, useParams} from "react-router";
import {useState} from "react";
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
    type: yup.number()
        .label('Tipo')
        .required(),

});


export const Form = () => {

    const {register, getValues, handleSubmit, setValue, errors, reset, watch, triggerValidation} = useForm({
        validationSchema
    });


    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [castMember, setCastMember] = useState<{id:string} | null>(null);
    const loading = useContext(LoadingContext);



    useEffect( () => {

        if(!id) {
            return;
        }

        async  function getCastMember() {


            try {
                const {data} = await  castMemberHttp.get(id);
                setCastMember(data.data);
                reset(data.data);

            } catch (error) {

                console.log(error);
                snackbar.enqueueSnackbar(
                    'Nāo foi possível carregar as informaçoes',
                    {variant: 'error'}
                );

            }

        }

        getCastMember();

    }, []);

    useEffect( () => {
        register(
            {name: "type"}
            )

    }, [register]);

    async function onSubmit(formData, event) {

        try {
            const http = !castMember
                ?   castMemberHttp.create(formData)
                :   castMemberHttp.update(castMember.id, formData);

            const {data} = await http;

            snackbar.enqueueSnackbar(
                'Membro de elenco salva com sucesso',
                {
                    variant: 'success'
                });

            setTimeout( () => {
                event
                    ? (
                        id
                            ? history.replace(`/cast-members/${data.data.id}/edit`)
                            : history.push(`/cast-members/${data.data.id}/edit`)

                    )
                    : history.push('/cast-members')
            });


        } catch (error) {

            console.log(error);
            snackbar.enqueueSnackbar(
                'Nāo foi possível salvar o Membro de elenco',
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

            <FormControl
                margin={"normal"}
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component={"legend"}>Tipo</FormLabel>
                <RadioGroup
                  name={"type"}
                   onChange={ (e) => {
                       setValue( 'type', parseInt(e.target.value));
                   }}
                  value={watch('type') + ""}

                >
                    <FormControlLabel value="1" control={<Radio color={"primary"}/>} label="Diretor"/>
                    <FormControlLabel value="2" control={<Radio color={"primary"}/>} label="Ator"/>

                </RadioGroup>
                {
                    errors.type &&  <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>

                }
            </FormControl>

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