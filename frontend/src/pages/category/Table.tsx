// @flow
import * as React from 'react';
import  {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useRef, useState} from "react";


import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import categoryHttp from "../../util/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../util/models";
import DefaultTable, {TableColumn} from "../../components/Table";
import {useSnackbar} from "notistack";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import {FilterResetButton} from "../../components/Table/FilterResetButton";

interface Pagination {
    page:number;
    total:number;
    per_page:number;
}

interface Order {

    sort: string | null;
    dir: string | null;
}

interface SearchState {
    search:string;
    pagination:Pagination
    order:Order
}

const columnsDefinitions:TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '30%',
        options: {
            sort:false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: '43%'
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
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


const Table = () => {

    const initialState = {
        search: '',
        pagination: {
            page: 1,
            total: 0,
            per_page:10
        },
        order: {
            sort: null,
            dir: null
        }

    }

    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, setSearchState] = useState<SearchState>(initialState);

    const columns = columnsDefinitions.map( column => {

        return column.name === searchState.order.sort
         ? {
                ...column,
                options: {
                    ...column.options,
                    sortDirection: searchState.order.dir as any
                }

           }
          : column;
    });


    useEffect( () => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }

    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order
    ]);



    async function getData() {

        setLoading(true);

        try {

            const {data} = await  categoryHttp.list<ListResponse<Category>>( {
                queryParams: {
                    search: cleanSearchText(searchState.search),
                    page:searchState.pagination.page,
                    per_page:searchState.pagination.per_page,
                    sort: searchState.order.sort,
                    dir: searchState.order.dir,
                }
            });

            if(subscribed.current) {
                setData(data.data);

                setSearchState( (prevState => ({

                    ...prevState,
                    pagination: {
                        ...prevState.pagination,
                        total: data.meta.total
                    }

                })))

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

        } finally {
            setLoading(false)
        }


    }

    function cleanSearchText(text) {
        let newText = text;
        if(text && text.value !== undefined) {
            newText = text.value;
        }

        return newText;
    }
    return (
            <DefaultTable
            title="Listagem de categorias"
            columns={columns}
            data={data}
            loading={loading}
            debounceSearchTime={500}
            options={{
                serverSide: true,
                responsive:'scrollMaxHeight',
                searchText : searchState.search,
                page:searchState.pagination.page -1,
                rowsPerPage: searchState.pagination.per_page,
                count: searchState.pagination.total,
                customToolbar: () => (
                    <FilterResetButton
                        handleClick={ () => {
                        setSearchState({
                            ...initialState,
                            search: {
                                value: initialState.search,
                                updated:true
                            } as any
                        });

                    }}
                    />
                ),
                onSearchChange: (value:string) => setSearchState( (prevState => ({
                    ...prevState,
                    search: value,
                    pagination : {
                        ...prevState.pagination,
                        page: 1
                    }

                }
                ))),
                onChangePage: (page:number) => setSearchState( (prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            page: page + 1,
                        }
                    }
                ))),
                onChangeRowsPerPage: (perPage:number) => setSearchState( (prevState => ({
                        ...prevState,
                        pagination: {
                            ...prevState.pagination,
                            per_page: perPage,
                        }
                    }
                ))),
                onColumnSortChange: (changedColumn:string, direction:string) => setSearchState( (prevState => ({
                        ...prevState,
                        order: {
                            sort:changedColumn,
                            dir: direction.includes('desc') ? 'desc' : 'asc',
                        }
                    }
                ))),


            }}
            />
    );
};

export default Table;