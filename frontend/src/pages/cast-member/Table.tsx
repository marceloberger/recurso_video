import * as React from 'react';

import {useEffect, useState} from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {CastMember, CastMemberTypeMap, ListResponse} from "../../util/models";
import castMemberHttp from "../../util/http/cast-member-http";
import DefaultTable, {makeActionsStyles, MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import {useSnackbar} from "notistack";
import {useRef} from "react";
import useFilter from "../../hooks/useFilter";
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import * as yup from "../../util/vendor/yup";
import {invert} from 'lodash';
import {useContext} from "react";
import LoadingContext from "../../components/loading/LoadingContext";



const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinitions:TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: '30%',
        options: {
            filter: false,
            sort:false
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
        name: "type",
        label: "Tipo",
        width: '4%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            },
            filterOptions: {
                names: castMemberNames
            },
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
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}>

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
    const [data, setData] = useState<CastMember[]>([]);
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
        tableRef,
        extraFilter: {
            createValidationSchema: () => {

                return yup.object().shape( {
                    type: yup.string()
                        .nullable()
                        .transform( value => {
                            return !value || !castMemberNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                });

        },
            formatSearchParams: (debouncedState) =>  {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.type &&
                        { type: debouncedState.extraFilter.type }
                    )

                } : undefined

            },
            getStateFromURL: (queryParams) =>  {
                return {
                    type: queryParams.get('type')
                }

            }
        }

    });

    const indexColumnType = columns.findIndex(c  => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const serverSideFilterList = columns.map( column => []);
    if(typeFilterValue) {
        serverSideFilterList[indexColumnType] = [typeFilterValue];
    }



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
        JSON.stringify(debouncedFilterState.extraFilter)
    ]);

    async function getData() {



        try {

            const {data} = await   castMemberHttp.list<ListResponse<CastMember>>( {
                queryParams: {
                    search: filterManager.cleanSearchText(debouncedFilterState.search),
                    page:debouncedFilterState.pagination.page,
                    per_page:debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.sort,
                    dir: debouncedFilterState.order.dir,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.type &&
                        {type: invert(CastMemberTypeMap)[debouncedFilterState.extraFilter.type]}
                    )
                }
            });

            if(subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);

            }


        } catch (error) {
            console.log(error);

            if(castMemberHttp.isCancelledRequest(error)) {
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
                title="Listagem de membros do elenco"
                columns={columns}
                data={data}
                loading={loading}
                debounceSearchTime={debouncedSearchTime}
                ref={tableRef}
                options={{
                    serverSideFilterList,
                    serverSide: true,
                    responsive:'scrollMaxHeight',
                    searchText : filterState.search as any,
                    page:filterState.pagination.page -1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList, type) => {
                        const columnIndex = columns.findIndex(c  => c.name === column)
                        filterManager.changeExtraFilter( {
                            [column]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
                        })

                    },
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

