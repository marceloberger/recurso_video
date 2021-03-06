// @flow
import * as React from 'react';
import {Card, CardActions, Collapse, createStyles, IconButton, List, Theme, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import {useSnackbar} from "notistack";
import {makeStyles} from "@material-ui/core/styles";
import {useState} from "react";
import classnames from "classnames";
import UploadItem from "./UploadItem";

const useStyles = makeStyles((theme: Theme) => ({

    card: {
        width: 450,
    },
    CardActionsRoot: {
        padding: '8px, 8px, 8px, 16px',
        backgroundColor: theme.palette.primary.main,
    },
    title: {
        fontWeight: 'bold',
        color: theme.palette.primary.contrastText,
    },
    icons: {
        marginLeft: 'auto !important',
        color: theme.palette.primary.contrastText,
    },
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create( 'transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: 'rotate(180deg)',
        transition: theme.transitions.create( 'transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    list: {
        paddingTop: 0,
        paddingBottom: 0
    }


    }));

interface SnackbarUploadProps  {

    id: string | number;

};
const SnackbarUpload = React.forwardRef<any, SnackbarUploadProps> ((props, ref) => {

    const {id} = props;
    const {closeSnackbar} = useSnackbar();
    const classes = useStyles();
    const [expanded, setExpanded] = useState(true);

    return (
        <Card ref={ref} className={classes.card}>
            <CardActions classes={{root: classes.CardActionsRoot}}>
                <Typography variant="subtitle2" className={classes.title}>
                    Fazendo upload de 10 videos(s)
                </Typography>
                <div className={classes.icons}>
                    <IconButton
                        color={"inherit"}
                        onClick={() => setExpanded(!expanded)}
                        className={classnames(classes.expand, {[classes.expandOpen]: !expanded})}
                    >
                        <ExpandMoreIcon />

                    </IconButton>

                    <IconButton
                        color={"inherit"}
                        onClick={() => closeSnackbar(id)}
                    >
                        <CloseIcon />

                    </IconButton>
                </div>

            </CardActions>
            <Collapse in={expanded}>
                <List className={classes.list}>
                   <UploadItem />
                    <UploadItem />
                </List>
            </Collapse>

        </Card>
    );
});

export default SnackbarUpload;