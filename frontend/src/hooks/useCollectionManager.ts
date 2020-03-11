import {useSnackbar} from "notistack";

const useCollectionManager = (collection: any[], setCollettion: (item) => void) => {

    const snackbar = useSnackbar();

    return {
        addItem(item) {

            if (!item || item === "") {
                return;
            }
            const exists = collection.find(i => i.id === item.id);

            if (exists) {
                snackbar.enqueueSnackbar(
                    'Item ja adiconado',
                    {variant: 'info'}
                );

                return;
            }

            collection.unshift(item);
            setCollettion(collection);

        },
        removeItem(item) {

            const index = collection.findIndex(i => i.id === item.id);

            if (index === -1) {
                return;
            }

            collection.splice(index, 1);
            setCollettion(collection)

        }

    }


};

export default useCollectionManager;