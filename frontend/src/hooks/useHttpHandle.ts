import {useSnackbar} from "notistack";
import axios from 'axios';


const useHttpHandled = () => {
    const snackbar = useSnackbar();
    return async (request: Promise<any>) => {
        try {
            const {data} = await  request;
            return data;

        } catch (error) {
            console.log(error);
            if(!axios.isCancel(error)) {
                snackbar.enqueueSnackbar(
                    'Nāo foi possível carregar as informaçoes',
                    {variant: 'error'}
                );
                throw error;

        }


        }
    }

};

export default  useHttpHandled;