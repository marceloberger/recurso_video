import {Category, Genre} from "./models";

export function  getGenresFromCategory(genres:Genre[], category:Category) {

        if(genres === undefined || genres.length === 0  || category === undefined ) {
                return;
        }

        return genres.filter(
            genre => {

                    if(genre != undefined && genre.categories != undefined && genre.categories.length > 0 ) {
                            return genre.categories.filter(cat => cat.id === category.id).length !== 0
                    }


            })




}