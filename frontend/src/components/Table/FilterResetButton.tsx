// @flow
import * as React from 'react';
import {IconButton, makeStyles, Tooltip} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll';

const useStyles = makeStyles( theme => ({
    iconButton: (theme as any).overrides.MUIDataTableToolbar.icon
}));

type FilterResetButtonProps = {
    handleClick: () => void

};
export const FilterResetButton:React.FC<FilterResetButtonProps> = (props) => {

    // @ts-ignore
    const classes = useStyles();
    return (

        <Tooltip title={'Limpar busca'}>
            <IconButton className={classes.iconButton} onClick={props.handleClick}>
                <ClearAllIcon/>

            </IconButton>


        </Tooltip>


    );
};