import reducer from "./upload";
import {createStore} from "redux";

const store = createStore(
    reducer

);

export default store;