// @flow
import * as React from 'react';
import {useEffect, useReducer, useRef, useState} from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../util/models";
import DefaultTable, {makeActionsStyles, MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import {useSnackbar} from "notistack";
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import  { Creators} from "../../store/filter";
import useFilter from "../../hooks/useFilter";
import {useContext} from "react";
import LoadingContext from "../../components/loading/LoadingContext";



const columnsDefinitions:TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '30%',
        options: {
            sort:false,
            filter: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '43%',
        options: {
            filter: false
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            filterOptions: {
                names: ['Sim', 'Nāo']
            },
            customBodyRender(value, tableMeta, updateValue) {

                return value ? <BadgeYes /> : <BadgeNo/>;

            }
        },
        width: '4%'
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
                       to={`/categories/${tableMeta.rowData[0]}/edit`}>

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
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;


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
        debouncedFilterState.order
    ]);



    async function getData() {



        try {

            const {data} = await  categoryHttp.list<ListResponse<Category>>( {
                queryParams: {
                    search: filterManager.cleanSearchText(debouncedFilterState.search),
                    page:debouncedFilterState.pagination.page,
                    per_page:debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                }
            });

            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);

            }


        } catch (error) {
            console.log(error);

            if(categoryHttp.isCancelledRequest(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                'Nāo foi possível carregar as informaçoes',
                {variant: 'error'}
            );

        }


    }

    return (
        <MuiThemeProvider theme={makeActionsStyles(columnsDefinitions.length -1)}>
            <DefaultTable
            title="Listagem de categorias"
            columns={columns}
            data={data}
            loading={loading}
            debounceSearchTime={debouncedSearchTime}
            ref={tableRef}
            options={{
                //serverSideFilterList: [[], ['teste'], ['teste'], [], []],
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
            }}
            />
        </MuiThemeProvider>
    );
};

export default Table;