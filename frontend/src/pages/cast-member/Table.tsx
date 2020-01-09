import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";


import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import {CastMember, ListResponse} from "../../util/models";

import castMemberHttp from "../../util/http/cast-member-http";

const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
};

const columnsDefinitions:MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {

                return <span> {
                    format(parseISO(value), 'dd/MM/yyyy')
                } </span>

            }
        }

    }


];



type Props = {

};
const Table = (props: Props) => {

    const [data, setData] = useState<CastMember[]>([]);

    useEffect( () => {

        let isSubscribed = true;

        (async () => {
            const {data} = await  castMemberHttp.list<ListResponse<CastMember>>();

            if(isSubscribed) {
                setData(data.data);
            }

        })();

        return () => {
            isSubscribed = false;
        }

    }, []);
    return (
        <MUIDataTable
            title="Listagem de membros do elenco"
            columns={columnsDefinitions}
            data={data}/>
    );
};

export default Table;