import { ArrayMinSize, IsNotEmpty, IsString } from "class-validator";
import { Evento } from "../interfaces/categoria.interface";


export class CriarCategoriaDto{

    @IsString()
    @IsNotEmpty()
    readonly categoria: string;


    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsNotEmpty()
    @ArrayMinSize(1)
    eventos: Array<Evento>;

}