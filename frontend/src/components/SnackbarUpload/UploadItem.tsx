// @flow 
import * as React from 'react';
import {Divider, IconButton, ListItem, ListItemIcon, ListItemText, Theme, Tooltip, Typography} from "@material-ui/core";
import MovieIcon from '@material-ui/icons/Movie';
import {makeStyles} from "@material-ui/core/styles";
import UploadProgress from "../UploadProgress";
import UploadAction from "./UploadAction";

const useStyles = makeStyles((theme: Theme) => ({

    movieIcon: {
        color: theme.palette.error.main,
        minWidth: '40px',
    },
    listItem : {
        paddingTop: '7px',
        paddingBottom: '7px',
        height: '53px'
    },
    listItemText: {
        marginLeft: '6px',
        marginRight: '24px',
        color: theme.palette.text.secondary,
    }



}));

interface UploadItemProps  {};


const UploadItem:React.FC<UploadItemProps> = (props) => {
    const classes =useStyles();
    return (
        <>

            <Tooltip
                title={"Nāo foi possível fazer o upload, clique para mais detalhes"}
                placement={"left"}
            >
                <ListItem
                    className={classes.listItem}
                    button
                >
                    <ListItemIcon  className={classes.movieIcon} >
                        <MovieIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap={true} variant="subtitle2"  color={"inherit"}>
                                E o vento levou !!!

                            </Typography>
                        }

                    >

                    </ListItemText>

                    <UploadAction/>

                    {/*<UploadProgress size={30}/>*/}
                </ListItem>
            </Tooltip>
            <Divider component="li" />

        </>
    );
};

export default UploadItem;