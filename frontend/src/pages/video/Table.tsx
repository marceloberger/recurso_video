import * as React from 'react';

import {useContext, useEffect, useState} from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {ListResponse, Video} from "../../util/models";
import DefaultTable, {makeActionsStyles, MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import {useSnackbar} from "notistack";
import {useRef} from "react";
import useFilter from "../../hooks/useFilter";
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';

import videoHttp from "../../util/http/video-http";
import LoadingContext from "../../components/loading/LoadingContext";
import DeleteDialog from "../../components/DeleteDialog";
import useDeleteCollection from "../../hooks/useDeleteCollection";


const columnsDefinitions:TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '32%',
        options: {
            sort:false,
            filter: false,
        }
    },
    {
        name: "title",
        label: "Titulo",
        width: '20%',
        options: {
            sort:false,
            filter: false,
        }
    },
    {
        name: "genres",
        label: "Gêneros",
        width: '13%',
        options: {
            sort:false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {

                return value.map( (valor) => valor.name).join(', ');

            }
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: '13%',
        options: {
            sort:false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {

                return value.map( (valor) => valor.name).join(', ');

            }
        }
    },

    {
        name: "created_at",
        label: "Criado em",
        width: '10%',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {

                return <span> {
                    format(parseISO(value), 'dd/MM/yyyy')
                } </span>

            }
        }

    },
    {
        name: "actions",
        label: "Ações",
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender:(value, tableMeta, updateValue) => {
                return (
                    <IconButton
                        color={"secondary"}
                        component={Link}
                        to={`/videos/${tableMeta.rowData[0]}/edit`}>

                        <EditIcon/>
                    </IconButton>
                )


            }
        }
    }


];

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15,25,50];


const Table = () => {

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();

    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = useFilter( {
        columns: columnsDefinitions,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef
    });


    useEffect( () => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }

    }, [
        filterManager.cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
    ]);



    async function getData() {



        try {

            const {data} = await  videoHttp.list<ListResponse<Video>>( {
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page:filterState.pagination.page,
                    per_page:filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,

                }
            });



            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);

                if(openDeleteDialog) {
                    setOpenDeleteDialog(false);
                }


            }


        } catch (error) {
            console.log(error);

            if(videoHttp.isCancelledRequest(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                'Nāo foi possível carregar as informaçoes',
                {variant: 'error'}
            );

        }


    }


    function deleteRows(confirmed:boolean) {

        if(!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }

        const ids = rowsToDelete
            .data
            .map( (value) => data[value.index].id)
            .join(',');

        videoHttp
            .deleteCollection({ids})
            .then( (response)  => {

                snackbar.enqueueSnackbar(
                    'Registros excluidos com sucesso',
                    {variant: 'success'}
                );

                if( rowsToDelete.data.length === filterState.pagination.per_page &&
                   filterState.pagination.page > 1) {

                    const page = filterState.pagination.page - 2;

                    filterManager.changePage(page);
                } else {
                    getData();
                }

             })
            .catch( (error) => {
                console.log(error);
                snackbar.enqueueSnackbar(
                    'Nāo foi possível excluir os registros',
                    {variant: 'error'}
                );

            });




    }

    return (
        <MuiThemeProvider theme={makeActionsStyles(columnsDefinitions.length -1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                title="Listagem de videos"
                columns={columns}
                data={data}
                loading={loading}
                debounceSearchTime={debouncedSearchTime}
                ref={tableRef}
                options={{
                    serverSide: true,
                    responsive:'scrollMaxHeight',
                    searchText : filterState.search as any,
                    page:filterState.pagination.page -1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={ () => {
                                filterManager.resetFilter();
                            }}
                        />
                    ),
                    onSearchChange: (value:string) => filterManager.changeSearch(value),
                    onChangePage: (page:number) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage:number) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn:string, direction:string) =>
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted:any[]) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;

                    }
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;